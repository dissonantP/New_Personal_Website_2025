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
    lines: [
      { text: 'back', href: '../'},
      { text: '\nPortfolio' }
    ],
    interactive: true,
    targets: ['home'],
    style: { fontSize: 0, align: 'center', fill: '#FFFFFF', linkFill: '#39e476', fontWeight: 700 },
    fontSize: (width) => clamp(16, width * 0.028, 22),
    lineGap: (fontSize) => fontSize * 0.35,
    mobile: { fontSizeMultiplier: 1.2, yOffset: -10, xOffset: -20 },
    layout: ({ screenCenterX, screenCenterY }) => ({
      x: screenCenterX - -10,
      y: screenCenterY - 490,
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
        text: 'scraped concert listings',
      },
      {
        text: '\nHoudini Tools',
        href: 'https://loving-snowstorm-ec0.notion.site/houdini-tools?v=1b7832ab6c5a80ae8702000c474aabb1',
        openInNewTab: true,
      },
      {
        text: 'for algorithmic art',
      },
      {
        text: '\nTouch Designer Tools',
        href: 'https://loving-snowstorm-ec0.notion.site/touch-designer?v=1b9832ab6c5a808b86d7000c0d3f5201',
        openInNewTab: true,
      },
      {
        text: 'for video fx',
      },
      {
        text: '\nYoutube Channel',
        href: 'https://www.youtube.com/playlist?list=PLYisF59Ati4weUgwgbpYaA3E4X71BKUA0',
        openInNewTab: true,
      },
      {
        text: 'creative tech tutorials',
      },
      {
        text: '\n🎵 Half Rotten Goddess',
        href: 'https://halfrottengoddess.bandcamp.com/',
        openInNewTab: true,
      },
      {
        text: 'Post-punk band',
      },
      {
        text: '\n🎵 War of Knives',
        href: 'https://warofknives.bandcamp.com/',
        openInNewTab: true,
      },
      {
        text: 'Metal band',
      },
      {
        text: '\n🎵 Protean',
        href: 'https://dissonant-protean.bandcamp.com/',
        openInNewTab: true,
      },
      {
        text: 'Solo Electopunk',
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
    mobile: { fontSizeMultiplier: 1.3, xOffset: 10, yOffset: 100 },
    layout: ({ screenCenterX, previous }) => {
      const title = previous.title;

      return {
        x: screenCenterX - 10,
        y: (title?.y ?? 0) + 400,
      };
    },
  },
];

export function PortfolioSection({ onNavigate }: PortfolioSectionProps) {
  return <P5TextScenePage blocks={PORTFOLIO_BLOCKS} onNavigate={onNavigate} />;
}
