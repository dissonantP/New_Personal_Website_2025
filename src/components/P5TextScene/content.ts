import type p5 from 'p5';

import type { TextSceneBlock, TextSceneBlockSpec, TextSceneContent } from './types';
import { getTextSceneFontStack, measureTextSceneBlock } from './utils';

export function buildTextSceneContent<TTarget extends string>(args: {
  p: p5 | p5.Graphics;
  width: number;
  height: number;
  background: string;
  blocks: TextSceneBlockSpec<TTarget>[];
}): TextSceneContent<TTarget> {
  const previous: Partial<Record<string, TextSceneBlock<TTarget>>> = {};

  return {
    background: args.background,
    fontFamily: getTextSceneFontStack(),
    blocks: args.blocks.map((block) => {
      const blockWithoutMobile = { ...block };
      delete blockWithoutMobile.mobile;
      const isMobile = args.width < (block.mobile?.breakpoint ?? 1000);
      const mobileFontSizeMultiplier = isMobile ? block.mobile?.fontSizeMultiplier ?? 1 : 1;
      const fontSize = block.fontSize(args.width) * mobileFontSizeMultiplier;
      const lineGap = block.lineGap(fontSize);
      const baseMetrics = measureTextSceneBlock(
        args.p,
        block.lines,
        fontSize,
      );
      const metrics = {
        width: baseMetrics.width,
        height: baseMetrics.height + lineGap * Math.max(0, block.lines.length - 1),
        lineGap,
      };
      const position = block.layout({
        width: args.width,
        height: args.height,
        screenCenterX: args.width / 2,
        screenCenterY: args.height / 2,
        metrics,
        previous,
      });
      const layout = {
        ...blockWithoutMobile,
        ...metrics,
        x: position.x,
        y: position.y + (isMobile ? block.mobile?.yOffset ?? 0 : 0),
        style: {
          ...block.style,
          fontSize,
        },
      } satisfies TextSceneBlock<TTarget>;

      previous[block.id] = layout;

      return layout;
    }),
  };
}
