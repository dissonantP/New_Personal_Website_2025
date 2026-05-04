import p5 from 'p5';

import type { HomeItem, HomeItemId, HomeTextBlock } from './types';

const DESCRIPTION_OFFSET_X = 20;
const FONT_STACK =
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

function getBlockFontSize(blockId: 'title' | 'description' | 'links', width: number) {
  if (blockId === 'title') {
    return clamp(26, width * 0.05, 44);
  }

  return clamp(18, width * 0.035, 24);
}

function getBlockLineGap(blockId: 'title' | 'description' | 'links', fontSize: number) {
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
  block: Omit<HomeTextBlock, 'x' | 'y' | 'width' | 'height' | 'lineGap' | 'style'> & {
    style: HomeTextBlock['style'];
  },
  fontSize: number,
) {
  p.textFont(FONT_STACK);
  p.textSize(fontSize);

  const lineGap = getBlockLineGap(block.id as 'title' | 'description' | 'links', fontSize);
  const lineHeight = fontSize * 0.95;
  const width = Math.max(...block.lines.map((line) => p.textWidth(line)));
  const height = lineHeight * block.lines.length + lineGap * Math.max(0, block.lines.length - 1);

  return { width, height, lineGap };
}

export function getHomeBlocks(
  p: p5 | p5.Graphics,
  items: HomeItem[],
  width: number,
  height: number,
): HomeTextBlock[] {
  const titleLines = ['Max Pleaner'];
  const descriptionLines = ['', 'does', '  software', '  art', '  media', '  and music'];
  const linksLines = items.map((item) => item.label);

  const titleFontSize = getBlockFontSize('title', width);
  const descriptionFontSize = getBlockFontSize('description', width);
  const linksFontSize = getBlockFontSize('links', width);

  const titleMetrics = measureBlock(
    p,
    {
      id: 'title',
      lines: titleLines,
      interactive: false,
      targets: undefined,
      style: { fontSize: titleFontSize, align: 'center', fill: '#f4f1ea', fontWeight: 900 },
    },
    titleFontSize,
  );
  const descriptionMetrics = measureBlock(
    p,
    {
      id: 'description',
      lines: descriptionLines,
      interactive: false,
      targets: undefined,
      style: { fontSize: descriptionFontSize, align: 'center', fill: '#f4f1ea', fontWeight: 700 },
    },
    descriptionFontSize,
  );
  const linksMetrics = measureBlock(
    p,
    {
      id: 'links',
      lines: linksLines,
      interactive: true,
      targets: [items[0].id, items[1].id] as [HomeItemId, HomeItemId],
      style: { fontSize: linksFontSize, align: 'left', fill: '#20c05c', hoverFill: '#39e476', fontWeight: 700 },
    },
    linksFontSize,
  );

  const titleTop = clamp(56, height * 0.18, height * 0.32);
  const descriptionTop = titleTop + titleMetrics.height + clamp(12, height * 0.02, 20);
  const linksTop = descriptionTop + descriptionMetrics.height + clamp(44, height * 0.09, 88);

  return [
    {
      id: 'title',
      lines: titleLines,
      interactive: false,
      style: { fontSize: titleFontSize, align: 'center', fill: '#f4f1ea', fontWeight: 900 },
      x: (width - titleMetrics.width) / 2,
      y: titleTop,
      width: titleMetrics.width,
      height: titleMetrics.height,
      lineGap: titleMetrics.lineGap,
    },
    {
      id: 'description',
      lines: descriptionLines,
      interactive: false,
      style: { fontSize: descriptionFontSize, align: 'center', fill: '#f4f1ea', fontWeight: 700 },
      x: (width - descriptionMetrics.width) / 2 + DESCRIPTION_OFFSET_X,
      y: descriptionTop,
      width: descriptionMetrics.width,
      height: descriptionMetrics.height,
      lineGap: descriptionMetrics.lineGap,
    },
    {
      id: 'links',
      lines: linksLines,
      interactive: true,
      targets: [items[0].id, items[1].id] as [HomeItemId, HomeItemId],
      style: { fontSize: linksFontSize, align: 'left', fill: '#20c05c', hoverFill: '#39e476', fontWeight: 700 },
      x: (width - linksMetrics.width) / 2 - getHomeOffset(width),
      y: linksTop,
      width: linksMetrics.width,
      height: linksMetrics.height,
      lineGap: linksMetrics.lineGap,
    },
  ];
}
