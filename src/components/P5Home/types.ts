import type { TextSceneBlock, TextSceneContent } from '../P5TextScene/types';

export type HomeItemId = 'portfolio' | 'services';

export type HomeItem = {
  id: HomeItemId;
  label: string;
};

export type HomeTextBlock = TextSceneBlock<HomeItemId>;
export type HomeTextContent = TextSceneContent<HomeItemId>;
