import p5 from 'p5';
import { useCallback, useMemo } from 'react';

import { P5TextScene } from './P5TextScene';
import { createTextSceneSketch } from './P5TextScene/sketch';
import { buildTextSceneContent } from './P5TextScene/content';
import type { TextSceneBlockSpec } from './P5TextScene/types';
import type { HomeItemId } from './P5Home/types';
import { createHomeEffects } from './P5Home/effects';
import { clamp } from './P5Home/utils';

type P5HomeProps = {
  onNavigate: (id: HomeItemId) => void;
};

type HomeLayoutPoint = {
  x: number;
  y: number;
};

type HomeBlockSpec = TextSceneBlockSpec<HomeItemId> & {
  mobileOffset?: HomeLayoutPoint;
};

const HOME_MOBILE_BREAKPOINT = 1000;
const yOffset = -20;

function applyMobileOffset(
  width: number,
  position: HomeLayoutPoint,
  mobileOffset?: HomeLayoutPoint,
) {
  if (width >= HOME_MOBILE_BREAKPOINT || !mobileOffset) {
    return position;
  }

  return {
    x: position.x + mobileOffset.x,
    y: position.y + mobileOffset.y,
  };
}

function defineHomeBlock(block: HomeBlockSpec): TextSceneBlockSpec<HomeItemId> {
  const { mobileOffset, layout, ...rest } = block;

  return {
    ...rest,
    layout: (args) => applyMobileOffset(args.width, layout(args), mobileOffset),
  };
}

const HOME_BLOCK_SPECS = [
  {
    id: 'title',
    lines: [
      'Max Pleaner',
      { text: 'contact', href: 'mailto:maxpleaner@gmail.com', fontSize: 20 },
    ],
    interactive: false,
    style: {
      fontSize: 0,
      align: 'center',
      fill: '#f4f1ea',
      linkFill: '#20c05c',
      linkHoverFill: '#39e476',
      fontWeight: 900,
    },
    fontSize: (width) => clamp(26, width * 0.05, 44),
    lineGap: (fontSize) => fontSize * 0.15,
    mobileOffset: { x: 0, y: -200 },
    layout: ({ screenCenterX, screenCenterY }) => ({
      x: screenCenterX + 10,
      y: screenCenterY + yOffset - 400,
    }),
  },
  {
    id: 'description',
    lines: ['software', 'art', 'media', 'music'],
    interactive: false,
    style: { fontSize: 0, align: 'left', fill: '#f4f1ea', fontWeight: 700 },
    fontSize: (width) => clamp(18, width * 0.035, 24),
    lineGap: (fontSize) => fontSize * 0.28,
    mobileOffset: { x: 0, y: 90 },
    layout: ({ screenCenterX, previous }) => {
      const title = previous.title;
      const titleY = title?.y ?? 0;

      return {
        x: screenCenterX - 100,
        y: titleY + 180,
      };
    },
  },
  {
    id: 'portfolio',
    lines: ['portfolio'],
    interactive: true,
    targets: ['portfolio'],
    style: { fontSize: 0, align: 'left', fill: '#20c05c', hoverFill: '#39e476', fontWeight: 700 },
    fontSize: (width) => clamp(18, width * 0.035, 24),
    lineGap: (fontSize) => fontSize * 0.45,
    mobileOffset: { x: 0, y: 90 },
    layout: ({ screenCenterX, previous }) => {
      const description = previous.description;

      if (!description) {
        return { x: screenCenterX + 10, y: 0 };
      }

      return {
        x: screenCenterX + 10,
        y: description.y + 230,
      };
    },
  },
  {
    id: 'services',
    lines: ['services'],
    interactive: true,
    targets: ['services'],
    style: { fontSize: 0, align: 'left', fill: '#20c05c', hoverFill: '#39e476', fontWeight: 700 },
    fontSize: (width) => clamp(18, width * 0.035, 24),
    lineGap: (fontSize) => fontSize * 0.45,
    mobileOffset: { x: 0, y: 90 },
    layout: ({ screenCenterX, previous }) => {
      const portfolio = previous.portfolio;

      if (!portfolio) {
        return { x: screenCenterX - 100, y: 0 };
      }

      return {
        x: screenCenterX - 100,
        y: portfolio.y + 170,
      };
    },
  },
] satisfies HomeBlockSpec[];

const HOME_BLOCKS: TextSceneBlockSpec<HomeItemId>[] = HOME_BLOCK_SPECS.map(defineHomeBlock);

export function P5Home({ onNavigate }: P5HomeProps) {
  const getContent = useCallback(
    (p: p5, width: number, height: number) =>
      buildTextSceneContent<HomeItemId>({
        p,
        width,
        height,
        background: '#FFFFFF',
        blocks: HOME_BLOCKS,
      }),
    [],
  );

  const effects = useMemo(() => createHomeEffects(), []);
  const navigate = useCallback((id: HomeItemId) => onNavigate(id), [onNavigate]);
  const createSketch = useMemo(
    () => createTextSceneSketch({ effects, onNavigate: navigate }),
    [effects, navigate],
  );

  return (
    <P5TextScene getContent={getContent} createSketch={createSketch} />
  );
}
