import p5 from 'p5';
import { useEffect, useRef, useState } from 'react';

type HomeItemId = 'software' | 'creative' | 'music';

type HomeItem = {
  id: HomeItemId;
  label: string;
};

type P5HomeProps = {
  items: HomeItem[];
  onNavigate: (id: HomeItemId) => void;
};

type RowLayout = {
  id: 'title' | HomeItemId;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  caret: boolean;
  weight: number;
};

type SdfPassConfig = {
  enabled: boolean;
  spread: number;
  seedThreshold: number;
  showLines: boolean;
  thresholdLines: boolean;
  invert: boolean;
  lineModulo: number;
  lineThickness: number;
};

type SdfConfig = {
  resolutionScale: number;
  includeCarets: boolean;
  passes: [SdfPassConfig, SdfPassConfig];
};

type SdfField = {
  width: number;
  height: number;
  distances: Float32Array;
  sourceScale: number;
};

const title = 'Max Pleaner';
const fontStack =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
const defaultSdfConfig: SdfConfig = {
  resolutionScale: 1,
  includeCarets: false,
  passes: [
    {
      enabled: true,
      spread: 820,
      seedThreshold: 150,
      showLines: true,
      thresholdLines: true,
      invert: false,
      lineModulo: 48,
      lineThickness: 0.11,
    },
    {
      enabled: false,
      spread: 220,
      seedThreshold: 24,
      showLines: false,
      thresholdLines: false,
      invert: false,
      lineModulo: 24,
      lineThickness: 0.12,
    },
  ],
};

function clamp(min: number, value: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getHomeOffset(width: number) {
  if (width <= 640) {
    return clamp(42, width * 0.14, 72);
  }

  return clamp(72, width * 0.095, 140);
}

function getLayout(
  p: p5 | p5.Graphics,
  items: HomeItem[],
  width: number,
  height: number,
): RowLayout[] {
  const fontSize = clamp(26, width * 0.05, 44);
  const paddingX = clamp(20, width * 0.05, 56);
  const paddingY = 22;
  const rowHeight = fontSize * 0.95 + paddingY * 2;
  const rowGap = clamp(56, height * 0.105, 110);
  const homeOffset = getHomeOffset(width);
  const rows = [{ id: 'title' as const, label: title }, ...items];
  const totalHeight = rows.length * rowHeight + (rows.length - 1) * rowGap;
  const startY = (height - totalHeight) / 2;

  p.textFont(fontStack);
  p.textSize(fontSize);

  return rows.map((row, index) => {
    const caret = row.id !== 'title';
    const textWidth = p.textWidth(row.label);
    const caretWidth = caret ? 10 + p.textWidth('>') * 0.72 : 0;
    const rowWidth = textWidth + caretWidth + paddingX * 2;
    const centeredX = (width - rowWidth) / 2;
    const x =
      row.id === 'title'
        ? centeredX
        : centeredX + homeOffset * (index % 2 === 1 ? 1 : -1);

    return {
      ...row,
      x,
      y: startY + index * (rowHeight + rowGap),
      width: rowWidth,
      height: rowHeight,
      caret,
      weight: row.id === 'title' ? 900 : 700,
    };
  });
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) {
    return value < edge0 ? 0 : 1;
  }

  const t = clamp(0, (value - edge0) / (edge1 - edge0), 1);

  return t * t * (3 - 2 * t);
}

function sampleFalloff(value: number) {
  return 1 - smoothstep(0, 1, value);
}

function distanceTransform1d(input: Float32Array, output: Float32Array, length: number) {
  const positions = new Int32Array(length);
  const boundaries = new Float32Array(length + 1);
  let k = 0;

  positions[0] = 0;
  boundaries[0] = Number.NEGATIVE_INFINITY;
  boundaries[1] = Number.POSITIVE_INFINITY;

  for (let q = 1; q < length; q += 1) {
    let intersection =
      (input[q] + q * q - (input[positions[k]] + positions[k] * positions[k])) /
      (2 * q - 2 * positions[k]);

    while (intersection <= boundaries[k]) {
      k -= 1;
      intersection =
        (input[q] + q * q - (input[positions[k]] + positions[k] * positions[k])) /
        (2 * q - 2 * positions[k]);
    }

    k += 1;
    positions[k] = q;
    boundaries[k] = intersection;
    boundaries[k + 1] = Number.POSITIVE_INFINITY;
  }

  k = 0;

  for (let q = 0; q < length; q += 1) {
    while (boundaries[k + 1] < q) {
      k += 1;
    }

    const distance = q - positions[k];
    output[q] = distance * distance + input[positions[k]];
  }
}

