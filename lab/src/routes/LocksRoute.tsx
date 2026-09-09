import * as stylex from '@stylexjs/stylex';
import { LockPanel } from '@are/engine/components/locks/LockPanel';
import type { LockDefinition } from '@are/engine/mechanisms/locks';
import { useMemo, useState } from 'react';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';

const PRESETS: readonly { label: string; solutionLabel: string; definition: LockDefinition }[] = [
  { label: 'Numérico', solutionLabel: '1234', definition: { id: 'numeric', kind: 'numeric', solution: '1234' } },
  { label: 'Esquema', solutionLabel: '1 → 5 → 9 → 7', definition: { id: 'pattern', kind: 'pattern', solution: ['1','5','9','7'] } },
  { label: 'Direção', solutionLabel: '↑ → ↓ ←', definition: { id: 'direction', kind: 'direction', solution: ['↑','→','↓','←'] } },
  { label: 'Bússola', solutionLabel: 'N → E → S → W', definition: { id: 'compass', kind: 'compass', solution: ['N','E','S','W'] } },
  { label: 'Cores', solutionLabel: 'Vermelho → Azul → Verde → Amarelo', definition: { id: 'colors', kind: 'colors', solution: ['Vermelho','Azul','Verde','Amarelo'] } },
  { label: 'Musical', solutionLabel: 'C → E → G → C', definition: { id: 'musical', kind: 'musical', solution: ['C','E','G','C'] } },
  { label: 'Senha', solutionLabel: 'atlas', definition: { id: 'password', kind: 'password', solution: 'atlas' } },
  { label: 'Login', solutionLabel: 'professor:escape', definition: { id: 'login', kind: 'login', solution: 'professor:escape' } },
  { label: 'Interruptores', solutionLabel: '1, 3 e 5 ligados', definition: { id: 'switches', kind: 'switches', solution: ['1','3','5'] } },
  { label: 'Interruptores ordenados', solutionLabel: '2 → 5 → 1 → 4', definition: { id: 'ordered-switches', kind: 'ordered-switches', solution: ['2','5','1','4'] } },
  { label: 'Grade 4×4', solutionLabel: '1 → 6 → 11 → 16', definition: { id: 'grid-4x4', kind: 'grid-4x4', solution: ['1','6','11','16'] } },
  { label: 'Grade 5×5', solutionLabel: '1 → 7 → 13 → 19 → 25', definition: { id: 'grid-5x5', kind: 'grid-5x5', solution: ['1','7','13','19','25'] } },
  { label: 'Geoloc. virtual', solutionLabel: 'museu central', definition: { id: 'virtual-geolocation', kind: 'virtual-geolocation', solution: 'museu central' } },
  { label: 'Geoloc. real', solutionLabel: '-19.9245,-43.9352', definition: { id: 'real-geolocation', kind: 'real-geolocation', solution: '-19.9245,-43.9352' } },
] as const;

export function LocksRoute({ entry, theme, resetVersion, session, snapshot }: LabRouteProps) {
  const [selected, setSelected] = useState(0);
  const [solved, setSolved] = useState(() => new Set<string>());
  const preset = PRESETS[selected];
  const status = snapshot.mechanismResults.locks ?? 'pending';
  const complete = solved.size === PRESETS.length;
  const solutionText = useMemo(() => `${preset.label}: ${preset.solutionLabel}`, [preset]);

  const solveCurrent = () => {
    setSolved((current) => {
      const next = new Set(current);
      next.add(preset.definition.id);
      if (next.size === PRESETS.length) session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'locks' });
      else session.send({ type: 'MECHANISM_ACTIVE', mechanismId: 'locks' });
      return next;
    });
  };

  return (
    <MechanismPage
      entry={{ ...entry, solution: solutionText }}
      status={complete ? 'solved' : status}
      visual={
        <div {...stylex.props(labStyles.domStage)}>
          <div style={{ display: 'grid', gap: 12, width: 'min(100%, 720px)' }}>
            <select value={selected} onChange={(event) => setSelected(Number(event.currentTarget.value))} aria-label="Tipo de cadeado">
              {PRESETS.map((item, index) => <option key={item.definition.id} value={index}>{item.label}{solved.has(item.definition.id) ? ' ✓' : ''}</option>)}
            </select>
            <LockPanel
              key={`${preset.definition.id}-${resetVersion}`}
              definition={preset.definition}
              theme={theme}
              resetKey={resetVersion}
              onActive={() => session.send({ type: 'MECHANISM_ACTIVE', mechanismId: 'locks' })}
              onSolved={solveCurrent}
              onError={() => session.send({ type: 'MECHANISM_ERROR', mechanismId: 'locks' })}
            />
          </div>
        </div>
      }
      telemetry={<span>preset={preset.definition.id} · resolvidos={solved.size}/{PRESETS.length}</span>}
    />
  );
}
