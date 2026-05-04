import p5 from 'p5';

import type { TextBlockLayout, TextBlockSpec } from './types';

const DESCRIPTION_OFFSET_X = 20;
const MONO_FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getHomeOffset(width: number) {
  if (width <= 640) {
    return clamp(42, width * 0.14, 72);
  }

  return clamp(72, width * 0.095, 140);
}

function getBlockFontSize(blockId: TextBlockLayout['id'], width: number) {
  if (blockId === 'title') {
    return clamp(26, width * 0.05, 44);
  }

  return clamp(18, width * 0.035, 24);
}

function getBlockLineGap(blockId: TextBlockLayout['id'], fontSize: number) {
  if (blockId === 'title') {
    return fontSize * 0.15;
  }

  if (blockId === 'description') {
    return fontSize * 0.28;
  }

  return fontSize * 0.45;
}

function measureBlock(
  p: p5 | p5.Graphics,
  block: TextBlockSpec,
  fontSize: number,
): Pick<TextBlockLayout, 'width' | 'height' | 'lineGap'> {
  p.textFont(MONO_FONT_STACK);
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

export function getHomeTextBlockLayouts(
  p: p5 | p5.Graphics,
  blocks: TextBlockSpec[],
  width: number,
  height: number,
): TextBlockLayout[] {
  const titleBlock = blocks.find((block) => block.id === 'title');
  const descriptionBlock = blocks.find((block) => block.id === 'description');
  const linksBlock = blocks.find((block) => block.id === 'links');

  if (!titleBlock || !descriptionBlock || !linksBlock) {
    return [];
  }

  const titleFontSize = getBlockFontSize('title', width);
  const descriptionFontSize = getBlockFontSize('description', width);
  const linksFontSize = getBlockFontSize('links', width);

  const titleMetrics = measureBlock(p, titleBlock, titleFontSize);
  const descriptionMetrics = measureBlock(p, descriptionBlock, descriptionFontSize);
  const linksMetrics = measureBlock(p, linksBlock, linksFontSize);

  const titleTop = clamp(56, height * 0.18, height * 0.32);
  const descriptionTop = titleTop + titleMetrics.height + clamp(12, height * 0.02, 20);
  const linksTop = descriptionTop + descriptionMetrics.height + clamp(44, height * 0.09, 88);
  const titleX = (width - titleMetrics.width) / 2;
  const descriptionX = (width - descriptionMetrics.width) / 2 + DESCRIPTION_OFFSET_X;
  const linksX = (width - linksMetrics.width) / 2 - getHomeOffset(width);

  return [
    {
      ...titleBlock,
      ...titleMetrics,
      x: titleX,
      y: titleTop,
      fontSize: titleFontSize,
    },
    {
      ...descriptionBlock,
      ...descriptionMetrics,
      x: descriptionX,
      y: descriptionTop,
      fontSize: descriptionFontSize,
    },
    {
      ...linksBlock,
      ...linksMetrics,
      x: linksX,
      y: linksTop,
      fontSize: linksFontSize,
    },
  ];
}
