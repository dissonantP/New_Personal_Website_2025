import { P5TextScenePage } from '../components/P5TextScenePage';
import type { TextSceneBlockSpec } from '../components/P5TextScene/types';
import { clamp } from '../components/P5TextScene/utils';
import type { SiteSectionId } from '../navigation/types';

type PortfolioSectionProps = {
  onNavigate: (id: SiteSectionId) => void;
};

const PORTFOLIO_BLOCKS: TextSceneBlockSpec<SiteSectionId>[] = [
  {
    id: 'back',
    lines: ['home'],
    interactive: true,
    targets: ['home'],
    style: { fontSize: 0, align: 'left', fill: '#20c05c', hoverFill: '#39e476', fontWeight: 700 },
    fontSize: (width) => clamp(16, width * 0.028, 22),
    lineGap: (fontSize) => fontSize * 0.35,
    mobile: { fontSizeMultiplier: 0.9, yOffset: 12 },
    layout: ({ screenCenterX, screenCenterY }) => ({
      x: screenCenterX - 120,
      y: screenCenterY - 490,
    }),
  },
  {
    id: 'title',
    lines: ['Portfolio'],
    interactive: false,
    style: { fontSize: 0, align: 'center', fill: '#f4f1ea', fontWeight: 900 },
    fontSize: (width) => clamp(28, width * 0.052, 46),
    lineGap: (fontSize) => fontSize * 0.15,
    mobile: { fontSizeMultiplier: 0.88, yOffset: 14 },
    layout: ({ screenCenterX, screenCenterY }) => ({
      x: screenCenterX + 12,
      y: screenCenterY - 290,
    }),
  },
  {
    id: 'body',
    lines: [
      {
        text: 'bayareashows.org',
        href: 'https://bayareashows.org',
        openInNewTab: true,
      },
      {
        text: '\nautomated concert listings\n',
      },
      {
        text: '\nbayareashows.org',
        href: 'https://bayareashows.org',
        openInNewTab: true,
      },
      {
        text: '\n\nautomated concert listings\n',
      },
    ],
    interactive: false,
    style: {
      fontSize: 0,
      align: 'center',
      fill: '#f4f1ea',
      linkFill: '#20c05c',
      linkHoverFill: '#39e476',
      fontWeight: 700,
    },
    fontSize: (width) => clamp(16, width * 0.028, 22),
    lineGap: (fontSize) => fontSize * 0.4,
    mobile: { fontSizeMultiplier: 0.84, yOffset: 28 },
    layout: ({ screenCenterX, previous }) => {
      const title = previous.title;

      return {
        x: screenCenterX - 0,
        y: (title?.y ?? 0) + 190,
      };
    },
  },
];

export function PortfolioSection({ onNavigate }: PortfolioSectionProps) {
  return <P5TextScenePage blocks={PORTFOLIO_BLOCKS} onNavigate={onNavigate} />;
}
