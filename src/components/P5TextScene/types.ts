import type p5 from 'p5';

export type TextSceneBlockStyle = {
  fontSize: number;
  align: 'left' | 'center';
  fill: string;
  hoverFill?: string;
  linkFill?: string;
  linkHoverFill?: string;
  fontWeight?: 400 | 600 | 700 | 900;
};

export type TextSceneLine<TTarget extends string = string> =
  | string
  | {
      text: string;
      target?: TTarget;
      href?: string;
      openInNewTab?: boolean;
    };

export type TextSceneBlock<TTarget extends string = string> = {
  id: string;
  lines: TextSceneLine<TTarget>[];
  x: number;
  y: number;
  width: number;
  height: number;
  lineGap: number;
  interactive: boolean;
  targets?: TTarget[];
  style: TextSceneBlockStyle;
};

export type TextSceneBlockSpec<TTarget extends string = string> = {
  id: string;
  lines: TextSceneLine<TTarget>[];
  interactive: boolean;
  targets?: TTarget[];
  style: TextSceneBlockStyle;
  fontSize: (width: number) => number;
  lineGap: (fontSize: number) => number;
  layout: (args: {
    width: number;
    height: number;
    screenCenterX: number;
    screenCenterY: number;
    metrics: Pick<TextSceneBlock<TTarget>, 'width' | 'height' | 'lineGap'>;
    previous: Partial<Record<string, TextSceneBlock<TTarget>>>;
  }) => { x: number; y: number };
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
