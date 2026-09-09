import * as stylex from '@stylexjs/stylex';
import { CipherRotor3D } from '@are/engine/components/cipher/CipherRotor3D';
import { createCipherState, stepCipherRotor } from '@are/engine/mechanisms/cipher';
import { useEffect, useState } from 'react';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';
import { HardwareCanvas } from './shared';

const solution = [7, 3, 1] as const;

export function CipherRoute({ entry, theme, resetVersion, session }: LabRouteProps) {
  const [cipher, setCipher] = useState(() => createCipherState(3));

  useEffect(() => setCipher(createCipherState(3)), [resetVersion]);

  const step = (index: number, direction: number) => {
    const next = stepCipherRotor(cipher, index, direction, solution);
    setCipher(next);
    session.send({ type: next.solved ? 'MECHANISM_SOLVED' : 'MECHANISM_ACTIVE', mechanismId: 'cipher' });
  };

  return (
    <MechanismPage
      entry={entry}
      status={cipher.solved ? 'solved' : 'active'}
      visual={<HardwareCanvas ariaLabel="Decodificador de cilindros 3D" cameraZ={7.7}><CipherRotor3D values={cipher.values} solution={solution} theme={theme} onStep={step} /></HardwareCanvas>}
      controls={<div {...stylex.props(labStyles.rotorControls)}>{cipher.values.map((value, index) => <div {...stylex.props(labStyles.rotorColumn)} key={index}><button {...stylex.props(labStyles.controlButton)} type="button" aria-label={'Aumentar rotor ' + (index + 1)} onClick={() => step(index, 1)}>+</button><output {...stylex.props(labStyles.controlReadout)} aria-label={'Rotor ' + (index + 1)}>{value}</output><button {...stylex.props(labStyles.controlButton)} type="button" aria-label={'Diminuir rotor ' + (index + 1)} onClick={() => step(index, -1)}>−</button></div>)}</div>}
      telemetry={<span>rotors={cipher.values.join('')} · target=731</span>}
    />
  );
}
