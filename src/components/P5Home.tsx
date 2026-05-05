import p5 from 'p5';
import { useCallback, useMemo, useState } from 'react';

import { P5TextScene } from './P5TextScene';
import { createTextSceneSketch } from './P5TextScene/sketch';
import { buildTextSceneContent } from './P5TextScene/content';
import type { TextSceneBlockSpec } from './P5TextScene/types';
import type { HomeItemId } from './P5Home/types';
import {
  createHomeEffects,
  defaultSdfConfig,
  type SdfConfig,
  type SdfPassConfig,
} from './P5Home/effects';
import { clamp } from './P5Home/utils';

type P5HomeProps = {
  onNavigate: (id: HomeItemId) => void;
};

const yOffset = -20;

const HOME_BLOCKS: TextSceneBlockSpec<HomeItemId>[] = [
  {
    id: 'title',
    lines: ['Max Pleaner'],
    interactive: false,
    style: { fontSize: 0, align: 'center', fill: '#f4f1ea', fontWeight: 900 },
    fontSize: (width) => clamp(26, width * 0.05, 44),
    lineGap: (fontSize) => fontSize * 0.15,
    layout: ({ screenCenterX, screenCenterY }) => ({
      x: screenCenterX + 10,
      y: screenCenterY + yOffset - 300,
    }),
  },
  {
    id: 'description',
    lines: ['software', 'art', 'media', 'music'],
    interactive: false,
    style: { fontSize: 0, align: 'left', fill: '#f4f1ea', fontWeight: 700 },
    fontSize: (width) => clamp(18, width * 0.035, 24),
    lineGap: (fontSize) => fontSize * 0.28,
    layout: ({ screenCenterX, previous }) => {
      const title = previous.title;
      const titleY = title?.y ?? 0;

      return {
        x: screenCenterX - 100,
        y: titleY + 170,
      };
    },
  },
  {
    id: 'portfolio',
    lines: ['portfolio'],
    interactive: true,
    targets: ['portfolio'],
    style: { fontSize: 0, align: 'left', fill: '#20c05c', hoverFill: '#39e476', fontWeight: 700 },
    fontSize: (width) => clamp(18, width * 0.035, 24),
    lineGap: (fontSize) => fontSize * 0.45,
    layout: ({ screenCenterX, previous }) => {
      const description = previous.description;

      if (!description) {
        return { x: screenCenterX + 10, y: 0 };
      }

      return {
        x: screenCenterX + 10,
        y: description.y + 230,
      };
    },
  },
  {
    id: 'services',
    lines: ['services'],
    interactive: true,
    targets: ['services'],
    style: { fontSize: 0, align: 'left', fill: '#20c05c', hoverFill: '#39e476', fontWeight: 700 },
    fontSize: (width) => clamp(18, width * 0.035, 24),
    lineGap: (fontSize) => fontSize * 0.45,
    layout: ({ screenCenterX, previous }) => {
      const portfolio = previous.portfolio;

      if (!portfolio) {
        return { x: screenCenterX - 100, y: 0 };
      }

      return {
        x: screenCenterX - 100,
        y: portfolio.y + 170,
      };
    },
  },
];

function cloneConfig(config: SdfConfig): SdfConfig {
  return {
    ...config,
    passes: config.passes.map((pass) => ({ ...pass })) as [SdfPassConfig, SdfPassConfig],
  };
}

function updateNumericInput(value: string, apply: (value: number) => void) {
  if (value.trim() === '') {
    return;
  }

  const nextValue = Number(value);

  if (Number.isFinite(nextValue)) {
    apply(nextValue);
  }
}

function InputRow(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number | string;
  onChange: (value: number) => void;
}) {
  const { label, value, min, max, step, onChange } = props;

  return (
    <label>
      {label}
      <input
        max={String(max)}
        min={String(min)}
        onChange={(event) => onChange(Number(event.target.value))}
        step={String(step)}
        type="range"
        value={value}
      />
      <input
        className="sdf-dev-number"
        onChange={(event) => updateNumericInput(event.target.value, onChange)}
        step="any"
        type="number"
        value={value}
      />
    </label>
  );
}

