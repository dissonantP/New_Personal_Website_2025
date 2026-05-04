import type p5 from 'p5';
import { useCallback, useMemo } from 'react';

import { P5TextScene } from './P5TextScene';
import { createTextSceneSketch } from './P5TextScene/sketch';
import { buildTextSceneContent } from './P5TextScene/content';
import type { TextSceneBlockSpec } from './P5TextScene/types';
import type { HomeItemId } from './P5Home/types';
import { createHomeEffects } from './P5Home/effects';
import { clamp, getHomeOffset } from './P5Home/utils';

const HOME_OFFSET_CONFIG = {
  // Switch to the mobile offset curve at or below this width.
  mobileWidth: 640,
  // Minimum horizontal offset on small screens.
  mobileMin: 42,
  // How aggressively the offset grows with width on small screens.
  mobileFactor: 0.14,
  // Maximum horizontal offset on small screens.
  mobileMax: 72,
  // Minimum horizontal offset on larger screens.
  desktopMin: 72,
  // How aggressively the offset grows with width on larger screens.
  desktopFactor: 0.095,
  // Maximum horizontal offset on larger screens.
  desktopMax: 140,
};

type P5HomeProps = {
  onNavigate: (id: HomeItemId) => void;
};

const HOME_BLOCKS: TextSceneBlockSpec<HomeItemId>[] = [
  {
    id: 'title',
    lines: ['Max Pleaner'],
    interactive: false,
    style: { fontSize: 0, align: 'center', fill: '#f4f1ea', fontWeight: 900 },
    fontSize: (width) => clamp(26, width * 0.05, 44),
    lineGap: (fontSize) => fontSize * 0.15,
    layout: ({ width, height, metrics }) => ({
      x: width / 2 - (metrics.width / 3.2),
      y: height / 4,
    }),
  },
  {
    id: 'description',
    lines: ['', 'does', '  software', '  art', '  media', '  and music'],
    interactive: false,
    style: { fontSize: 0, align: 'left', fill: '#f4f1ea', fontWeight: 700 },
    fontSize: (width) => clamp(18, width * 0.035, 24),
    lineGap: (fontSize) => fontSize * 0.28,
    layout: ({ width, metrics, previous }) => {
      const title = previous.title;

      if (!title) {
        return { x: (width - metrics.width) / 2, y: 0 };
      }

      return {
        x: width / 2 - (title.width / 1.5),
        y: title.y + metrics.height * 1.6,
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
    layout: ({ width, metrics, previous }) => {
      const title = previous.title;
      const description = previous.description;
      const offset = getHomeOffset(width, HOME_OFFSET_CONFIG);

      if (!title || !description) {
        return { x: (width - metrics.width) / 2 - offset, y: 0 };
      }

      return {
        x: width / 2 + (title.width * 0.1),
        y: description.y + metrics.height * 7,
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

  return <P5TextScene getContent={getContent} createSketch={createSketch} />;
}
