import type p5 from 'p5';
import { useCallback, useMemo } from 'react';

import { P5TextScene } from './P5TextScene';
import { createTextSceneSketch } from './P5TextScene/sketch';
import type { HomeItemId, HomeTextBlock, HomeTextContent } from './P5Home/types';
import { createHomeEffects } from './P5Home/effects';
import {
  clamp,
  getHomeFontStack,
  measureBlock,
} from './P5Home/utils';

type P5HomeProps = {
  onNavigate: (id: HomeItemId) => void;
};

type HomeBlockMetrics = Pick<HomeTextBlock, 'width' | 'height' | 'lineGap'>;

type HomeBlockSpec = {
  id: HomeTextBlock['id'];
  lines: string[];
  interactive: boolean;
  targets?: [HomeItemId, HomeItemId];
  style: HomeTextBlock['style'];
  fontSize: (width: number) => number;
  lineGap: (fontSize: number) => number;
  layout: (args: {
    width: number;
    height: number;
    metrics: HomeBlockMetrics;
    previous: Partial<Record<HomeTextBlock['id'], HomeTextBlock>>;
  }) => { x: number; y: number };
};

const HOME_BACKGROUND = '#111111';
const HOME_BLOCKS: HomeBlockSpec[] = [
  {
    id: 'title',
    lines: ['Max Pleaner'],
    interactive: false,
    style: { fontSize: 0, align: 'center', fill: '#f4f1ea', fontWeight: 900 },
    fontSize: (width) => clamp(26, width * 0.05, 44),
    lineGap: (fontSize) => fontSize * 0.15,
    layout: (args) => ({
      x: (args.width - args.metrics.width) / 2,
      y: clamp(56, args.height * 0.18, args.height * 0.32),
    }),
  },
  {
    id: 'description',
    lines: ['', 'does', '  software', '  art', '  media', '  and music'],
    interactive: false,
    style: { fontSize: 0, align: 'center', fill: '#f4f1ea', fontWeight: 700 },
    fontSize: (width) => clamp(18, width * 0.035, 24),
    lineGap: (fontSize) => fontSize * 0.28,
    layout: (args) => {
      const title = args.previous.title;

      if (!title) {
        return { x: (args.width - args.metrics.width) / 2, y: 0 };
      }

      return {
        x: (args.width - args.metrics.width) / 2 + 20,
        y: title.y + title.height + clamp(12, args.height * 0.02, 20),
      };
    },
  },
  {
    id: 'links',
    lines: ['portfolio', 'services'],
    interactive: true,
    targets: ['portfolio', 'services'],
    style: { fontSize: 0, align: 'left', fill: '#20c05c', hoverFill: '#39e476', fontWeight: 700 },
    fontSize: (width) => clamp(18, width * 0.035, 24),
    lineGap: (fontSize) => fontSize * 0.45,
    layout: (args) => {
      const description = args.previous.description;
      const offset = args.width <= 640 ? clamp(42, args.width * 0.14, 72) : clamp(72, args.width * 0.095, 140);

      if (!description) {
        return { x: (args.width - args.metrics.width) / 2 - offset, y: 0 };
      }

      return {
        x: (args.width - args.metrics.width) / 2 - offset,
        y: description.y + description.height + clamp(44, args.height * 0.09, 88),
      };
    },
  },
];

function getHomeContent(p: p5, width: number, height: number): HomeTextContent {
  const previous: Partial<Record<HomeTextBlock['id'], HomeTextBlock>> = {};

  return {
    background: HOME_BACKGROUND,
    fontFamily: getHomeFontStack(),
    blocks: HOME_BLOCKS.map((block) => {
      const fontSize = block.fontSize(width);
      const lineGap = block.lineGap(fontSize);
      const baseMetrics = measureBlock(p, block.lines, fontSize);
      const metrics = {
        width: baseMetrics.width,
        height: baseMetrics.height + lineGap * Math.max(0, block.lines.length - 1),
        lineGap,
      };
      const position = block.layout({ width, height, metrics, previous });
      const layout = {
        ...block,
        ...metrics,
        ...position,
        style: {
          ...block.style,
          fontSize,
        },
      } satisfies HomeTextBlock;

      previous[block.id] = layout;

      return layout;
    }),
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
