import p5 from 'p5';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

type Bounds = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

type BackdropGeometry = {
  contentBox: Bounds;
  viewport: Bounds;
};

type P5WithBackdropGeometry = p5 & {
  backdropGeometry: BackdropGeometry;
};

type P5BackdropProps = {
  targetRef: RefObject<HTMLElement | null>;
};

const emptyBounds: Bounds = {
  xMin: 0,
  xMax: 0,
  yMin: 0,
  yMax: 0,
};

const gradientCurve = {
  firstStop: 0.0,
  firstValue: 0.0,
  secondStop: 0.0,
  secondValue: 0.0,
  thirdStop: 1,
  thirdValue: 1,
  radialModulo: 30,
  radialLineThickness: 0.4,
};

const vertexShader = `
precision highp float;

attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform vec4 uContentBox;
uniform vec4 uViewport;
uniform vec4 uCurve;
uniform vec2 uCurveTail;
uniform vec2 uRadialLines;

float curve(float value) {
  float firstStop = uCurve.x;
  float firstValue = uCurve.y;
  float secondStop = uCurve.z;
  float secondValue = uCurve.w;
  float thirdStop = uCurveTail.x;
  float thirdValue = uCurveTail.y;

  if (value <= firstStop) {
    return mix(0.0, firstValue, smoothstep(0.0, firstStop, value));
  }

  if (value <= secondStop) {
    return mix(firstValue, secondValue, smoothstep(firstStop, secondStop, value));
  }

  if (value <= thirdStop) {
    return mix(secondValue, thirdValue, smoothstep(secondStop, thirdStop, value));
  }

  return mix(thirdValue, 1.0, smoothstep(thirdStop, 1.0, value));
}

float distanceToRect(vec2 point, vec2 rectMin, vec2 rectMax) {
  vec2 closest = clamp(point, rectMin, rectMax);

  return length(point - closest);
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, uViewport.w - gl_FragCoord.y);
  vec2 rectMin = uContentBox.xz;
  vec2 rectMax = uContentBox.yw;
  vec2 closest = clamp(pixel, rectMin, rectMax);
  vec2 fromBox = pixel - closest;
  float distanceFromBox = length(fromBox);
  float maxDistance = max(
    max(
      distanceToRect(vec2(uViewport.x, uViewport.z), rectMin, rectMax),
      distanceToRect(vec2(uViewport.y, uViewport.z), rectMin, rectMax)
    ),
    max(
      distanceToRect(vec2(uViewport.x, uViewport.w), rectMin, rectMax),
      distanceToRect(vec2(uViewport.y, uViewport.w), rectMin, rectMax)
    )
  );
  float t = clamp(distanceFromBox / max(maxDistance, 1.0), 0.0, 1.0);

  float interpolation = curve(t);
  float moduloCount = max(uRadialLines.x, 1.0);
  float lineThickness = clamp(uRadialLines.y, 0.0, 0.5);
  float linePhase = mod(interpolation * moduloCount, 1.0);
  float lineDistance = min(linePhase, 1.0 - linePhase);
  float lineMask = 1.0 - smoothstep(lineThickness, lineThickness + 0.006, lineDistance);
  vec3 black = vec3(17.0 / 255.0);
  vec3 white = vec3(1.0);
  vec3 gradientColor = mix(black, white, interpolation);

  gl_FragColor = vec4(mix(black, gradientColor, lineMask), 1.0);
}
`;

function getViewportBounds(): Bounds {
  return {
    xMin: 0,
    xMax: window.innerWidth,
    yMin: 0,
    yMax: window.innerHeight,
  };
}

function getContentBounds(element: HTMLElement | null): Bounds {
  if (!element) {
    return emptyBounds;
  }

  const rect = element.getBoundingClientRect();

  return {
    xMin: rect.left,
    xMax: rect.right,
    yMin: rect.top,
    yMax: rect.bottom,
  };
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('Unable to create backdrop shader.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'Unable to compile backdrop shader.');
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const program = gl.createProgram();

  if (!program) {
    throw new Error('Unable to create backdrop shader program.');
  }

  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader));
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'Unable to link backdrop shader program.');
  }

  return program;
}

export function P5Backdrop({ targetRef }: P5BackdropProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const geometryRef = useRef<BackdropGeometry>({
    contentBox: emptyBounds,
    viewport: emptyBounds,
  });

  useEffect(() => {
    function updateGeometry() {
      geometryRef.current = {
        contentBox: getContentBounds(targetRef.current),
        viewport: getViewportBounds(),
      };
    }

    updateGeometry();

    const sketch = (p: p5) => {
      const backdrop = p as P5WithBackdropGeometry;
      let gl: WebGLRenderingContext;
      let program: WebGLProgram;
      let positionBuffer: WebGLBuffer;
      let positionLocation: number;
      let contentBoxLocation: WebGLUniformLocation | null;
      let viewportLocation: WebGLUniformLocation | null;
      let curveLocation: WebGLUniformLocation | null;
      let curveTailLocation: WebGLUniformLocation | null;
      let radialLinesLocation: WebGLUniformLocation | null;

      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);
        canvas.parent(hostRef.current as HTMLDivElement);
        p.pixelDensity(1);
        gl = p.drawingContext as WebGLRenderingContext;
        program = createProgram(gl);
        positionBuffer = gl.createBuffer() as WebGLBuffer;
        positionLocation = gl.getAttribLocation(program, 'aPosition');
        contentBoxLocation = gl.getUniformLocation(program, 'uContentBox');
        viewportLocation = gl.getUniformLocation(program, 'uViewport');
        curveLocation = gl.getUniformLocation(program, 'uCurve');
        curveTailLocation = gl.getUniformLocation(program, 'uCurveTail');
        radialLinesLocation = gl.getUniformLocation(program, 'uRadialLines');

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 3, -1, -1, 3]),
          gl.STATIC_DRAW,
        );
      };

      p.draw = () => {
        updateGeometry();
        backdrop.backdropGeometry = geometryRef.current;
        gl.viewport(0, 0, p.width, p.height);
        gl.disable(gl.DEPTH_TEST);
        gl.useProgram(program);
        gl.uniform4f(
          contentBoxLocation,
          backdrop.backdropGeometry.contentBox.xMin,
          backdrop.backdropGeometry.contentBox.xMax,
          backdrop.backdropGeometry.contentBox.yMin,
          backdrop.backdropGeometry.contentBox.yMax,
        );
        gl.uniform4f(
          viewportLocation,
          backdrop.backdropGeometry.viewport.xMin,
          backdrop.backdropGeometry.viewport.xMax,
          backdrop.backdropGeometry.viewport.yMin,
          backdrop.backdropGeometry.viewport.yMax,
        );
        gl.uniform4f(
          curveLocation,
          gradientCurve.firstStop,
          gradientCurve.firstValue,
          gradientCurve.secondStop,
          gradientCurve.secondValue,
        );
        gl.uniform2f(curveTailLocation, gradientCurve.thirdStop, gradientCurve.thirdValue);
        gl.uniform2f(
          radialLinesLocation,
          gradientCurve.radialModulo,
          gradientCurve.radialLineThickness,
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      p.windowResized = () => {
        updateGeometry();
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };

    const instance = new p5(sketch);
    const resizeObserver = new ResizeObserver(updateGeometry);

    if (targetRef.current) {
      resizeObserver.observe(targetRef.current);
    }

    window.addEventListener('resize', updateGeometry);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateGeometry);
      instance.remove();
    };
  }, [targetRef]);

  return <div className="p5-backdrop" ref={hostRef} aria-hidden="true" />;
}