function createDistanceField(
  source: p5.Graphics | p5.Image,
  seedThreshold: number,
  sourceScale: number,
): SdfField {
  const width = source.width;
  const height = source.height;
  const infinity = 1e12;
  const seeds = new Float32Array(width * height);
  const columnInput = new Float32Array(height);
  const columnOutput = new Float32Array(height);
  const rowInput = new Float32Array(width);
  const rowOutput = new Float32Array(width);
  const partial = new Float32Array(width * height);
  const distances = new Float32Array(width * height);

  source.loadPixels();

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const brightness =
        source.pixels[pixelIndex] * 0.299 +
        source.pixels[pixelIndex + 1] * 0.587 +
        source.pixels[pixelIndex + 2] * 0.114;

      seeds[y * width + x] = brightness >= seedThreshold ? 0 : infinity;
    }
  }

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      columnInput[y] = seeds[y * width + x];
    }

    distanceTransform1d(columnInput, columnOutput, height);

    for (let y = 0; y < height; y += 1) {
      partial[y * width + x] = columnOutput[y];
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      rowInput[x] = partial[y * width + x];
    }

    distanceTransform1d(rowInput, rowOutput, width);

    for (let x = 0; x < width; x += 1) {
      distances[y * width + x] = rowOutput[x];
    }
  }

  return {
    width,
    height,
    distances,
    sourceScale,
  };
}

function runSdfLinePass(
  source: p5.Graphics | p5.Image,
  p: p5,
  config: SdfPassConfig,
  sourceScale: number,
) {
  const field = createDistanceField(source, config.seedThreshold, sourceScale);
  const image = p.createImage(field.width, field.height);
  const scaledSpread = config.spread * field.sourceScale;

  image.loadPixels();

  for (let y = 0; y < field.height; y += 1) {
    for (let x = 0; x < field.width; x += 1) {
      const fieldIndex = y * field.width + x;
      const pixelIndex = fieldIndex * 4;
      const distance = Math.sqrt(field.distances[fieldIndex]);
      const rawT = distance / scaledSpread;
      const t = clamp(0, rawT, 1);
      const brightness = sampleFalloff(t);
      const phase = (t * config.lineModulo) % 1;
      const lineDistance = Math.min(phase, 1 - phase);
      const thresholdBand = rawT < 1 && lineDistance <= config.lineThickness ? 1 : 0;
      const lineMask = config.invert ? 1 - thresholdBand : thresholdBand;
      const thresholdLineBackground = config.invert ? 1 : 0;
      const line = config.thresholdLines
        ? lineMask + (1 - lineMask) * thresholdLineBackground
        : brightness * lineMask;
      const output = config.showLines ? line : brightness;
      const value = Math.round((config.invert && !config.thresholdLines ? 1 - output : output) * 255);

      image.pixels[pixelIndex] = value;
      image.pixels[pixelIndex + 1] = value;
      image.pixels[pixelIndex + 2] = value;
      image.pixels[pixelIndex + 3] = 255;
    }
  }

  image.updatePixels();

  return image;
}

function compositeMax(base: p5.Image, overlay: p5.Image, p: p5) {
  const image = p.createImage(base.width, base.height);

  base.loadPixels();
  overlay.loadPixels();
  image.loadPixels();

  for (let index = 0; index < image.pixels.length; index += 4) {
    const value = Math.max(base.pixels[index], overlay.pixels[index]);

    image.pixels[index] = value;
    image.pixels[index + 1] = value;
    image.pixels[index + 2] = value;
    image.pixels[index + 3] = 255;
  }

  image.updatePixels();

  return image;
}

function renderSdfPasses(
  source: p5.Graphics,
  p: p5,
  config: SdfConfig,
  sourceScale: number,
) {
  let image: p5.Image | null = null;

  config.passes.forEach((pass) => {
    if (!pass.enabled || pass.spread <= 0) {
      return;
    }

    const nextImage = runSdfLinePass(image ?? source, p, pass, sourceScale);
    image = image ? compositeMax(image, nextImage, p) : nextImage;
  });

  return image;
}

