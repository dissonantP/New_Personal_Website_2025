import p5 from 'p5';

import type { HomeTextContent } from './types';
import type { TextSceneEffects } from '../P5TextScene/types';

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
  startColor: string;
  endColor: string;
  gradientPow: number;
  firstLineColor: string;
  firstLineColorWidth: number;
  firstLineColorStart: number;
  bandColor: string;
  bandCenter: number;
  bandWidth: number;
  bandCenterAmt: number;
  bandCenterSpeed: number;
  pulseWidth: number;
  pulseSpeed: number;
  pulseInterval: number;
  pulseStart: number;
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

export type HomeEffectState = {
  pipeline: SdfPassRender[];
  baseImage: p5.Image | null;
  animate: boolean;
};

const sdfPresets = {
  noisyLineField: {
    resolutionScale: 1,
    passes: [
      {
        enabled: true,
        spread: 750,
        seedThreshold: 100,
        showLines: true,
        thresholdLines: true,
        invert: false,
        lineModulo: 48,
        lineThickness: 0.11,
        cutoffMin: 0.06,
        cutoffMax: 1,
        noiseAmplitude: 80,
        noiseFrequency: 0.027,
        startColor: '#111111',
        endColor: '#FFFFFF',
        gradientPow: 2,
        firstLineColor: '#000000',
        firstLineColorWidth: 0.08,
        firstLineColorStart: 0,
        bandColor: '#888888',
        bandCenter: 0.2,
        bandWidth: 0.02,
        bandCenterAmt: 0.0,
        bandCenterSpeed: 0.5,
        pulseWidth: 0.03,
        pulseSpeed: 0.6,
        pulseInterval: 4.0,
        pulseStart: 0.2,
        pulseColor: '#444444',
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
        startColor: '#ffffff',
        endColor: '#ffffff',
        gradientPow: 1,
        firstLineColor: '#ffffff',
        firstLineColorWidth: 0,
        firstLineColorStart: 0,
        bandColor: '#ffffff',
        bandCenter: 0,
        bandWidth: 0,
        bandCenterAmt: 0,
        bandCenterSpeed: 0,
        pulseWidth: 0,
        pulseSpeed: 0,
        pulseInterval: 2,
        pulseStart: 0,
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

function samplePulseAmount(t: number, elapsedSeconds: number, config: SdfPassConfig) {
  if (config.pulseWidth <= 0 || config.pulseSpeed <= 0 || config.pulseInterval <= 0) {
    return 0;
  }

  const pulseProgress = (elapsedSeconds % config.pulseInterval) * config.pulseSpeed;
  const pulseCenter = config.pulsePingPong
    ? config.pulseStart + (1 - config.pulseStart) * (1 - Math.abs(1 - (pulseProgress % 2)))
    : config.pulseStart + pulseProgress;

  if (pulseCenter > 1 + config.pulseWidth) {
    return 0;
  }

  const distanceFromCenter = Math.abs(t - pulseCenter);
  const halfWidth = config.pulseWidth / 2;

  if (distanceFromCenter > halfWidth) {
    return 0;
  }

  return 1 - distanceFromCenter / halfWidth;
}

function hasAnimatedBand(config: SdfPassConfig) {
  return config.bandWidth > 0 && config.bandCenterAmt > 0 && config.bandCenterSpeed > 0;
}

function sampleBandCenter(config: SdfPassConfig, elapsedSeconds: number) {
  if (!hasAnimatedBand(config)) {
    return config.bandCenter;
  }

  return clamp(
    0,
    config.bandCenter + Math.sin(elapsedSeconds * config.bandCenterSpeed * Math.PI * 2) * config.bandCenterAmt,
    1,
  );
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

function lerpColor(
  start: [number, number, number],
  end: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(start[0] + (end[0] - start[0]) * t),
    Math.round(start[1] + (end[1] - start[1]) * t),
    Math.round(start[2] + (end[2] - start[2]) * t),
  ];
}

function sampleGradientT(t: number, pow: number) {
  if (pow <= 0) {
    return t;
  }

  return Math.pow(clamp(0, t, 1), pow);
}

function sampleLineColor(
  t: number,
  startColor: [number, number, number],
  endColor: [number, number, number],
  firstLineColor: [number, number, number],
  firstLineColorStart: number,
  firstLineColorWidth: number,
  bandColor: [number, number, number],
  bandCenter: number,
  bandWidth: number,
  gradientPow: number,
) {
  if (firstLineColorWidth > 0 && t >= firstLineColorStart && t <= firstLineColorStart + firstLineColorWidth) {
    return firstLineColor;
  }

  if (bandWidth > 0) {
    const halfBandWidth = bandWidth / 2;

    if (t >= bandCenter - halfBandWidth && t <= bandCenter + halfBandWidth) {
      return bandColor;
    }
  }

  return lerpColor(startColor, endColor, sampleGradientT(t, gradientPow));
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

function renderSdfLinePass(field: SdfField, p: p5, config: SdfPassConfig) {
  const image = p.createImage(field.width, field.height);
  const pulsePixelList: number[] = [];
  const pulsePositionList: number[] = [];
  const scaledSpread = config.spread * field.sourceScale;
  const startColor = parseHexColor(config.startColor);
  const endColor = parseHexColor(config.endColor);
  const firstLineColor = parseHexColor(config.firstLineColor);
  const bandColor = parseHexColor(config.bandColor);

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

      const lineColor = sampleLineColor(
        t,
        startColor,
        endColor,
        firstLineColor,
        config.firstLineColorStart,
        config.firstLineColorWidth,
        bandColor,
        config.bandCenter,
        config.bandWidth,
        config.gradientPow,
      );
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
    const nextPass = renderSdfLinePass(field, p, hasAnimatedBand(pass) ? { ...pass, bandWidth: 0 } : pass);

    pipeline.push({ config: pass, ...nextPass });
    image = image ? compositeMax(image, nextPass.image, p) : nextPass.image;
  });

  return pipeline;
}

function renderSdfPasses(pipeline: SdfPassRender[], p: p5) {
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
    if (!hasAnimatedBand(config)) {
      return;
    }

    const bandCenter = sampleBandCenter(config, elapsedSeconds);
    const bandColor = parseHexColor(config.bandColor);
    const halfBandWidth = config.bandWidth / 2;

    for (let index = 0; index < pulsePositions.length; index += 1) {
      const t = pulsePositions[index];

      if (t >= bandCenter - halfBandWidth && t <= bandCenter + halfBandWidth) {
        const pixelIndex = pulsePixels[index];
        image.pixels[pixelIndex] = bandColor[0];
        image.pixels[pixelIndex + 1] = bandColor[1];
        image.pixels[pixelIndex + 2] = bandColor[2];
      }
    }
  });

  pipeline.forEach(({ config, pulsePixels, pulsePositions }) => {
    if (config.pulseWidth <= 0 || config.pulseSpeed <= 0 || config.pulseInterval <= 0) {
      return;
    }

    const pulseColor = parseHexColor(config.pulseColor);

    for (let index = 0; index < pulsePositions.length; index += 1) {
      const t = pulsePositions[index];
      const pulseAmount = samplePulseAmount(t, elapsedSeconds, config);

      if (pulseAmount > 0) {
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
    return (
      pass.enabled &&
      pass.showLines &&
      ((pass.pulseWidth > 0 && pass.pulseSpeed > 0 && pass.pulseInterval > 0) || hasAnimatedBand(pass))
    );
  });
}

export function createHomeEffects(
  config: SdfConfig = defaultSdfConfig,
): TextSceneEffects<HomeTextContent, HomeEffectState> {
  return {
    build({ p, mask }) {
      const scale = config.resolutionScale;
      const useFullResolution = scale >= 0.99;
      const sourceScale = useFullResolution ? 1 : scale;
      let source: p5.Graphics | p5.Image = mask;

      if (!useFullResolution) {
        source = p.createGraphics(Math.max(1, Math.round(mask.width * scale)), Math.max(1, Math.round(mask.height * scale)));
        source.pixelDensity(1);
        source.background('#000000');
        source.image(mask, 0, 0, source.width, source.height);
      }

      const pipeline = buildSdfPassPipeline(source, p, config, sourceScale);
      const baseImage = renderSdfPasses(pipeline, p);

      if (!useFullResolution) {
        source.remove();
      }

      const state: HomeEffectState = {
        pipeline,
        baseImage,
        animate: hasPulseAnimation(config),
      };

      return {
        baseImage,
        state,
        animate: state.animate,
      };
    },
    renderFrame(state, p, elapsedSeconds) {
      if (!state.baseImage) {
        return null;
      }

      return renderSdfPulseFrame(state.pipeline, state.baseImage, p, elapsedSeconds);
    },
  };
}
