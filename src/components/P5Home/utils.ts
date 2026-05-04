import type p5 from 'p5';

const FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export { clamp };

export function getHomeFontStack() {
  return FONT_STACK;
}

export function getHomeOffset(
  width: number,
  config: {
    mobileWidth: number;
    mobileMin: number;
    mobileFactor: number;
    mobileMax: number;
    desktopMin: number;
    desktopFactor: number;
    desktopMax: number;
  },
) {
  if (width <= config.mobileWidth) {
    return clamp(config.mobileMin, width * config.mobileFactor, config.mobileMax);
  }

  return clamp(config.desktopMin, width * config.desktopFactor, config.desktopMax);
}

export function measureBlock(
  p: p5 | p5.Graphics,
  lines: string[],
  fontSize: number,
) {
  p.textFont(FONT_STACK);
  p.textSize(fontSize);

  const lineHeight = fontSize * 0.95;
  const width = Math.max(...lines.map((line) => p.textWidth(line)));

  return {
    width,
    height: lineHeight * lines.length,
  };
}
