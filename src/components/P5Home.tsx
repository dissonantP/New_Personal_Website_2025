import type p5 from 'p5';
import { useCallback, useMemo } from 'react';

import { P5TextScene } from './P5TextScene';
import { createTextSceneSketch } from './P5TextScene/sketch';
import type { HomeItemId } from './P5Home/types';
import { getHomeContent, getHomeItems } from './P5Home/content';
import { createHomeEffects } from './P5Home/effects';

type P5HomeProps = {
  onNavigate: (id: HomeItemId) => void;
};

export function P5Home({ onNavigate }: P5HomeProps) {
  const items = useMemo(() => getHomeItems(), []);
  const getContent = useCallback(
    (p: p5, width: number, height: number) => getHomeContent(p, items, width, height),
    [items],
  );
  const effects = useMemo(() => createHomeEffects(), []);
  const navigate = useCallback((id: HomeItemId) => onNavigate(id), [onNavigate]);
  const createSketch = useMemo(
    () => createTextSceneSketch({ effects, onNavigate: navigate }),
    [effects, navigate],
  );

  return <P5TextScene getContent={getContent} createSketch={createSketch} />;
}