function ToggleRow(props: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const { label, checked, onChange } = props;

  return (
    <label className="sdf-dev-toggle">
      {label}
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
    </label>
  );
}

function ColorRow(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { label, value, onChange } = props;

  return (
    <label className="sdf-dev-color-row">
      {label}
      <input onChange={(event) => onChange(event.target.value)} type="color" value={value} />
      <input
        className="sdf-dev-color-value"
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </label>
  );
}

function renderPassControls(
  pass: SdfPassConfig,
  index: 0 | 1,
  updatePass: (index: 0 | 1, update: Partial<SdfPassConfig>) => void,
) {
  return (
    <div className="sdf-dev-pass">
      <div className="sdf-dev-pass-title">pass {index + 1}</div>
      <ToggleRow
        label="enabled"
        checked={pass.enabled}
        onChange={(checked) => updatePass(index, { enabled: checked })}
      />
      <InputRow
        label="spread"
        value={pass.spread}
        min={0}
        max={1600}
        step={10}
        onChange={(value) => updatePass(index, { spread: value })}
      />
      <InputRow
        label="threshold"
        value={pass.seedThreshold}
        min={1}
        max={255}
        step={1}
        onChange={(value) => updatePass(index, { seedThreshold: value })}
      />
      <ToggleRow
        label="lines"
        checked={pass.showLines}
        onChange={(checked) => updatePass(index, { showLines: checked })}
      />
      <ToggleRow
        label="threshold"
        checked={pass.thresholdLines}
        onChange={(checked) => updatePass(index, { thresholdLines: checked })}
      />
      <ToggleRow
        label="invert"
        checked={pass.invert}
        onChange={(checked) => updatePass(index, { invert: checked })}
      />
      <InputRow
        label="modulo"
        value={pass.lineModulo}
        min={1}
        max={64}
        step={1}
        onChange={(value) => updatePass(index, { lineModulo: value })}
      />
      <InputRow
        label="thickness"
        value={pass.lineThickness}
        min={0.01}
        max={0.48}
        step={0.01}
        onChange={(value) => updatePass(index, { lineThickness: value })}
      />
      <InputRow
        label="cutoff min"
        value={pass.cutoffMin}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updatePass(index, { cutoffMin: value })}
      />
      <InputRow
        label="cutoff max"
        value={pass.cutoffMax}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updatePass(index, { cutoffMax: value })}
      />
      <InputRow
        label="noise amp"
        value={pass.noiseAmplitude}
        min={0}
        max={400}
        step={5}
        onChange={(value) => updatePass(index, { noiseAmplitude: value })}
      />
      <InputRow
        label="noise freq"
        value={pass.noiseFrequency}
        min={0.001}
        max={0.08}
        step={0.001}
        onChange={(value) => updatePass(index, { noiseFrequency: value })}
      />
      <ColorRow
        label="start color"
        value={pass.startColor}
        onChange={(value) => updatePass(index, { startColor: value })}
      />
      <ColorRow
        label="end color"
        value={pass.endColor}
        onChange={(value) => updatePass(index, { endColor: value })}
      />
      <InputRow
        label="pow"
        value={pass.gradientPow}
        min={0.1}
        max={8}
        step={0.1}
        onChange={(value) => updatePass(index, { gradientPow: value })}
      />
      <ColorRow
        label="first color"
        value={pass.firstLineColor}
        onChange={(value) => updatePass(index, { firstLineColor: value })}
      />
      <InputRow
        label="first width"
        value={pass.firstLineColorWidth}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updatePass(index, { firstLineColorWidth: value })}
      />
      <InputRow
        label="first start"
        value={pass.firstLineColorStart}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updatePass(index, { firstLineColorStart: value })}
      />
      <ColorRow
        label="band color"
        value={pass.bandColor}
        onChange={(value) => updatePass(index, { bandColor: value })}
      />
      <InputRow
        label="band center"
        value={pass.bandCenter}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updatePass(index, { bandCenter: value })}
      />
      <InputRow
        label="band width"
        value={pass.bandWidth}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updatePass(index, { bandWidth: value })}
      />
      <InputRow
        label="band amt"
        value={pass.bandCenterAmt}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updatePass(index, { bandCenterAmt: value })}
      />
      <InputRow
        label="band speed"
        value={pass.bandCenterSpeed}
        min={0}
        max={8}
        step={0.01}
        onChange={(value) => updatePass(index, { bandCenterSpeed: value })}
      />
      <ColorRow
        label="pulse color"
        value={pass.pulseColor}
        onChange={(value) => updatePass(index, { pulseColor: value })}
      />
      <InputRow
        label="pulse width"
        value={pass.pulseWidth}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updatePass(index, { pulseWidth: value })}
      />
      <InputRow
        label="pulse speed"
        value={pass.pulseSpeed}
        min={0}
        max={2}
        step={0.01}
        onChange={(value) => updatePass(index, { pulseSpeed: value })}
      />
      <InputRow
        label="pulse interval"
        value={pass.pulseInterval}
        min={0}
        max={30}
        step={0.1}
        onChange={(value) => updatePass(index, { pulseInterval: value })}
      />
      <InputRow
        label="pulse start"
        value={pass.pulseStart}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updatePass(index, { pulseStart: value })}
      />
      <InputRow
        label="max dist"
        value={pass.pulseMaxDistance}
        min={0}
        max={1}
        step={0.01}
        onChange={(value) => updatePass(index, { pulseMaxDistance: value })}
      />
      <ToggleRow
        label="ping pong"
        checked={pass.pulsePingPong}
        onChange={(checked) => updatePass(index, { pulsePingPong: checked })}
      />
      <label className="sdf-dev-toggle">
        ping mode
        <select
          value={pass.pulsePingPongMode}
          onChange={(event) =>
            updatePass(index, {
              pulsePingPongMode: event.target.value === 'linear' ? 'linear' : 'sine',
            })
          }
        >
          <option value="sine">sine</option>
          <option value="linear">linear</option>
        </select>
      </label>
      <ToggleRow
        label="black interior"
        checked={pass.pulseBlackInterior}
        onChange={(checked) => updatePass(index, { pulseBlackInterior: checked })}
      />
    </div>
  );
}

export function P5Home({ onNavigate }: P5HomeProps) {
  const [config, setConfig] = useState<SdfConfig>(() => cloneConfig(defaultSdfConfig));

  const getContent = useCallback(
    (p: p5, width: number, height: number) =>
      buildTextSceneContent<HomeItemId>({
        p,
        width,
        height,
        background: '#FFFFFF',
        blocks: HOME_BLOCKS,
      }),
    [],
  );

  const effects = useMemo(() => createHomeEffects(config), [config]);
  const navigate = useCallback((id: HomeItemId) => onNavigate(id), [onNavigate]);
  const createSketch = useMemo(
    () => createTextSceneSketch({ effects, onNavigate: navigate }),
    [effects, navigate],
  );

  const updateConfig = useCallback((update: Partial<SdfConfig>) => {
    setConfig((current) => ({ ...current, ...update }));
  }, []);

  const updatePass = useCallback((index: 0 | 1, update: Partial<SdfPassConfig>) => {
    setConfig((current) => {
      const passes = [...current.passes] as [SdfPassConfig, SdfPassConfig];
      passes[index] = { ...passes[index], ...update };

      return { ...current, passes };
    });
  }, []);

  return (
    <P5TextScene getContent={getContent} createSketch={createSketch} />
  );
}
