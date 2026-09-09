import * as stylex from '@stylexjs/stylex';
import { useMachine } from '@xstate/react';
import { Keypad3D } from '@are/engine/components/keypad/Keypad3D';
import { createKeypadMachine } from '@are/engine/components/keypad/keypadMachine';
import { useEffect, useMemo } from 'react';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';
import { HardwareCanvas } from './shared';

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];

export function KeypadRoute({ entry, theme, reducedMotion, resetVersion, session }: LabRouteProps) {
  const machine = useMemo(() => createKeypadMachine('1984'), []);
  const [keypad, send] = useMachine(machine);
  const status = keypad.value as 'idle' | 'typing' | 'error' | 'solved';

  useEffect(() => { send({ type: 'RESET' }); }, [resetVersion, send]);
  useEffect(() => {
    if (status === 'solved') session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'keypad' });
    else if (status === 'error') session.send({ type: 'MECHANISM_ERROR', mechanismId: 'keypad' });
    else if (status === 'typing') session.send({ type: 'MECHANISM_ACTIVE', mechanismId: 'keypad' });
  }, [session, status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (status === 'solved') return;
      if (/^[0-9]$/.test(event.key)) send({ type: 'PRESS', digit: event.key });
      else if (event.key === 'Enter') send({ type: 'SUBMIT' });
      else if (event.key === 'Backspace' || event.key === 'Escape') send({ type: 'CLEAR' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [send, status]);

  const press = (label: string) => {
    if (status === 'solved') return;
    if (label === 'C') send({ type: 'CLEAR' });
    else if (label === 'OK') send({ type: 'SUBMIT' });
    else send({ type: 'PRESS', digit: label });
  };

  return (
    <MechanismPage
      entry={entry}
      status={status}
      visual={<HardwareCanvas ariaLabel="Painel de acesso 3D"><Keypad3D value={keypad.context.value} status={status} theme={theme} reducedMotion={reducedMotion} onDigit={(digit) => send({ type: 'PRESS', digit })} onClear={() => send({ type: 'CLEAR' })} onSubmit={() => send({ type: 'SUBMIT' })} /></HardwareCanvas>}
      controls={<div {...stylex.props(labStyles.keypadControls)}>{keys.map((label) => <button {...stylex.props(labStyles.controlButton)} key={label} type="button" disabled={status === 'solved'} onClick={() => press(label)}>{label}</button>)}</div>}
      telemetry={<span>entrada={keypad.context.value || '----'}</span>}
    />
  );
}
