import p5 from 'p5';
import { useEffect, useRef } from 'react';

type HomeItemId = 'software' | 'creative' | 'music';

type HomeItem = {
  id: HomeItemId;
  label: string;
};

type P5HomeProps = {
  items: HomeItem[];
  onNavigate: (id: HomeItemId) => void;
};

type RowLayout = {
  id: 'title' | HomeItemId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interactive: boolean;
  weight: number;
};

type SdfPassConfig = {
  enabled: boolean;
  spread: number;
  seedThreshold: number;
  showLines: boolean;
  thresholdLines: boolean;
  invert: boolean;
  lineModulo: number;
  lineThickness: number;
  cutoffMin: number;
  cutoffMax: number;
  noiseAmplitude: number;
  noiseFrequency: number;
  lineColor: string;
  pulseWidth: number;
  pulseSpeed: number;
  pulseInterval: number;
  pulseColor: string;
  pulsePingPong: boolean;
};

type SdfConfig = {
  resolutionScale: number;
  passes: [SdfPassConfig, SdfPassConfig];
};

type SdfField = {
  width: number;
  height: number;
  distances: Float32Array;
  sourceScale: number;
};

type SdfPassRender = {
  config: SdfPassConfig;
  image: p5.Image;
  pulsePixels: Uint32Array;
  pulsePositions: Float32Array;
};

const title = 'Max Pleaner';
const fontStack =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
const sdfPresets = {
  noisyLineField: {
    resolutionScale: 1,
    passes: [
      {
        enabled: true,
        spread: 820,
        seedThreshold: 150,
        showLines: true,
        thresholdLines: true,
        invert: false,
        lineModulo: 48,
        lineThickness: 0.11,
        cutoffMin: 0.06,
        cutoffMax: 1,
        noiseAmplitude: 80,
        noiseFrequency: 0.027,
        lineColor: '#545454',
        pulseWidth: 0.02,
        pulseSpeed: 0.2,
        pulseInterval: 4,
        pulseColor: '#000000',
        pulsePingPong: false,
      },
      {
        enabled: false,
        spread: 220,
        seedThreshold: 24,
        showLines: false,
        thresholdLines: false,
        invert: false,
        lineModulo: 24,
        lineThickness: 0.12,
        cutoffMin: 0,
        cutoffMax: 1,
        noiseAmplitude: 0,
        noiseFrequency: 0.012,
        lineColor: '#ffffff',
        pulseWidth: 0,
        pulseSpeed: 0,
        pulseInterval: 2,
        pulseColor: '#000000',
        pulsePingPong: false,
      },
    ],
  },
} satisfies Record<string, SdfConfig>;

const defaultSdfConfig: SdfConfig = sdfPresets.noisyLineField;

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getHomeOffset(width: number) {
  if (width <= 640) {
    return clamp(42, width * 0.14, 72);
  }

  return clamp(72, width * 0.095, 140);
}

function getLayout(
  p: p5 | p5.Graphics,
  items: HomeItem[],
  width: number,
  height: number,
): RowLayout[] {
  const fontSize = clamp(26, width * 0.05, 44);
  const paddingX = clamp(20, width * 0.05, 56);
  const paddingY = 22;
  const rowHeight = fontSize * 0.95 + paddingY * 2;
  const rowGap = clamp(56, height * 0.105, 110);
  const homeOffset = getHomeOffset(width);
  const rows = [{ id: 'title' as const, label: title }, ...items];
  const totalHeight = rows.length * rowHeight + (rows.length - 1) * rowGap;
  const startY = (height - totalHeight) / 2;

  p.textFont(fontStack);
  p.textSize(fontSize);

  return rows.map((row, index) => {
    const interactive = row.id !== 'title';
    const textWidth = p.textWidth(row.label);
    const rowWidth = textWidth + paddingX * 2;
    const centeredX = (width - rowWidth) / 2;
    const x =
      row.id === 'title'
        ? centeredX
        : centeredX + homeOffset * (index % 2 === 1 ? 1 : -1);

    return {
      ...row,
      x,
      y: startY + index * (rowHeight + rowGap),
      width: rowWidth,
      height: rowHeight,
      interactive,
      weight: row.id === 'title' ? 900 : 700,
    };
  });
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }

  const t = clamp(0, (value - edge0) / (edge1 - edge0), 1);

  return t * t * (3 - 2 * t);
}

function sampleFalloff(value: number) {
  return 1 - smoothstep(0, 1, value);
}

