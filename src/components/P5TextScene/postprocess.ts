import p5 from 'p5';

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseHexColor(color: string): [number, number, number] {
  const normalized = color.replace('#', '');

  if (!/^[\da-f]{6}$/i.test(normalized)) {
    return [0, 0, 0];
  }

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

const VERTEX_SHADER = `
precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = vec4(aPosition, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;
uniform float uRadius;
uniform float uEdgeSoftness;
uniform float uIntensity;
uniform float uRgbSplit;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uLineJitter;
uniform float uColorMix;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec4 base = texture2D(uTexture, vTexCoord);
  vec2 pixel = vTexCoord * uResolution;
  float distanceFromMouse = distance(pixel, uMouse);
  float mouseMask = 1.0 - smoothstep(uRadius - uEdgeSoftness, uRadius, distanceFromMouse);

  if (mouseMask <= 0.0) {
    gl_FragColor = base;
    return;
  }

  float time = uTime * uNoiseSpeed;
  float scanNoise = noise(vec2(pixel.y * uNoiseScale * 3.7, time * 0.7));
  float noiseA = noise(pixel * uNoiseScale + vec2(time * 0.15, time * 0.11));
  float noiseB = noise(pixel * uNoiseScale * 1.37 + vec2(13.1, 7.7) + time * 0.23);
  float noiseC = noise(pixel * uNoiseScale * 0.79 + vec2(3.4, 19.2) - time * 0.17);
  float lineJitter = (scanNoise - 0.5) * 2.0 * uLineJitter * mouseMask;
  vec2 offset = vec2(
    ((noiseA - 0.5) * 2.0 * uIntensity + lineJitter) * mouseMask,
    ((noiseB - 0.5) * 2.0 * uIntensity * 0.55 + lineJitter * 0.35) * mouseMask
  );

  vec2 redUv = clamp((pixel + offset + vec2(uRgbSplit, 0.0)) / uResolution, 0.0, 1.0);
  vec2 greenUv = clamp((pixel + offset * 0.6) / uResolution, 0.0, 1.0);
  vec2 blueUv = clamp((pixel + offset - vec2(uRgbSplit, 0.0)) / uResolution, 0.0, 1.0);

  vec3 splitColor = vec3(
    texture2D(uTexture, redUv).r,
    texture2D(uTexture, greenUv).g,
    texture2D(uTexture, blueUv).b
  );

  vec3 palette = mix(uColorA, uColorB, smoothstep(0.0, 0.5, noiseC));
  palette = mix(palette, uColorC, smoothstep(0.45, 1.0, noiseC));

  vec3 color = mix(splitColor, palette, uColorMix * mouseMask);
  gl_FragColor = vec4(color, base.a);
}
`;

export type MouseGlitchPostprocessConfig = {
  enabled: boolean;
  radius: number;
  edgeSoftness: number;
  intensity: number;
  rgbSplit: number;
  colorMix: number;
  noiseScale: number;
  noiseSpeed: number;
  lineJitter: number;
  colorA: string;
  colorB: string;
  colorC: string;
};

export const defaultMouseGlitchPostprocessConfig: MouseGlitchPostprocessConfig = {
  enabled: false,
  radius: 160,
  edgeSoftness: 1.5,
  intensity: 12,
  rgbSplit: 2,
  colorMix: 0.25,
  noiseScale: 0.035,
  noiseSpeed: 0.9,
  lineJitter: 8,
  colorA: '#ffffff',
  colorB: '#00ff66',
  colorC: '#ff4de1',
};

export type MouseGlitchPointer = {
  x: number;
  y: number;
} | null;

type GlitchRuntime = {
  buffer: p5.Graphics;
  shader: p5.Shader;
  width: number;
  height: number;
};

const runtimeCache = new WeakMap<p5, GlitchRuntime>();

function getGlitchRuntime(p: p5, width: number, height: number) {
  const cached = runtimeCache.get(p);

  if (cached && cached.width === width && cached.height === height) {
    return cached;
  }

  cached?.buffer.remove();

  const buffer = p.createGraphics(width, height, p.WEBGL);
  buffer.pixelDensity(1);
  buffer.noStroke();

  const shader = buffer.createShader(VERTEX_SHADER, FRAGMENT_SHADER);
  const runtime = { buffer, shader, width, height };
  runtimeCache.set(p, runtime);

  return runtime;
}

export function applyMouseGlitchPostprocess(
  source: p5.Graphics | p5.Image,
  p: p5,
  pointer: MouseGlitchPointer,
  elapsedSeconds: number,
  config: MouseGlitchPostprocessConfig,
) {
  if (!config.enabled || !pointer || config.radius <= 0 || config.intensity <= 0) {
    return source;
  }

  const runtime = getGlitchRuntime(p, source.width, source.height);
  const buffer = runtime.buffer;
  const shader = runtime.shader;

  buffer.clear();
  buffer.shader(shader);
  shader.setUniform('uTexture', source);
  shader.setUniform('uResolution', [source.width, source.height]);
  shader.setUniform('uMouse', [pointer.x, pointer.y]);
  shader.setUniform('uTime', elapsedSeconds);
  shader.setUniform('uRadius', config.radius);
  shader.setUniform('uEdgeSoftness', Math.max(0.5, config.edgeSoftness));
  shader.setUniform('uIntensity', config.intensity);
  shader.setUniform('uRgbSplit', config.rgbSplit);
  shader.setUniform('uNoiseScale', config.noiseScale);
  shader.setUniform('uNoiseSpeed', config.noiseSpeed);
  shader.setUniform('uLineJitter', config.lineJitter);
  shader.setUniform('uColorMix', clamp(0, config.colorMix, 1));
  shader.setUniform('uColorA', parseHexColor(config.colorA));
  shader.setUniform('uColorB', parseHexColor(config.colorB));
  shader.setUniform('uColorC', parseHexColor(config.colorC));

  buffer.rect(-source.width / 2, -source.height / 2, source.width, source.height);

  return buffer;
}