export function P5Home({ items, onNavigate }: P5HomeProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5 | null>(null);
  const layoutRef = useRef<RowLayout[]>([]);
  const navigateRef = useRef(onNavigate);
  const [config, setConfig] = useState<SdfConfig>(defaultSdfConfig);

  useEffect(() => {
    navigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    const sketch = (p: p5) => {
      let hoveredRowId: HomeItemId | null = null;
      let sdfImage: p5.Image | null = null;
      let resizeTimer: number | null = null;

      function getInteractiveRow() {
        return layoutRef.current.find((row) => {
          return (
            row.caret &&
            p.mouseX >= row.x &&
            p.mouseX <= row.x + row.width &&
            p.mouseY >= row.y &&
            p.mouseY <= row.y + row.height
          );
        });
      }

      function updateHover() {
        const row = getInteractiveRow();
        const nextHoveredRowId = row && row.id !== 'title' ? row.id : null;

        if (nextHoveredRowId !== hoveredRowId) {
          hoveredRowId = nextHoveredRowId;
          renderHome();
        }

        p.cursor(hoveredRowId ? p.HAND : p.ARROW);
      }

      function drawContentRows(
        surface: p5 | p5.Graphics,
        rows: RowLayout[],
        useMask: boolean,
        layoutWidth: number,
      ) {
        surface.textFont(fontStack);
        surface.textAlign('left', 'center');
        surface.noStroke();

        rows.forEach((row) => {
          const fontSize = clamp(26, layoutWidth * 0.05, 44);
          const paddingX = clamp(20, layoutWidth * 0.05, 56);
          const isHovered = row.id === hoveredRowId;

          surface.fill(useMask ? '#ffffff' : isHovered ? '#ffffff' : '#f4f1ea');
          surface.textStyle('bold');
          surface.textSize(fontSize);
          surface.text(row.label, row.x + paddingX, row.y + row.height / 2);

          if (row.caret && (!useMask || config.includeCarets)) {
            surface.fill(useMask ? '#ffffff' : isHovered ? '#39e476' : '#20c05c');
            surface.textSize(fontSize * 0.72);
            surface.text('>', row.x + row.width - paddingX, row.y + row.height / 2);
          }
        });
      }

      function renderHome() {
        const rows = getLayout(p, items, p.width, p.height);
        layoutRef.current = rows;

        p.background('#111111');

        if (sdfImage) {
          p.image(sdfImage, 0, 0, p.width, p.height);
        }

        drawContentRows(p, rows, false, p.width);
      }

      function rebuildDistanceField() {
        const scale = config.resolutionScale;
        const useFullResolution = scale >= 0.99;
        const width = useFullResolution ? p.width : Math.max(1, Math.round(p.width * scale));
        const height = useFullResolution ? p.height : Math.max(1, Math.round(p.height * scale));
        const mask = p.createGraphics(width, height);
        const rows = getLayout(p, items, p.width, p.height);

        mask.pixelDensity(1);
        mask.background('#000000');

        if (!useFullResolution) {
          mask.push();
          mask.scale(scale);
        }

        drawContentRows(mask, rows, true, p.width);

        if (!useFullResolution) {
          mask.pop();
        }

        sdfImage = renderSdfPasses(mask, p, config, useFullResolution ? 1 : scale);
        mask.remove();
        renderHome();
        p.noLoop();
      }

      function scheduleDistanceFieldRebuild() {
        if (resizeTimer) {
          window.clearTimeout(resizeTimer);
        }

        resizeTimer = window.setTimeout(rebuildDistanceField, 160);
      }

      p.setup = () => {
        const host = hostRef.current as HTMLDivElement;
        const canvas = p.createCanvas(host.clientWidth, host.clientHeight);
        canvas.parent(hostRef.current as HTMLDivElement);
        canvas.elt.addEventListener('mouseleave', () => {
          hoveredRowId = null;
          p.cursor(p.ARROW);
          renderHome();
        });
        p.pixelDensity(1);
        rebuildDistanceField();
      };

      p.windowResized = () => {
        const host = hostRef.current as HTMLDivElement;
        p.resizeCanvas(host.clientWidth, host.clientHeight);
        renderHome();
        scheduleDistanceFieldRebuild();
      };

      p.mouseMoved = () => {
        updateHover();
      };

      p.mouseClicked = () => {
        const row = getInteractiveRow();

        if (row && row.id !== 'title') {
          navigateRef.current(row.id);
        }
      };
    };

    sketchRef.current = new p5(sketch);

    return () => {
      sketchRef.current?.remove();
      sketchRef.current = null;
    };
  }, [items, config]);

  function updateConfig(update: Partial<SdfConfig>) {
    setConfig((current) => ({ ...current, ...update }));
  }

  function updatePass(index: 0 | 1, update: Partial<SdfPassConfig>) {
    setConfig((current) => {
      const passes = [...current.passes] as [SdfPassConfig, SdfPassConfig];
      passes[index] = { ...passes[index], ...update };

      return { ...current, passes };
    });
  }

  function renderPassControls(index: 0 | 1, label: string) {
    const pass = config.passes[index];

    return (
      <div className="sdf-dev-pass">
        <div className="sdf-dev-pass-title">{label}</div>
        {index === 1 ? (
          <label className="sdf-dev-toggle">
            enabled
            <input
              checked={pass.enabled}
              onChange={(event) => updatePass(index, { enabled: event.target.checked })}
              type="checkbox"
            />
          </label>
        ) : null}
        <label>
          spread
          <input
            max="1600"
            min="0"
            onChange={(event) => updatePass(index, { spread: Number(event.target.value) })}
            step="10"
            type="range"
            value={pass.spread}
          />
          <span>{pass.spread}</span>
        </label>
        <label>
          threshold
          <input
            max="255"
            min="1"
            onChange={(event) => updatePass(index, { seedThreshold: Number(event.target.value) })}
            step="1"
            type="range"
            value={pass.seedThreshold}
          />
          <span>{pass.seedThreshold}</span>
        </label>
        <label className="sdf-dev-toggle">
          lines
          <input
            checked={pass.showLines}
            onChange={(event) => updatePass(index, { showLines: event.target.checked })}
            type="checkbox"
          />
        </label>
        <label className="sdf-dev-toggle">
          threshold
          <input
            checked={pass.thresholdLines}
            onChange={(event) => updatePass(index, { thresholdLines: event.target.checked })}
            type="checkbox"
          />
        </label>
        <label className="sdf-dev-toggle">
          invert
          <input
            checked={pass.invert}
            onChange={(event) => updatePass(index, { invert: event.target.checked })}
            type="checkbox"
          />
        </label>
        <label>
          modulo
          <input
            max="64"
            min="1"
            onChange={(event) => updatePass(index, { lineModulo: Number(event.target.value) })}
            step="1"
            type="range"
            value={pass.lineModulo}
          />
          <span>{pass.lineModulo}</span>
        </label>
        <label>
          thickness
          <input
            max="0.48"
            min="0.01"
            onChange={(event) => updatePass(index, { lineThickness: Number(event.target.value) })}
            step="0.01"
            type="range"
            value={pass.lineThickness}
          />
          <span>{pass.lineThickness.toFixed(2)}</span>
        </label>
      </div>
    );
  }

  return (
    <div className="p5-home" ref={hostRef}>
      <div className="sdf-dev-panel">
        <label>
          resolution
          <input
            max="1"
            min="0.2"
            onChange={(event) => updateConfig({ resolutionScale: Number(event.target.value) })}
            step="0.05"
            type="range"
            value={config.resolutionScale}
          />
          <span>{config.resolutionScale.toFixed(2)}</span>
        </label>
        <label className="sdf-dev-toggle">
          carets
          <input
            checked={config.includeCarets}
            onChange={(event) => updateConfig({ includeCarets: event.target.checked })}
            type="checkbox"
          />
        </label>
        {renderPassControls(0, 'pass 1')}
        {renderPassControls(1, 'pass 2')}
      </div>
      <nav className="p5-home-nav visually-hidden" aria-label="Website sections">
        {items.map((item) => (
          <a
            href={`#${item.id}`}
            key={item.id}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(item.id);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
