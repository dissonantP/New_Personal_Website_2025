import p5 from 'p5';

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

function samplePixel(
  pixels: ArrayLike<number>,
  width: number,
  height: number,
  x: number,
  y: number,
) {
  const sampleX = clamp(0, Math.round(x), width - 1);
  const sampleY = clamp(0, Math.round(y), height - 1);
  const index = (sampleY * width + sampleX) * 4;

  return [
    pixels[index] ?? 0,
    pixels[index + 1] ?? 0,
    pixels[index + 2] ?? 0,
    pixels[index + 3] ?? 255,
  ] as const;
}

export type MouseGlitchPostprocessConfig = {
  enabled: boolean;
  radius: number;
  intensity: number;
  rgbSplit: number;
  colorMix: number;
  noiseScale: number;
  noiseSpeed: number;
  lineJitter: number;
  falloffPow: number;
  colorA: string;
  colorB: string;
  colorC: string;
};

export const defaultMouseGlitchPostprocessConfig: MouseGlitchPostprocessConfig = {
  enabled: false,
  radius: 160,
  intensity: 12,
  rgbSplit: 2,
  colorMix: 0.28,
  noiseScale: 0.035,
  noiseSpeed: 0.9,
  lineJitter: 8,
  falloffPow: 2.1,
  colorA: '#ffffff',
  colorB: '#00ff66',
  colorC: '#ff4de1',
};

export type MouseGlitchPointer = {
  x: number;
  y: number;
} | null;

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

  source.loadPixels();

  const output = p.createImage(source.width, source.height);
  output.loadPixels();

  for (let index = 0; index < source.pixels.length; index += 1) {
    output.pixels[index] = source.pixels[index] ?? 0;
  }

  const left = clamp(0, Math.floor(pointer.x - config.radius - config.intensity - config.rgbSplit), source.width - 1);
  const right = clamp(0, Math.ceil(pointer.x + config.radius + config.intensity + config.rgbSplit), source.width - 1);
  const top = clamp(0, Math.floor(pointer.y - config.radius - config.intensity - config.rgbSplit), source.height - 1);
  const bottom = clamp(0, Math.ceil(pointer.y + config.radius + config.intensity + config.rgbSplit), source.height - 1);

  const colorA = parseHexColor(config.colorA);
  const colorB = parseHexColor(config.colorB);
  const colorC = parseHexColor(config.colorC);

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > config.radius) {
        continue;
      }

      const falloff = Math.pow(1 - smoothstep(0, config.radius, distance), config.falloffPow);
      const noiseA = p.noise(
        x * config.noiseScale,
        y * config.noiseScale,
        elapsedSeconds * config.noiseSpeed,
      );
      const noiseB = p.noise(
        x * config.noiseScale * 0.73 + 19.17,
        y * config.noiseScale * 1.21 + 5.83,
        elapsedSeconds * config.noiseSpeed * 1.4,
      );
      const scanline = p.noise(y * config.noiseScale * 3.7, elapsedSeconds * config.noiseSpeed * 0.7);
      const lineJitter = (scanline - 0.5) * 2 * config.lineJitter * falloff;
      const offsetX = ((noiseA - 0.5) * 2 * config.intensity + lineJitter) * falloff;
      const offsetY = ((noiseB - 0.5) * 2 * config.intensity * 0.55 + lineJitter * 0.35) * falloff;

      const red = samplePixel(source.pixels, source.width, source.height, x + offsetX + config.rgbSplit, y + offsetY)[0];
      const green = samplePixel(source.pixels, source.width, source.height, x - offsetX, y + offsetY + config.rgbSplit)[1];
      const blue = samplePixel(source.pixels, source.width, source.height, x + offsetX * 0.5 - config.rgbSplit, y - offsetY)[2];

      const paletteMix = clamp(0, config.colorMix * falloff, 1);
      const paletteT = noiseA;
      const paletteColor =
        paletteT < 0.5
          ? lerpColor(colorA, colorB, paletteT * 2)
          : lerpColor(colorB, colorC, (paletteT - 0.5) * 2);

      const pixelIndex = (y * source.width + x) * 4;
      output.pixels[pixelIndex] = Math.round(red * (1 - paletteMix) + paletteColor[0] * paletteMix);
      output.pixels[pixelIndex + 1] = Math.round(
        green * (1 - paletteMix) + paletteColor[1] * paletteMix,
      );
      output.pixels[pixelIndex + 2] = Math.round(blue * (1 - paletteMix) + paletteColor[2] * paletteMix);
      output.pixels[pixelIndex + 3] = source.pixels[pixelIndex + 3] ?? 255;
    }
  }

  output.updatePixels();

  return output;
}
