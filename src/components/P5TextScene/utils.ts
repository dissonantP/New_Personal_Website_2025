import type p5 from 'p5';

const FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getTextSceneFontStack() {
  return FONT_STACK;
}

export function measureTextSceneBlock(p: p5 | p5.Graphics, lines: string[], fontSize: number) {
  p.textFont(FONT_STACK);
  p.textSize(fontSize);

  const lineHeight = fontSize * 0.95;
  const width = Math.max(...lines.map((line) => p.textWidth(line)));

  return {
    width,
    height: lineHeight * lines.length,
  };
}

export { clamp };
