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
    layout: ({ screenCenterX, screenCenterY }) => ({
      x: screenCenterX - 260,
      y: screenCenterY - 320,
    }),
  },
  {
    id: 'title',
    lines: ['Portfolio'],
    interactive: false,
    style: { fontSize: 0, align: 'center', fill: '#f4f1ea', fontWeight: 900 },
    fontSize: (width) => clamp(28, width * 0.052, 46),
    lineGap: (fontSize) => fontSize * 0.15,
    layout: ({ screenCenterX, screenCenterY }) => ({
      x: screenCenterX + 12,
      y: screenCenterY - 290,
    }),
  },
  {
    id: 'body',
    lines: [
      'I wrote my first lines of code in 2013 after finishing a Politics degree.',
      { text: 'software work', target: 'home' },
      'I learned through free curricula and structured courses, then moved into',
      { text: 'art systems', target: 'art' },
      'startup backends, analytics systems, 3D tooling, and production CAD work.',
      { text: 'music projects', target: 'music' },
      'Backend: Ruby on Rails. Frontend: TypeScript and React.',
    ],
    interactive: false,
    style: {
      fontSize: 0,
      align: 'left',
      fill: '#f4f1ea',
      linkFill: '#20c05c',
      linkHoverFill: '#39e476',
      fontWeight: 700,
    },
    fontSize: (width) => clamp(16, width * 0.028, 22),
    lineGap: (fontSize) => fontSize * 0.4,
    layout: ({ screenCenterX, previous }) => {
      const title = previous.title;

      return {
        x: screenCenterX - 100,
        y: (title?.y ?? 0) + 170,
      };
    },
  },
];

export function PortfolioSection({ onNavigate }: PortfolioSectionProps) {
  return <P5TextScenePage blocks={PORTFOLIO_BLOCKS} onNavigate={onNavigate} />;
}
