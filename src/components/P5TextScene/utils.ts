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
  let width = 0;
  let height = 0;

  lines.forEach((line) => {
    const lineFontSize = getTextSceneLineFontSize(line, fontSize);
    const lineHeight = lineFontSize * 0.95;

    p.textFont(FONT_STACK);
    p.textSize(lineFontSize);

    getTextSceneLineFragments(line).forEach((fragment) => {
      width = Math.max(width, p.textWidth(fragment));
    });

    height += getTextSceneLineFragments(line).length * lineHeight;
  });

  height += lineGap * Math.max(0, lines.length - 1);

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

export function getTextSceneLineUnderline<TTarget extends string>(line: TextSceneLine<TTarget>) {
  return typeof line === 'string' ? false : Boolean(line.underline);
}

export function getTextSceneLineUnderlineOffset<TTarget extends string>(
  line: TextSceneLine<TTarget>,
) {
  return typeof line === 'string' ? 0 : line.underlineOffset ?? 0;
}

export function getTextSceneLineFontSize<TTarget extends string>(
  line: TextSceneLine<TTarget>,
  fallback: number,
) {
  return typeof line === 'string' ? fallback : line.fontSize ?? fallback;
}

export { clamp };
