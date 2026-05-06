import type p5 from 'p5';

import type { TextSceneLine } from './types';

const FONT_STACK =
  '"ErsiqustDemoRegular", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getTextSceneFontStack() {
  return FONT_STACK;
}

export function measureTextSceneBlock<TTarget extends string>(
  p: p5 | p5.Graphics,
  lines: TextSceneLine<TTarget>[],
  fontSize: number,
) {
  p.textFont(FONT_STACK);
  p.textSize(fontSize);

  const lineHeight = fontSize * 0.95;
  const width = Math.max(...lines.map((line) => p.textWidth(getTextSceneLineText(line))));

  return {
    width,
    height: lineHeight * lines.length,
  };
}

export function getTextSceneLineText<TTarget extends string>(line: TextSceneLine<TTarget>) {
  return typeof line === 'string' ? line : line.text;
}

export function getTextSceneLineTarget<TTarget extends string>(line: TextSceneLine<TTarget>) {
  return typeof line === 'string' ? undefined : line.target;
}

export function getTextSceneLineHref<TTarget extends string>(line: TextSceneLine<TTarget>) {
  return typeof line === 'string' ? undefined : line.href;
}

export function getTextSceneLineOpenInNewTab<TTarget extends string>(line: TextSceneLine<TTarget>) {
  return typeof line === 'string' ? false : Boolean(line.openInNewTab);
}

export { clamp };
