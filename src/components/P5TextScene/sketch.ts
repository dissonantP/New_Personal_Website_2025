import p5 from 'p5';

import type { TextSceneBlock, TextSceneContent, TextSceneEffects } from './types';
import type { MouseGlitchPointer, MouseGlitchPostprocessConfig } from './postprocess';
import { applyMouseGlitchPostprocess } from './postprocess';
import {
  getTextSceneLineFragments,
  getTextSceneLineHref,
  getTextSceneLineOpenInNewTab,
  getTextSceneLineTarget,
} from './utils';

function drawBlocks<TTarget extends string>(
  surface: p5 | p5.Graphics,
  blocks: Array<TextSceneBlock<TTarget>>,
  fontFamily: string,
  hoveredBlockId: string | null,
  hoveredLineKey: { blockId: string; lineIndex: number } | null,
  useMask: boolean,
) {
  surface.textFont(fontFamily);
  surface.noStroke();

  blocks.forEach((block) => {
    const lineHeight = block.style.fontSize * 0.95;
    surface.textStyle(block.style.fontWeight === 400 ? 'normal' : 'bold');
    surface.textAlign(block.style.align, 'center');
    surface.textSize(block.style.fontSize);
    let cursorY = block.y;

    block.lines.forEach((line, index) => {
      const lineTarget = getTextSceneLineTarget(line);
      const lineHref = getTextSceneLineHref(line);
      const isLinkLine = Boolean(lineTarget || lineHref);
      const isHoveredLine =
        hoveredLineKey?.blockId === block.id && hoveredLineKey.lineIndex === index;
      const fragments = getTextSceneLineFragments(line);
      const fillColor = useMask
        ? '#ffffff'
        : isLinkLine
          ? isHoveredLine
            ? block.style.linkHoverFill ?? block.style.hoverFill ?? block.style.fill
            : block.style.linkFill ?? block.style.fill
          : block.id === hoveredBlockId
            ? block.style.hoverFill ?? block.style.fill
            : block.style.fill;

      surface.fill(fillColor);
      fragments.forEach((fragment, fragmentIndex) => {
        surface.text(fragment, block.x, cursorY + lineHeight / 2 + lineHeight * fragmentIndex);
      });
      cursorY += fragments.length * lineHeight + block.lineGap;
    });
  });
}

export function createTextSceneSketch<
  TContent extends TextSceneContent<TTarget>,
  TTarget extends string,
  TState,
