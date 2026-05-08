import p5 from 'p5';
import { useEffect, useRef } from 'react';

type P5TextSceneProps<TContent> = {
  getContent: (p: p5, width: number, height: number) => TContent;
  createSketch: (args: {
    getHostElement: () => HTMLDivElement | null;
    getContent: (p: p5, width: number, height: number) => TContent;
    getRenderPostprocess: (host: HTMLDivElement) => {
      scale: number;
      translateX: number;
      translateY: number;
    };
  }) => (p: p5) => void;
  getRenderPostprocess?: (host: HTMLDivElement) => {
    scale: number;
    translateX: number;
    translateY: number;
  };
};

const RENDER_POSTPROCESS = {
  mobileBreakpoint: 500,
  mobileScale: 0.7,
  mobileTranslateX: 0,
  mobileTranslateY: 30,
};

function defaultRenderPostprocess(host: HTMLDivElement) {
  if (host.clientWidth < RENDER_POSTPROCESS.mobileBreakpoint) {
    return {
      scale: RENDER_POSTPROCESS.mobileScale,
      translateX: RENDER_POSTPROCESS.mobileTranslateX,
      translateY: RENDER_POSTPROCESS.mobileTranslateY,
    };
  }

  return { scale: 1, translateX: 0, translateY: 0 };
}

export function P5TextScene<TContent>({
  getContent,
  createSketch,
  getRenderPostprocess = defaultRenderPostprocess,
}: P5TextSceneProps<TContent>) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5 | null>(null);

  useEffect(() => {
    let initTimer: number | null = null;
    let cancelled = false;
    const fontReady = document.fonts?.ready ?? Promise.resolve();

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
        getRenderPostprocess,
      });

      sketchRef.current = new p5(sketch);
    }

    void fontReady.then(() => {
      startSketch();
    });

    return () => {
      cancelled = true;
      if (initTimer) {
        window.clearTimeout(initTimer);
      }
      sketchRef.current?.remove();
      sketchRef.current = null;
    };
  }, [createSketch, getContent, getRenderPostprocess]);

  return <div className="p5-home" ref={hostRef} />;
}