function samplePulse(t: number, elapsedSeconds: number, config: SdfPassConfig) {
  if (config.pulseWidth <= 0 || config.pulseSpeed <= 0 || config.pulseInterval <= 0) {
    return 0;
  }

  const pulseProgress = (elapsedSeconds % config.pulseInterval) * config.pulseSpeed;
  const pulseCenter = config.pulsePingPong
    ? 1 - Math.abs(1 - (pulseProgress % 2))
    : pulseProgress;

  if (pulseCenter > 1 + config.pulseWidth) {
    return 0;
  }

  return Math.abs(t - pulseCenter) <= config.pulseWidth / 2 ? 1 : 0;
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

function distanceTransform1d(input: Float32Array, output: Float32Array, length: number) {
  const positions = new Int32Array(length);
  const boundaries = new Float32Array(length + 1);
  let k = 0;

  positions[0] = 0;
  boundaries[0] = Number.NEGATIVE_INFINITY;
  boundaries[1] = Number.POSITIVE_INFINITY;

  for (let q = 1; q < length; q += 1) {
    let intersection =
      (input[q] + q * q - (input[positions[k]] + positions[k] * positions[k])) /
      (2 * q - 2 * positions[k]);

    while (intersection <= boundaries[k]) {
      k -= 1;
      intersection =
        (input[q] + q * q - (input[positions[k]] + positions[k] * positions[k])) /
        (2 * q - 2 * positions[k]);
    }

    k += 1;
    positions[k] = q;
    boundaries[k] = intersection;
    boundaries[k + 1] = Number.POSITIVE_INFINITY;
  }

  k = 0;

  for (let q = 0; q < length; q += 1) {
    while (boundaries[k + 1] < q) {
      k += 1;
    }

    const distance = q - positions[k];
    output[q] = distance * distance + input[positions[k]];
  }
}

function createDistanceField(
  source: p5.Graphics | p5.Image,
  seedThreshold: number,
  sourceScale: number,
): SdfField {
  const width = source.width;
  const height = source.height;
  const infinity = 1e12;
  const seeds = new Float32Array(width * height);
  const columnInput = new Float32Array(height);
  const columnOutput = new Float32Array(height);
  const rowInput = new Float32Array(width);
  const rowOutput = new Float32Array(width);
  const partial = new Float32Array(width * height);
  const distances = new Float32Array(width * height);

  source.loadPixels();

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const brightness =
        source.pixels[pixelIndex] * 0.299 +
        source.pixels[pixelIndex + 1] * 0.587 +
        source.pixels[pixelIndex + 2] * 0.114;

      seeds[y * width + x] = brightness >= seedThreshold ? 0 : infinity;
    }
  }

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      columnInput[y] = seeds[y * width + x];
    }

    distanceTransform1d(columnInput, columnOutput, height);

    for (let y = 0; y < height; y += 1) {
      partial[y * width + x] = columnOutput[y];
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      rowInput[x] = partial[y * width + x];
    }

    distanceTransform1d(rowInput, rowOutput, width);

    for (let x = 0; x < width; x += 1) {
      distances[y * width + x] = rowOutput[x];
    }
  }

  return {
    width,
    height,
    distances,
    sourceScale,
  };
}

function renderSdfLinePass(
  field: SdfField,
  p: p5,
  config: SdfPassConfig,
) {
  const image = p.createImage(field.width, field.height);
  const pulsePixelList: number[] = [];
  const pulsePositionList: number[] = [];
  const scaledSpread = config.spread * field.sourceScale;
  const lineColor = parseHexColor(config.lineColor);

  image.loadPixels();

  for (let y = 0; y < field.height; y += 1) {
    for (let x = 0; x < field.width; x += 1) {
      const fieldIndex = y * field.width + x;
      const pixelIndex = fieldIndex * 4;
      const distance = Math.sqrt(field.distances[fieldIndex]);
      const noise =
        config.noiseAmplitude === 0
          ? 0
          : (p.noise(x * config.noiseFrequency, y * config.noiseFrequency) - 0.5) *
            config.noiseAmplitude *
            field.sourceScale;
      const rawT = Math.max(0, distance + noise) / scaledSpread;
      const t = clamp(0, rawT, 1);
      const brightness = sampleFalloff(t);
      const phase = (t * config.lineModulo) % 1;
      const lineDistance = Math.min(phase, 1 - phase);
      const cutoffMin = Math.min(config.cutoffMin, config.cutoffMax);
      const cutoffMax = Math.max(config.cutoffMin, config.cutoffMax);
      const withinLineCutoff = rawT < 1 && t >= cutoffMin && t <= cutoffMax;
      const thresholdBand = withinLineCutoff && lineDistance <= config.lineThickness ? 1 : 0;
      const lineMask = config.invert ? 1 - thresholdBand : thresholdBand;
      const thresholdLineBackground = config.invert ? 1 : 0;
      const line = config.thresholdLines
        ? lineMask + (1 - lineMask) * thresholdLineBackground
        : brightness * lineMask;
      const output = config.showLines ? line : brightness;
      const value = Math.round((config.invert && !config.thresholdLines ? 1 - output : output) * 255);

      if (config.showLines && thresholdBand > 0) {
        pulsePixelList.push(pixelIndex);
        pulsePositionList.push(t);
      }

      image.pixels[pixelIndex] = config.showLines && thresholdBand > 0 ? lineColor[0] : value;
      image.pixels[pixelIndex + 1] = config.showLines && thresholdBand > 0 ? lineColor[1] : value;
      image.pixels[pixelIndex + 2] = config.showLines && thresholdBand > 0 ? lineColor[2] : value;
      image.pixels[pixelIndex + 3] = 255;
    }
  }

  image.updatePixels();

  return {
    image,
    pulsePixels: Uint32Array.from(pulsePixelList),
    pulsePositions: Float32Array.from(pulsePositionList),
  };
}

