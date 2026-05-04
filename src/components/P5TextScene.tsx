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
    let initTimer: number | null = null;
    let cancelled = false;

    function startSketch() {
      if (cancelled || sketchRef.current) {
        return;
      }

      const host = hostRef.current;

      if (!host || host.clientWidth <= 0 || host.clientHeight <= 0) {
        initTimer = window.setTimeout(startSketch, 16);
        return;
      }

      const sketch = createSketch({
        getHostElement: () => hostRef.current,
        getContent,
      });

      sketchRef.current = new p5(sketch);
    }

    startSketch();

    return () => {
      cancelled = true;
      if (initTimer) {
        window.clearTimeout(initTimer);
      }
      sketchRef.current?.remove();
      sketchRef.current = null;
    };
  }, [createSketch, getContent]);

  return <div className="p5-home" ref={hostRef} />;
}
