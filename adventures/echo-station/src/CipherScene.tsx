import * as stylex from '@stylexjs/stylex';
import { CipherRotor3D } from '@are/engine/components/cipher/CipherRotor3D';
import { createCipherState, stepCipherRotor } from '@are/engine/mechanisms/cipher';
import { useState } from 'react';
import { HardwareStage } from './HardwareStage';
import { echoScenario, echoTheme } from './scenario';

const focusRing = { outlineWidth: 3, outlineStyle: 'solid', outlineColor: 'var(--echo-accent)', outlineOffset: 3 } as const;
const styles = stylex.create({
  content: { display: 'grid', gridTemplateColumns: { default: 'minmax(0, 1.35fr) minmax(280px, .65fr)', '@media (max-width: 820px)': 'minmax(0, 1fr)' }, minHeight: 520 },
  panel: {
    display: 'grid', alignContent: 'center', gap: 18, padding: { default: 26, '@media (max-width: 680px)': 16 }, borderLeftWidth: { default: 1, '@media (max-width: 820px)': 0 }, borderLeftStyle: 'solid', borderLeftColor: 'color-mix(in srgb, var(--echo-accent) 14%, transparent)', borderTopWidth: { default: 0, '@media (max-width: 820px)': 1 }, borderTopStyle: 'solid', borderTopColor: 'color-mix(in srgb, var(--echo-accent) 14%, transparent)',
  },
  eyebrow: { margin: 0, color: 'var(--echo-accent)', fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 900, letterSpacing: 1.8, textTransform: 'uppercase' },
  instruction: { margin: 0, color: 'var(--echo-muted)', fontSize: 14, lineHeight: 1.6 },
  rotors: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  rotor: { display: 'grid', gap: 7, placeItems: 'center' },
  control: { minWidth: 48, minHeight: 48, padding: 10, borderWidth: 1, borderStyle: 'solid', borderColor: 'color-mix(in srgb, var(--echo-accent) 30%, transparent)', borderRadius: 10, color: 'var(--echo-text)', backgroundColor: 'var(--echo-surface-raised)', cursor: 'pointer', fontSize: 18, fontWeight: 900, ':hover': { borderColor: 'var(--echo-accent)' }, ':focus-visible': focusRing },
  readout: { minWidth: 48, color: 'var(--echo-accent)', fontFamily: 'ui-monospace, monospace', fontSize: 19, fontWeight: 950, textAlign: 'center' },
  status: { margin: 0, color: 'var(--echo-accent)', fontFamily: 'ui-monospace, monospace', fontSize: 12, lineHeight: 1.5 },
  primary: { width: '100%', minHeight: 48, padding: 12, borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--echo-success)', borderRadius: 10, color: 'var(--echo-bg)', backgroundColor: 'var(--echo-success)', cursor: 'pointer', fontWeight: 900, ':focus-visible': focusRing },
});

export default function CipherScene({ onStatus, onComplete }: { onStatus: (solved: boolean) => void; onComplete: () => void }) {
  const [cipher, setCipher] = useState(() => createCipherState(3));
  const stepRotor = (index: number, direction: number) => {
    const next = stepCipherRotor(cipher, index, direction, echoScenario.cipher);
    setCipher(next);
    onStatus(next.solved);
  };
  return (
    <div {...stylex.props(styles.content)}>
      <HardwareStage label="Decodificador de rotores da Echo Station">
        <CipherRotor3D values={cipher.values} solution={echoScenario.cipher} theme={echoTheme} onStep={stepRotor} />
      </HardwareStage>
      <aside {...stylex.props(styles.panel)}>
        <p {...stylex.props(styles.eyebrow)}>Archive key</p>
        <p {...stylex.props(styles.instruction)}>Ajuste os três cilindros. Cada tecla grande reproduz exatamente o controle do objeto 3D.</p>
        <div {...stylex.props(styles.rotors)}>
          {cipher.values.map((value, index) => (
            <div {...stylex.props(styles.rotor)} key={index}>
              <button {...stylex.props(styles.control)} type="button" aria-label={`Aumentar rotor ${index + 1}`} onClick={() => stepRotor(index, 1)}>+</button>
              <output {...stylex.props(styles.readout)} aria-label={`Rotor ${index + 1}`}>{value}</output>
              <button {...stylex.props(styles.control)} type="button" aria-label={`Diminuir rotor ${index + 1}`} onClick={() => stepRotor(index, -1)}>−</button>
            </div>
          ))}
        </div>
        <p {...stylex.props(styles.status)} aria-live="polite">KEY / {cipher.values.join('')} · {cipher.solved ? 'ACCEPTED' : 'DENIED'}</p>
        {cipher.solved && <button {...stylex.props(styles.primary)} type="button" onClick={onComplete}>Restaurar arquivo</button>}
      </aside>
    </div>
  );
}
