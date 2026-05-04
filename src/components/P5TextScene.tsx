import p5 from 'p5';
import { useEffect, useRef } from 'react';

type P5TextSceneProps<TContent> = {
  getContent: (p: p5, width: number, height: number) => TContent;
  createSketch: (args: {
    getHostElement: () => HTMLDivElement | null;
    getContent: (p: p5, width: number, height: number) => TContent;
  }) => (p: p5) => void;
};

export function P5TextScene<TContent>({ getContent, createSketch }: P5TextSceneProps<TContent>) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5 | null>(null);

  useEffect(() => {
    const sketch = createSketch({
      getHostElement: () => hostRef.current,
      getContent,
    });

    sketchRef.current = new p5(sketch);

    return () => {
      sketchRef.current?.remove();
      sketchRef.current = null;
    };
  }, [createSketch, getContent]);

  return <div className="p5-home" ref={hostRef} />;
}