function buildSdfPassPipeline(
  source: p5.Graphics,
  p: p5,
  config: SdfConfig,
  sourceScale: number,
) {
  const pipeline: SdfPassRender[] = [];
  let image: p5.Image | null = null;

  config.passes.forEach((pass) => {
    if (!pass.enabled || pass.spread <= 0) {
      return;
    }

    const field = createDistanceField(image ?? source, pass.seedThreshold, sourceScale);
    const nextPass = renderSdfLinePass(field, p, pass);

    pipeline.push({ config: pass, ...nextPass });
    image = image ? compositeMax(image, nextPass.image, p) : nextPass.image;
  });

  return pipeline;
}

function compositeMax(base: p5.Image, overlay: p5.Image, p: p5) {
  const image = p.createImage(base.width, base.height);

  base.loadPixels();
  overlay.loadPixels();
  image.loadPixels();

  for (let index = 0; index < image.pixels.length; index += 4) {
    image.pixels[index] = Math.max(base.pixels[index], overlay.pixels[index]);
    image.pixels[index + 1] = Math.max(base.pixels[index + 1], overlay.pixels[index + 1]);
    image.pixels[index + 2] = Math.max(base.pixels[index + 2], overlay.pixels[index + 2]);
    image.pixels[index + 3] = 255;
  }

  image.updatePixels();

  return image;
}

function renderSdfPasses(
  pipeline: SdfPassRender[],
  p: p5,
) {
  let image: p5.Image | null = null;

  pipeline.forEach((pass) => {
    image = image ? compositeMax(image, pass.image, p) : pass.image;
  });

  return image;
}

function renderSdfPulseFrame(
  pipeline: SdfPassRender[],
  baseImage: p5.Image,
  p: p5,
  elapsedSeconds: number,
) {
  const image = p.createImage(baseImage.width, baseImage.height);

  baseImage.loadPixels();
  image.loadPixels();

  for (let index = 0; index < baseImage.pixels.length; index += 1) {
    image.pixels[index] = baseImage.pixels[index];
  }

  pipeline.forEach(({ config, pulsePixels, pulsePositions }) => {
    if (config.pulseWidth <= 0 || config.pulseSpeed <= 0 || config.pulseInterval <= 0) {
      return;
    }

    const pulseColor = parseHexColor(config.pulseColor);

    for (let index = 0; index < pulsePositions.length; index += 1) {
      const t = pulsePositions[index];

      if (samplePulse(t, elapsedSeconds, config) > 0) {
        const pixelIndex = pulsePixels[index];
        image.pixels[pixelIndex] = pulseColor[0];
        image.pixels[pixelIndex + 1] = pulseColor[1];
        image.pixels[pixelIndex + 2] = pulseColor[2];
      }
    }
  });

  image.updatePixels();

  return image;
}

function hasPulseAnimation(config: SdfConfig) {
  return config.passes.some((pass) => {
    return pass.enabled && pass.showLines && pass.pulseWidth > 0 && pass.pulseSpeed > 0;
  });
}

