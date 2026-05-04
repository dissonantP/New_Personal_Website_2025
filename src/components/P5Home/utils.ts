import type p5 from 'p5';

import type { HomeTextBlock } from './types';

const FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export { clamp };

export function getHomeFontStack() {
  return FONT_STACK;
}

export function getHomeOffset(width: number) {
  if (width <= 640) {
    return clamp(42, width * 0.14, 72);
  }

  return clamp(72, width * 0.095, 140);
}

export function getBlockFontSize(blockId: HomeTextBlock['id'], width: number) {
  if (blockId === 'title') {
    return clamp(26, width * 0.05, 44);
  }

  return clamp(18, width * 0.035, 24);
}

export function getBlockLineGap(blockId: HomeTextBlock['id'], fontSize: number) {
  if (blockId === 'title') {
    return fontSize * 0.15;
  }

  if (blockId === 'description') {
    return fontSize * 0.28;
  }

  return fontSize * 0.45;
}

export function measureBlock(
  p: p5 | p5.Graphics,
  block: Pick<HomeTextBlock, 'id' | 'lines'>,
  fontSize: number,
) {
  p.textFont(FONT_STACK);
  p.textSize(fontSize);

  const lineGap = getBlockLineGap(block.id, fontSize);
  const lineHeight = fontSize * 0.95;
  const width = Math.max(...block.lines.map((line) => p.textWidth(line)));
  const height = lineHeight * block.lines.length + lineGap * Math.max(0, block.lines.length - 1);

  return {
    width,
    height,
    lineGap,
  };
}
