import p5 from 'p5';

import type { TextSceneBlock, TextSceneContent, TextSceneEffects } from './types';
import {
  getTextSceneLineHref,
  getTextSceneLineOpenInNewTab,
  getTextSceneLineTarget,
  getTextSceneLineText,
} from './utils';

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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
    const blockStep = lineHeight + block.lineGap;
    surface.textStyle(block.style.fontWeight === 400 ? 'normal' : 'bold');
    surface.textAlign(block.style.align, 'center');
    surface.textSize(block.style.fontSize);
    block.lines.forEach((line, index) => {
      const lineTarget = getTextSceneLineTarget(line);
      const lineHref = getTextSceneLineHref(line);
      const isLinkLine = Boolean(lineTarget || lineHref);
      const isHoveredLine =
        hoveredLineKey?.blockId === block.id && hoveredLineKey.lineIndex === index;
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
      surface.text(getTextSceneLineText(line), block.x, block.y + blockStep * index + lineHeight / 2);
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
}) {
  const { effects, onNavigate } = options;

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
      let resizeTimer: number | null = null;
      let content: TContent | null = null;
      let layout: TContent['blocks'] = [];
      let canvasElement: HTMLCanvasElement | null = null;
      let hoveredLineKey: { blockId: string; lineIndex: number } | null = null;
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

      function getLineIndexForPointer(block: TContent['blocks'][number]) {
        const pointer = getPointerPosition();
        const lineHeight = block.style.fontSize * 0.95;
        const lineStep = lineHeight + block.lineGap;

        if (
          pointer.x < block.x ||
          pointer.x > block.x + block.width ||
          pointer.y < block.y ||
          pointer.y > block.y + block.height
        ) {
          return null;
        }

        return clamp(0, Math.floor((pointer.y - block.y) / lineStep), block.lines.length - 1);
      }

      function getInteractiveHit() {
        for (const block of layout) {
          const lineIndex = getLineIndexForPointer(block);

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

      function updateHover() {
        const hit = getInteractiveHit();
        const nextHoveredBlockId = hit ? hit.block.id : null;
        const nextHoveredLineKey = hit ? { blockId: hit.block.id, lineIndex: hit.lineIndex } : null;

        if (
          nextHoveredBlockId !== hoveredBlockId ||
          nextHoveredLineKey?.blockId !== hoveredLineKey?.blockId ||
          nextHoveredLineKey?.lineIndex !== hoveredLineKey?.lineIndex
        ) {
          hoveredBlockId = nextHoveredBlockId;
          hoveredLineKey = nextHoveredLineKey;
          renderScene();
        }

        p.cursor(hit ? p.HAND : p.ARROW);
      }

      function renderScene() {
        if (!content) {
          return;
        }

        content = getContent(p, p.width, p.height);
        layout = content.blocks;

        p.background(content.background);

        if (renderedImage) {
          p.image(renderedImage, 0, 0, p.width, p.height);
        }

        drawBlocks(p, layout, content.fontFamily, hoveredBlockId, hoveredLineKey, false);
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
        canvas.elt.addEventListener('mouseleave', () => {
          hoveredBlockId = null;
          hoveredLineKey = null;
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

      p.mouseMoved = () => {
        updateHover();
      };

      p.mouseClicked = () => {
        const hit = getInteractiveHit();

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
      };
    };
  };
}
