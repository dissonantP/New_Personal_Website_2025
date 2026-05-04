export type HomeItemId = 'portfolio' | 'services';

export type HomeItem = {
  id: HomeItemId;
  label: string;
};

export type TextBlockId = 'title' | 'description' | 'links';

export type TextBlockSpec = {
  id: TextBlockId;
  lines: string[];
  align: 'left' | 'center';
  interactive: boolean;
  targets?: [HomeItemId, HomeItemId];
};

export type TextBlockLayout = TextBlockSpec & {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  lineGap: number;
};