export function P5Home({ items, onNavigate }: P5HomeProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5 | null>(null);
  const layoutRef = useRef<RowLayout[]>([]);
  const navigateRef = useRef(onNavigate);
  const config = defaultSdfConfig;

  useEffect(() => {
    navigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    const sketch = (p: p5) => {
      let hoveredRowId: HomeItemId | null = null;
      let baseSdfImage: p5.Image | null = null;
      let sdfImage: p5.Image | null = null;
      let sdfPipeline: SdfPassRender[] = [];
      let resizeTimer: number | null = null;

      function getInteractiveRow() {
        return layoutRef.current.find((row) => {
          return (
            row.interactive &&
            p.mouseX >= row.x &&
            p.mouseX <= row.x + row.width &&
            p.mouseY >= row.y &&
            p.mouseY <= row.y + row.height
          );
        });
      }

      function updateHover() {
        const row = getInteractiveRow();
        const nextHoveredRowId = row && row.id !== 'title' ? row.id : null;

        if (nextHoveredRowId !== hoveredRowId) {
          hoveredRowId = nextHoveredRowId;
          renderHome();
        }

        p.cursor(hoveredRowId ? p.HAND : p.ARROW);
      }

      function drawContentRows(
        surface: p5 | p5.Graphics,
        rows: RowLayout[],
        useMask: boolean,
        layoutWidth: number,
      ) {
        surface.textFont(fontStack);
        surface.textAlign('left', 'center');
        surface.noStroke();

        rows.forEach((row) => {
          const fontSize = clamp(26, layoutWidth * 0.05, 44);
          const paddingX = clamp(20, layoutWidth * 0.05, 56);
          const isHovered = row.id === hoveredRowId;
          const isLink = row.interactive;
          const labelX = row.x + paddingX;
          const labelY = row.y + row.height / 2;
          const textWidth = surface.textWidth(row.label);

          surface.fill(useMask ? '#ffffff' : isHovered ? '#39e476' : isLink ? '#20c05c' : '#f4f1ea');
          surface.textStyle('bold');
          surface.textSize(fontSize);
          surface.text(row.label, labelX, labelY);

          if (isLink) {
            const underlineY = labelY + fontSize * 0.45;
            surface.stroke(useMask ? '#ffffff' : isHovered ? '#39e476' : '#20c05c');
            surface.strokeWeight(Math.max(1, fontSize * 0.055));
            surface.line(labelX, underlineY, labelX + textWidth, underlineY);
            surface.noStroke();
          }
        });
      }

      function renderHome() {
        const rows = getLayout(p, items, p.width, p.height);
        layoutRef.current = rows;

        p.background('#111111');

        if (sdfImage) {
          p.image(sdfImage, 0, 0, p.width, p.height);
        }

        drawContentRows(p, rows, false, p.width);
      }

      function rebuildDistanceField() {
        const scale = config.resolutionScale;
        const useFullResolution = scale >= 0.99;
        const width = useFullResolution ? p.width : Math.max(1, Math.round(p.width * scale));
        const height = useFullResolution ? p.height : Math.max(1, Math.round(p.height * scale));
        const mask = p.createGraphics(width, height);
        const rows = getLayout(p, items, p.width, p.height);

        mask.pixelDensity(1);
        mask.background('#000000');

        if (!useFullResolution) {
          mask.push();
          mask.scale(scale);
        }

        drawContentRows(mask, rows, true, p.width);

        if (!useFullResolution) {
          mask.pop();
        }

        sdfPipeline = buildSdfPassPipeline(mask, p, config, useFullResolution ? 1 : scale);
        baseSdfImage = renderSdfPasses(sdfPipeline, p);
        sdfImage = baseSdfImage;
        mask.remove();
        renderHome();

        if (hasPulseAnimation(config)) {
          p.loop();
        } else {
          p.noLoop();
        }
      }

      function scheduleDistanceFieldRebuild() {
        if (resizeTimer) {
          window.clearTimeout(resizeTimer);
        }

        resizeTimer = window.setTimeout(rebuildDistanceField, 160);
      }

      p.setup = () => {
        const host = hostRef.current as HTMLDivElement;
        const canvas = p.createCanvas(host.clientWidth, host.clientHeight);
        canvas.parent(hostRef.current as HTMLDivElement);
        canvas.elt.addEventListener('mouseleave', () => {
          hoveredRowId = null;
          p.cursor(p.ARROW);
          renderHome();
        });
        p.pixelDensity(1);
        rebuildDistanceField();
      };

      p.draw = () => {
        if (!sdfPipeline.length || !baseSdfImage || !hasPulseAnimation(config)) {
          return;
        }

        sdfImage = renderSdfPulseFrame(sdfPipeline, baseSdfImage, p, p.millis() / 1000);
        renderHome();
      };

      p.windowResized = () => {
        const host = hostRef.current as HTMLDivElement;
        p.resizeCanvas(host.clientWidth, host.clientHeight);
        renderHome();
        scheduleDistanceFieldRebuild();
      };

      p.mouseMoved = () => {
        updateHover();
      };

      p.mouseClicked = () => {
        const row = getInteractiveRow();

        if (row && row.id !== 'title') {
          navigateRef.current(row.id);
        }
      };
    };

    sketchRef.current = new p5(sketch);

    return () => {
      sketchRef.current?.remove();
      sketchRef.current = null;
    };
  }, [items, config]);

  return (
    <div className="p5-home" ref={hostRef}>
      <nav className="p5-home-nav visually-hidden" aria-label="Website sections">
        {items.map((item) => (
          <a
            href={`#${item.id}`}
            key={item.id}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(item.id);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
