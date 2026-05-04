import type { HomeItem, TextBlockSpec } from './types';

export const HOME_TITLE = 'Max Pleaner';
export const HOME_DESCRIPTION_LINES = ['', 'does', '  software', '  art', '  media', '  and music'];

export function getHomeItems(): HomeItem[] {
  return [
    { id: 'portfolio', label: 'portfolio' },
    { id: 'services', label: 'services' },
  ];
}

export function getHomeTextBlocks(items: HomeItem[]): TextBlockSpec[] {
  return [
    {
      id: 'title',
      lines: [HOME_TITLE],
      align: 'center',
      interactive: false,
    },
    {
      id: 'description',
      lines: HOME_DESCRIPTION_LINES,
      align: 'center',
      interactive: false,
    },
    {
      id: 'links',
      lines: items.map((item) => item.label),
      align: 'left',
      interactive: true,
      targets: [items[0].id, items[1].id],
    },
  ];
}