>(options: {
  effects: TextSceneEffects<TContent, TState>;
  onNavigate: (id: TTarget) => void;
  postprocess?: MouseGlitchPostprocessConfig | null;
}) {
  const { effects, onNavigate, postprocess } = options;

  return ({
    getHostElement,
    getRenderPostprocess,
    getContent,
  }: {
    getHostElement: () => HTMLDivElement | null;
    getRenderPostprocess: (host: HTMLDivElement) => {
      scale: number;
      translateX: number;
      translateY: number;
    };
    getContent: (p: p5, width: number, height: number) => TContent;
  }) => {
    return (p: p5) => {
      let hoveredBlockId: string | null = null;
      let effectRuntime: { baseImage: p5.Image | null; state: TState; animate: boolean } | null =
        null;
      let renderedImage: p5.Image | null = null;
      let sceneBuffer: p5.Graphics | null = null;
      let resizeTimer: number | null = null;
      let content: TContent | null = null;
      let layout: TContent['blocks'] = [];
      let canvasElement: HTMLCanvasElement | null = null;
      let hoveredLineKey: { blockId: string; lineIndex: number } | null = null;
      let currentPointer: MouseGlitchPointer = null;
      let currentPostprocess = {
        scale: 1,
        translateX: 0,
        translateY: 0,
      };

      function sizeCanvas(host: HTMLDivElement) {
        currentPostprocess = getRenderPostprocess(host);
        const renderWidth = Math.max(1, Math.round(host.clientWidth / currentPostprocess.scale));
        const renderHeight = Math.max(1, Math.round(host.clientHeight / currentPostprocess.scale));

        p.resizeCanvas(renderWidth, renderHeight);
        if (canvasElement) {
          canvasElement.style.width = `${host.clientWidth}px`;
          canvasElement.style.height = `${host.clientHeight}px`;
          canvasElement.style.position = 'absolute';
          canvasElement.style.left = `calc(50% + ${currentPostprocess.translateX}px)`;
          canvasElement.style.top = `calc(50% + ${currentPostprocess.translateY}px)`;
          canvasElement.style.transform = `translate(-50%, -50%) scale(${currentPostprocess.scale})`;
          canvasElement.style.transformOrigin = 'center center';
        }
      }

      function getPointerPosition() {
        const host = getHostElement();

        if (!host) {
          return {
            x: p.mouseX,
            y: p.mouseY,
          };
        }

        const renderWidth = Math.max(1, Math.round(host.clientWidth / currentPostprocess.scale));
        const renderHeight = Math.max(1, Math.round(host.clientHeight / currentPostprocess.scale));

        return {
          x:
            (p.mouseX - host.clientWidth / 2 - currentPostprocess.translateX) /
              currentPostprocess.scale +
            renderWidth / 2,
          y:
            (p.mouseY - host.clientHeight / 2 - currentPostprocess.translateY) /
              currentPostprocess.scale +
            renderHeight / 2,
        };
      }

      function getPointerPositionFromClient(clientX: number, clientY: number) {
        const host = getHostElement();

        if (!host) {
          return {
            x: clientX,
            y: clientY,
          };
        }

        const hostRect = host.getBoundingClientRect();
        const localX = clientX - hostRect.left;
        const localY = clientY - hostRect.top;
        const renderWidth = Math.max(1, Math.round(host.clientWidth / currentPostprocess.scale));
        const renderHeight = Math.max(1, Math.round(host.clientHeight / currentPostprocess.scale));

        return {
          x:
            (localX - host.clientWidth / 2 - currentPostprocess.translateX) /
              currentPostprocess.scale +
            renderWidth / 2,
          y:
            (localY - host.clientHeight / 2 - currentPostprocess.translateY) /
              currentPostprocess.scale +
            renderHeight / 2,
        };
      }

      function ensureSceneBuffer() {
        if (sceneBuffer && sceneBuffer.width === p.width && sceneBuffer.height === p.height) {
          return sceneBuffer;
        }

        sceneBuffer?.remove();
        sceneBuffer = p.createGraphics(p.width, p.height);
        sceneBuffer.pixelDensity(1);

        return sceneBuffer;
      }

      function getLineIndexForPointer(
        block: TContent['blocks'][number],
        pointer: { x: number; y: number },
      ) {
        const lineHeight = block.style.fontSize * 0.95;
        const blockLeft = block.style.align === 'center' ? block.x - block.width / 2 : block.x;
        const blockRight = blockLeft + block.width;

        if (
          pointer.x < blockLeft ||
          pointer.x > blockRight ||
          pointer.y < block.y ||
          pointer.y > block.y + block.height
        ) {
          return null;
        }

        let cursorY = block.y;

        for (let index = 0; index < block.lines.length; index += 1) {
          const fragments = getTextSceneLineFragments(block.lines[index]);
          const lineTop = cursorY;
          const lineBottom = cursorY + fragments.length * lineHeight;

          if (pointer.y >= lineTop && pointer.y <= lineBottom) {
            return index;
          }

          cursorY += fragments.length * lineHeight + block.lineGap;
        }

        return null;
      }

      function getInteractiveHit(pointer = getPointerPosition()) {
        for (const block of layout) {
          const lineIndex = getLineIndexForPointer(block, pointer);

          if (lineIndex === null) {
            continue;
          }

          const line = block.lines[lineIndex];
          const target = block.targets?.[lineIndex] ?? getTextSceneLineTarget(line);
          const href = getTextSceneLineHref(line);

          if (target || href) {
            return { block, target, href, lineIndex };
          }
        }

        return null;
      }

      function updateHover(pointer = getPointerPosition()) {
        const hit = getInteractiveHit(pointer);
        const nextHoveredBlockId = hit ? hit.block.id : null;
        const nextHoveredLineKey = hit ? { blockId: hit.block.id, lineIndex: hit.lineIndex } : null;

        if (
          nextHoveredBlockId !== hoveredBlockId ||
          nextHoveredLineKey?.blockId !== hoveredLineKey?.blockId ||
          nextHoveredLineKey?.lineIndex !== hoveredLineKey?.lineIndex
        ) {
          hoveredBlockId = nextHoveredBlockId;
          hoveredLineKey = nextHoveredLineKey;
        }

        p.cursor(hit ? p.HAND : p.ARROW);
      }

      function renderScene() {
        if (!content) {
          return;
        }

        content = getContent(p, p.width, p.height);
        layout = content.blocks;

        const scene = ensureSceneBuffer();
        scene.background(content.background);

        if (renderedImage) {
          scene.image(renderedImage, 0, 0, p.width, p.height);
        }

        drawBlocks(scene, layout, content.fontFamily, hoveredBlockId, hoveredLineKey, false);

        const finalImage =
          postprocess?.enabled && currentPointer
            ? applyMouseGlitchPostprocess(scene, p, currentPointer, p.millis() / 1000, postprocess)
            : scene;

        p.background(content.background);
        p.image(finalImage, 0, 0, p.width, p.height);
      }

      function rebuildEffect() {
        content = getContent(p, p.width, p.height);
        layout = content.blocks;

        const mask = p.createGraphics(p.width, p.height);
        mask.pixelDensity(1);
        mask.background('#000000');
        drawBlocks(mask, layout, content.fontFamily, null, null, true);

        effectRuntime = effects.build({
          p,
          mask,
          content,
          width: p.width,
          height: p.height,
        });

        renderedImage = effectRuntime.baseImage;
        mask.remove();
        renderScene();

        if (effectRuntime.animate && effects.renderFrame) {
          p.loop();
        } else {
          p.noLoop();
        }
      }

      function scheduleRebuild() {
        if (resizeTimer) {
          window.clearTimeout(resizeTimer);
        }

        resizeTimer = window.setTimeout(rebuildEffect, 160);
      }

      p.setup = () => {
        const mountPoint = getHostElement();

        if (!mountPoint) {
          return;
        }

        currentPostprocess = getRenderPostprocess(mountPoint);
        const canvas = p.createCanvas(
          Math.max(1, Math.round(mountPoint.clientWidth / currentPostprocess.scale)),
          Math.max(1, Math.round(mountPoint.clientHeight / currentPostprocess.scale)),
        );
        canvasElement = canvas.elt as HTMLCanvasElement;
        canvas.parent(mountPoint);
        canvasElement.style.width = `${mountPoint.clientWidth}px`;
        canvasElement.style.height = `${mountPoint.clientHeight}px`;
        canvasElement.style.position = 'absolute';
        canvasElement.style.left = `calc(50% + ${currentPostprocess.translateX}px)`;
        canvasElement.style.top = `calc(50% + ${currentPostprocess.translateY}px)`;
        canvasElement.style.transform = `translate(-50%, -50%) scale(${currentPostprocess.scale})`;
        canvasElement.style.transformOrigin = 'center center';
        canvasElement.style.touchAction = 'manipulation';
        canvasElement.addEventListener('pointermove', (event: PointerEvent) => {
          currentPointer = getPointerPositionFromClient(event.clientX, event.clientY);
          updateHover(currentPointer);
          renderScene();
        });
        canvasElement.addEventListener('pointerup', (event: PointerEvent) => {
          activateHitFromClient(event.clientX, event.clientY);
        });
        canvasElement.addEventListener('click', (event: MouseEvent) => {
          activateHitFromClient(event.clientX, event.clientY);
        });
        canvas.elt.addEventListener('mouseleave', () => {
          hoveredBlockId = null;
          hoveredLineKey = null;
          currentPointer = null;
          p.cursor(p.ARROW);
          renderScene();
        });
        p.pixelDensity(1);
        content = getContent(p, p.width, p.height);
        layout = content.blocks;
        rebuildEffect();
      };

      p.draw = () => {
        if (!effectRuntime || !renderedImage || !effectRuntime.animate || !effects.renderFrame) {
          return;
        }

        renderedImage = effects.renderFrame(effectRuntime.state, p, p.millis() / 1000);
        renderScene();
      };

      p.windowResized = () => {
        const host = getHostElement();

        if (!host) {
          return;
        }

        sizeCanvas(host);
        renderScene();
        scheduleRebuild();
      };

      function activateHitFromClient(clientX: number, clientY: number) {
        activateHit(getPointerPositionFromClient(clientX, clientY));
      }

      function activateHit(pointer = getPointerPosition()) {
        const hit = getInteractiveHit(pointer);

        if (hit) {
          if (hit.href) {
            const line = hit.block.lines[hit.lineIndex];

            if (getTextSceneLineOpenInNewTab(line)) {
              window.open(hit.href, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = hit.href;
            }
            return;
          }

          if (hit.target) {
            onNavigate(hit.target);
          }
        }
      }

    };
  };
}
