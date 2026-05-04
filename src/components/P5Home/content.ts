import type p5 from 'p5';

import { getHomeBlocks } from './layout';
import type { HomeItem, HomeTextContent } from './types';

const HOME_BACKGROUND = '#111111';
const HOME_FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

export function getHomeContent(
  p: p5,
  items: HomeItem[],
  width: number,
  height: number,
): HomeTextContent {
  return {
    background: HOME_BACKGROUND,
    fontFamily: HOME_FONT_STACK,
    blocks: getHomeBlocks(p, items, width, height),
  };
}

export function getHomeItems(): HomeItem[] {
  return [
    { id: 'portfolio', label: 'portfolio' },
    { id: 'services', label: 'services' },
  ];
}
