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
  lineGap: number,
) {
  p.textFont(FONT_STACK);
  p.textSize(fontSize);

  const lineHeight = fontSize * 0.95;
  const width = Math.max(
    0,
    ...lines.flatMap((line) =>
      getTextSceneLineFragments(line).map((fragment) => p.textWidth(fragment)),
    ),
  );
  const height =
    lines.reduce((total, line) => total + getTextSceneLineFragments(line).length * lineHeight, 0) +
    lineGap * Math.max(0, lines.length - 1);

  return {
    width,
    height,
  };
}

export function getTextSceneLineText<TTarget extends string>(line: TextSceneLine<TTarget>) {
  return typeof line === 'string' ? line : line.text;
}

export function getTextSceneLineFragments<TTarget extends string>(line: TextSceneLine<TTarget>) {
  return getTextSceneLineText(line).split('\n');
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
