import p5 from 'p5';
import { useCallback, useMemo } from 'react';

import { P5TextScene } from './P5TextScene';
import { buildTextSceneContent } from './P5TextScene/content';
import { createTextSceneSketch } from './P5TextScene/sketch';
import type { MouseGlitchPostprocessConfig } from './P5TextScene/postprocess';
import type { TextSceneBlockSpec, TextSceneContent } from './P5TextScene/types';
import { createTextSceneEffects } from './P5Home/effects';

type P5TextScenePageProps<TTarget extends string> = {
  blocks: TextSceneBlockSpec<TTarget>[];
  onNavigate: (id: TTarget) => void;
  background?: string;
  postprocess?: MouseGlitchPostprocessConfig | null;
  getRenderPostprocess?: (host: HTMLDivElement) => {
    scale: number;
    translateX: number;
    translateY: number;
  };
};

export function P5TextScenePage<TTarget extends string>({
  blocks,
  onNavigate,
  background = '#FFFFFF',
  postprocess = null,
  getRenderPostprocess,
}: P5TextScenePageProps<TTarget>) {
  const getContent = useCallback(
    (p: p5, width: number, height: number) =>
      buildTextSceneContent<TTarget>({
        p,
        width,
        height,
        background,
        blocks,
      }),
    [background, blocks],
  );

  const effects = useMemo(
    () => createTextSceneEffects<TextSceneContent<TTarget>>(),
    [],
  );
  const createSketch = useMemo(
    () => createTextSceneSketch({ effects, onNavigate, postprocess }),
    [effects, onNavigate, postprocess],
  );

  return (
    <P5TextScene
      getContent={getContent}
      createSketch={createSketch}
      getRenderPostprocess={getRenderPostprocess}
    />
  );
}
