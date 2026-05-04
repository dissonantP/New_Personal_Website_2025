import type p5 from 'p5';
import { useCallback, useMemo } from 'react';

import { P5TextScene } from './P5TextScene';
import { createTextSceneSketch } from './P5TextScene/sketch';
import type { HomeItemId, HomeTextBlock, HomeTextContent } from './P5Home/types';
import { createHomeEffects } from './P5Home/effects';
import {
  clamp,
  getBlockFontSize,
  getHomeFontStack,
  getHomeOffset,
  measureBlock,
} from './P5Home/utils';

type P5HomeProps = {
  onNavigate: (id: HomeItemId) => void;
};

type HomeBlockSpec = Omit<HomeTextBlock, 'x' | 'y' | 'width' | 'height' | 'lineGap'>;

const HOME_BACKGROUND = '#111111';
const TITLE_LINES = ['Max Pleaner'];
const DESCRIPTION_LINES = ['', 'does', '  software', '  art', '  media', '  and music'];
const DESCRIPTION_OFFSET_X = 20;
const HOME_ITEMS: Array<{ id: HomeItemId; label: string }> = [
  { id: 'portfolio', label: 'portfolio' },
  { id: 'services', label: 'services' },
];

function getHomeBlocks(p: p5 | p5.Graphics, width: number, height: number): HomeTextBlock[] {
  const titleFontSize = getBlockFontSize('title', width);
  const descriptionFontSize = getBlockFontSize('description', width);
  const linksFontSize = getBlockFontSize('links', width);

  const titleBlock: HomeBlockSpec = {
    id: 'title',
    lines: TITLE_LINES,
    interactive: false,
    style: { fontSize: titleFontSize, align: 'center', fill: '#f4f1ea', fontWeight: 900 },
  };
  const descriptionBlock: HomeBlockSpec = {
    id: 'description',
    lines: DESCRIPTION_LINES,
    interactive: false,
    style: { fontSize: descriptionFontSize, align: 'center', fill: '#f4f1ea', fontWeight: 700 },
  };
  const linksBlock: HomeBlockSpec = {
    id: 'links',
    lines: HOME_ITEMS.map((item) => item.label),
    interactive: true,
    targets: [HOME_ITEMS[0].id, HOME_ITEMS[1].id],
    style: { fontSize: linksFontSize, align: 'left', fill: '#20c05c', hoverFill: '#39e476', fontWeight: 700 },
  };

  const titleMetrics = measureBlock(p, titleBlock, titleFontSize);
  const descriptionMetrics = measureBlock(p, descriptionBlock, descriptionFontSize);
  const linksMetrics = measureBlock(p, linksBlock, linksFontSize);

  const titleTop = clamp(56, height * 0.18, height * 0.32);
  const descriptionTop = titleTop + titleMetrics.height + clamp(12, height * 0.02, 20);
  const linksTop = descriptionTop + descriptionMetrics.height + clamp(44, height * 0.09, 88);

  return [
    {
      ...titleBlock,
      ...titleMetrics,
      x: (width - titleMetrics.width) / 2,
      y: titleTop,
    },
    {
      ...descriptionBlock,
      ...descriptionMetrics,
      x: (width - descriptionMetrics.width) / 2 + DESCRIPTION_OFFSET_X,
      y: descriptionTop,
    },
    {
      ...linksBlock,
      ...linksMetrics,
      x: (width - linksMetrics.width) / 2 - getHomeOffset(width),
      y: linksTop,
    },
  ];
}

function getHomeContent(p: p5, width: number, height: number): HomeTextContent {
  return {
    background: HOME_BACKGROUND,
    fontFamily: getHomeFontStack(),
    blocks: getHomeBlocks(p, width, height),
  };
}

export function P5Home({ onNavigate }: P5HomeProps) {
  const getContent = useCallback(
    (p: p5, width: number, height: number) => getHomeContent(p, width, height),
    [],
  );
  const effects = useMemo(() => createHomeEffects(), []);
  const navigate = useCallback((id: HomeItemId) => onNavigate(id), [onNavigate]);
  const createSketch = useMemo(
    () => createTextSceneSketch({ effects, onNavigate: navigate }),
    [effects, navigate],
  );

  return <P5TextScene getContent={getContent} createSketch={createSketch} />;
}
