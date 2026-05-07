import { P5TextScenePage } from '../components/P5TextScenePage';
import type { TextSceneBlockSpec } from '../components/P5TextScene/types';
import { clamp } from '../components/P5TextScene/utils';
import type { SiteSectionId } from '../navigation/types';

type ServivcesSectionProps = {
  onNavigate: (id: SiteSectionId) => void;
};

const fontSize = 18

const SERVICES_BLOCKS: TextSceneBlockSpec<SiteSectionId>[] = [
  {
    id: 'back',
    lines: [
      { text: 'back', href: '../'},
      { text: 'Services' }
    ],
    interactive: true,
    targets: ['home'],
    style: { fontSize: 0, align: 'center', fill: '#FFFFFF', linkFill: '#39e476', fontWeight: 700 },
    fontSize: (width) => clamp(16, width * 0.028, 22),
    lineGap: (fontSize) => fontSize * 0.35,
    mobile: { fontSizeMultiplier: 1, yOffset: -10, xOffset: -20 },
    layout: ({ screenCenterX, screenCenterY }) => ({
      x: screenCenterX - -10,
      y: screenCenterY - 490,
    }),
  },
  {
    id: 'body',
    lines: [
      { text: 'App Development', underline: true, underlineOffset: 10 },
      { text: 'Full-stack web', fontSize },
      { text: 'Self hosting', fontSize },
      { text: 'Browser automation', fontSize },
      { text: 'AI automation', fontSize },
      { text: '13+ years experience', fontSize },

      { text: '\n\n3D & Tech Art', underline: true, underlineOffset: 10 },
      { text: 'Sketchup, Blender, Houdini', fontSize },
      { text: 'Touch Designer, P5, PS', fontSize },
      { text: 'Plugins, Pipelines', fontSize },
      { text: 'Graphic Design', fontSize },
      { text: 'Live Video Art', fontSize },

      { text: '\n\nMusic', underline: true, underlineOffset: 10 },
      { text: 'Ableton, VCV, ClyphX', fontSize },
      { text: 'Drumming, Recording', fontSize },

      { text: '\n\nPrinting & Craft', underline: true, underlineOffset: 10 },
      { text: 'Stickers, Posters, Shirts', fontSize },
      { text: 'FDM, Resin 3D Prints', fontSize },
      { text: 'Flower arrangement', fontSize },
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
    mobile: { fontSizeMultiplier: 1, xOffset: 10, yOffset: 10 },
    layout: ({ screenCenterX, previous }) => {
      const title = previous.title;

      return {
        x: screenCenterX - 0,
        y: (title?.y ?? 0) + 400,
      };
    },
  },
];

export function ServicesSection({ onNavigate }: ServivcesSectionProps) {
  return <P5TextScenePage blocks={SERVICES_BLOCKS} onNavigate={onNavigate} />;
}
