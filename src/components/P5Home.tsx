import type p5 from 'p5';
import { useCallback, useMemo } from 'react';

import { P5TextScene } from './P5TextScene';
import { createTextSceneSketch } from './P5TextScene/sketch';
import { buildTextSceneContent } from './P5TextScene/content';
import type { TextSceneBlockSpec } from './P5TextScene/types';
import type { HomeItemId } from './P5Home/types';
import { createHomeEffects } from './P5Home/effects';
import { clamp, getHomeOffset } from './P5Home/utils';

type P5HomeProps = {
  onNavigate: (id: HomeItemId) => void;
};

const HOME_BACKGROUND = '#111111';
const HOME_BLOCKS: TextSceneBlockSpec<HomeItemId>[] = [
  {
    id: 'title',
    lines: ['Max Pleaner'],
    interactive: false,
    style: { fontSize: 0, align: 'center', fill: '#f4f1ea', fontWeight: 900 },
    fontSize: (width) => clamp(26, width * 0.05, 44),
    lineGap: (fontSize) => fontSize * 0.15,
    layout: ({ width, height, metrics }) => ({
      x: (width - metrics.width) / 2,
      y: clamp(56, height * 0.18, height * 0.32),
    }),
  },
  {
    id: 'description',
    lines: ['', 'does', '  software', '  art', '  media', '  and music'],
    interactive: false,
    style: { fontSize: 0, align: 'center', fill: '#f4f1ea', fontWeight: 700 },
    fontSize: (width) => clamp(18, width * 0.035, 24),
    lineGap: (fontSize) => fontSize * 0.28,
    layout: ({ width, height, metrics, previous }) => {
      const title = previous.title;

      if (!title) {
        return { x: (width - metrics.width) / 2, y: 0 };
      }

      return {
        x: (width - metrics.width) / 2 + 20,
        y: title.y + title.height + clamp(12, height * 0.02, 20),
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
    layout: ({ width, height, metrics, previous }) => {
      const description = previous.description;
      const offset = getHomeOffset(width);

      if (!description) {
        return { x: (width - metrics.width) / 2 - offset, y: 0 };
      }

      return {
        x: (width - metrics.width) / 2 - offset,
        y: description.y + description.height + clamp(44, height * 0.09, 88),
      };
    },
  },
];

export function P5Home({ onNavigate }: P5HomeProps) {
  const getContent = useCallback(
    (p: p5, width: number, height: number) =>
      buildTextSceneContent<HomeItemId>({
        p,
        width,
        height,
        background: HOME_BACKGROUND,
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

  return <P5TextScene getContent={getContent} createSketch={createSketch} />;
}
