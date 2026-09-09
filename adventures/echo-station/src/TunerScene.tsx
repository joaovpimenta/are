import * as stylex from '@stylexjs/stylex';
import { Tuner3D } from '@are/engine/components/tuner/Tuner3D';
import { stepDialValue } from '@are/engine/mechanisms/dial';
import { useState } from 'react';
import { HardwareStage } from './HardwareStage';
import { echoScenario, echoTheme } from './scenario';

const focusRing = { outlineWidth: 3, outlineStyle: 'solid', outlineColor: 'var(--echo-accent)', outlineOffset: 3 } as const;
const styles = stylex.create({
  content: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1.35fr) minmax(280px, .65fr)', '@media (max-width: 820px)': 'minmax(0, 1fr)' },
    minHeight: 520,
  },
  panel: {
    display: 'grid',
    alignContent: 'center',
    gap: 18,
    padding: { default: 26, '@media (max-width: 680px)': 16 },
    borderLeftWidth: { default: 1, '@media (max-width: 820px)': 0 },
    borderLeftStyle: 'solid',
    borderLeftColor: 'color-mix(in srgb, var(--echo-accent) 14%, transparent)',
    borderTopWidth: { default: 0, '@media (max-width: 820px)': 1 },
    borderTopStyle: 'solid',
    borderTopColor: 'color-mix(in srgb, var(--echo-accent) 14%, transparent)',
  },
  eyebrow: { margin: 0, color: 'var(--echo-accent)', fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 900, letterSpacing: 1.8, textTransform: 'uppercase' },
  instruction: { margin: 0, color: 'var(--echo-muted)', fontSize: 14, lineHeight: 1.6 },
  controls: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  control: {
    minWidth: 48, minHeight: 48, padding: 10, borderWidth: 1, borderStyle: 'solid', borderColor: 'color-mix(in srgb, var(--echo-accent) 30%, transparent)', borderRadius: 10, color: 'var(--echo-text)', backgroundColor: 'var(--echo-surface-raised)', cursor: 'pointer', fontSize: 18, fontWeight: 900,
    ':hover': { borderColor: 'var(--echo-accent)' }, ':focus-visible': focusRing,
  },
  slider: { flexGrow: 1, minWidth: 130, accentColor: 'var(--echo-accent)' },
  readout: { minWidth: 48, color: 'var(--echo-accent)', fontFamily: 'ui-monospace, monospace', fontSize: 19, fontWeight: 950, textAlign: 'center' },
  status: { margin: 0, color: 'var(--echo-accent)', fontFamily: 'ui-monospace, monospace', fontSize: 12, lineHeight: 1.5 },
  primary: { width: '100%', minHeight: 48, padding: 12, borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--echo-success)', borderRadius: 10, color: 'var(--echo-bg)', backgroundColor: 'var(--echo-success)', cursor: 'pointer', fontWeight: 900, ':focus-visible': focusRing },
});

export default function TunerScene({ reducedMotion, onStatus, onComplete }: { reducedMotion: boolean; onStatus: (solved: boolean) => void; onComplete: () => void }) {
  const [frequency, setFrequency] = useState(41);
  const setSignal = (value: number) => {
    setFrequency(value);
    onStatus(value === echoScenario.targetBand);
  };
  return (
    <div {...stylex.props(styles.content)}>
      <HardwareStage label="Rádio de ondas curtas da Echo Station">
        <Tuner3D value={frequency} target={echoScenario.targetBand} theme={echoTheme} reducedMotion={reducedMotion} onChange={setSignal} />
      </HardwareStage>
      <aside {...stylex.props(styles.panel)}>
        <p {...stylex.props(styles.eyebrow)}>Carrier alignment</p>
        <p {...stylex.props(styles.instruction)}>Arraste o controle metálico ou use os controles equivalentes até a agulha estabilizar na banda informada.</p>
        <div {...stylex.props(styles.controls)}>
          <button {...stylex.props(styles.control)} type="button" aria-label="Diminuir frequência" onClick={() => setSignal(stepDialValue(frequency, -1, { min: 0, max: 99 }))}>−</button>
          <input {...stylex.props(styles.slider)} type="range" min="0" max="99" value={frequency} aria-label="Frequência do rádio" onChange={(event) => setSignal(Number(event.currentTarget.value))} />
          <output {...stylex.props(styles.readout)}>{String(frequency).padStart(2, '0')}</output>
          <button {...stylex.props(styles.control)} type="button" aria-label="Aumentar frequência" onClick={() => setSignal(stepDialValue(frequency, 1, { min: 0, max: 99 }))}>+</button>
        </div>
        <p {...stylex.props(styles.status)} aria-live="polite">{frequency === echoScenario.targetBand ? 'CARRIER / LOCKED' : 'CARRIER / SEARCHING'}</p>
        {frequency === echoScenario.targetBand && <button {...stylex.props(styles.primary)} type="button" onClick={onComplete}>Abrir decodificador</button>}
      </aside>
    </div>
  );
}
