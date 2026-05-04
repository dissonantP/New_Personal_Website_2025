import type p5 from 'p5';

export type TextSceneBlockStyle = {
  fontSize: number;
  align: 'left' | 'center';
  fill: string;
  hoverFill?: string;
  fontWeight?: 400 | 700 | 900;
};

export type TextSceneBlock<TTarget extends string = string> = {
  id: string;
  lines: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  lineGap: number;
  interactive: boolean;
  targets?: [TTarget, TTarget];
  style: TextSceneBlockStyle;
};

export type TextSceneContent<TTarget extends string = string> = {
  background: string;
  fontFamily: string;
  blocks: TextSceneBlock<TTarget>[];
};

export type TextSceneEffectRuntime<TState> = {
  baseImage: p5.Image | null;
  state: TState;
  animate: boolean;
};

export type TextSceneEffects<TContent, TState> = {
  build: (args: {
    p: p5;
    mask: p5.Graphics;
    content: TContent;
    width: number;
    height: number;
  }) => TextSceneEffectRuntime<TState>;
  renderFrame?: (state: TState, p: p5, elapsedSeconds: number) => p5.Image | null;
};
