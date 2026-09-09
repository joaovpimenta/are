import * as stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { matchesLockInput, type LockDefinition, type LockValue } from '../../mechanisms/locks';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle } from '../../theme';
import { LockObject3D, type LockVisualStatus } from './LockObject3D';

type LockPanelProps = {
  definition: LockDefinition;
  theme: AreTheme;
  title?: string;
  resetKey?: number;
  reducedMotion?: boolean;
  onSolved?: () => void;
  onActive?: () => void;
  onError?: () => void;
};

type LockStatus = LockVisualStatus;

const focusRing = {
  outlineWidth: 3,
  outlineStyle: 'solid',
  outlineColor: 'color-mix(in srgb, var(--object-accent) 62%, transparent)',
  outlineOffset: 3,
} as const;

const styles = stylex.create({
  shell: {
    width: '100%', display: 'grid', gap: 14,
    padding: { default: 18, '@media (max-width: 560px)': 14 },
    borderRadius: 22, borderWidth: 1, borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 26%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 94%, transparent)',
    boxShadow: '0 18px 50px rgba(0,0,0,.28)',
  },
  header: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  title: { margin: 0, color: 'var(--object-text)', fontSize: 16, fontWeight: 900 },
  status: { color: 'var(--object-muted)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 },
  inputGroup: { display: 'grid', gap: 7 },
  label: { color: 'var(--object-muted)', fontSize: 12, fontWeight: 800 },
  input: {
    width: '100%', minHeight: 48, paddingInline: 13, borderRadius: 12, borderWidth: 1, borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 25%, transparent)',
    backgroundColor: 'var(--object-surface-raised)', color: 'var(--object-text)', fontSize: 16, fontWeight: 800,
    ':focus-visible': focusRing,
  },
  inputCode: { textAlign: 'center', letterSpacing: 8, fontFamily: 'ui-monospace, monospace', fontSize: 22 },
  grid: { display: 'grid', gap: 8 },
  grid3: { gridTemplateColumns: 'repeat(3, minmax(52px, 1fr))' },
  grid4: { gridTemplateColumns: 'repeat(4, minmax(44px, 1fr))' },
  grid5: { gridTemplateColumns: 'repeat(5, minmax(38px, 1fr))' },
  gridAuto: { gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))' },
  patternGrid: { touchAction: 'none', userSelect: 'none' },
  cell: {
    minHeight: 52, borderRadius: 12, borderWidth: 1, borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 22%, transparent)',
    backgroundColor: 'var(--object-surface-raised)', color: 'var(--object-text)', cursor: 'pointer',
    fontWeight: 900, touchAction: 'manipulation',
    ':hover': { borderColor: 'var(--object-accent)' }, ':focus-visible': focusRing,
    ':disabled': { cursor: 'default', opacity: 0.72 },
  },
  point: { width: 58, minHeight: 58, justifySelf: 'center', borderRadius: '50%' },
  active: {
    borderColor: 'var(--object-accent)', color: 'var(--object-accent)', backgroundColor: 'var(--object-accent-soft)',
    boxShadow: '0 0 22px color-mix(in srgb, var(--object-accent) 18%, transparent)',
  },
  colorCell: { minHeight: 66, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.85)' },
  red: { backgroundColor: '#c63c4a' }, blue: { backgroundColor: '#285ea8' },
  green: { backgroundColor: '#267454' }, yellow: { backgroundColor: '#b88614' },
  purple: { backgroundColor: '#7447a5' }, orange: { backgroundColor: '#c05d22' },
  pink: { backgroundColor: '#a84878' }, cyan: { backgroundColor: '#147889' },
  white: { backgroundColor: '#dadfe6', color: '#111821', textShadow: 'none' }, black: { backgroundColor: '#111318' },
  pianoKey: { minHeight: 112, alignContent: 'end', paddingBottom: 13 },
  sequence: {
    minHeight: 42, display: 'flex', alignItems: 'center', gap: 6, padding: 8, borderRadius: 10,
    color: 'var(--object-muted)', backgroundColor: 'color-mix(in srgb, var(--object-surface-raised) 72%, transparent)',
    overflowX: 'auto',
  },
  sequenceItem: {
    display: 'grid', placeItems: 'center', minWidth: 30, minHeight: 30, paddingInline: 7, borderRadius: 8,
    color: 'var(--object-accent)', backgroundColor: 'var(--object-accent-soft)', fontSize: 12, fontWeight: 900,
  },
  map: {
    position: 'relative', minHeight: 230, borderRadius: 18, borderWidth: 1, borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)', color: 'var(--object-muted)',
    backgroundColor: 'var(--object-surface-raised)',
    backgroundImage: 'linear-gradient(color-mix(in srgb, var(--object-accent) 13%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--object-accent) 13%, transparent) 1px, transparent 1px), radial-gradient(circle at center, var(--object-accent-soft), transparent 48%)',
    backgroundSize: '32px 32px, 32px 32px, auto', cursor: 'crosshair', touchAction: 'manipulation',
    ':focus-visible': focusRing,
  },
  crosshair: {
    position: 'absolute', insetBlockStart: '50%', insetInlineStart: '50%', width: 18, height: 18,
    borderRadius: '50%', borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--object-accent)',
    transform: 'translate(-50%, -50%)', boxShadow: '0 0 20px var(--object-accent)', pointerEvents: 'none',
  },
  coordinates: { margin: 0, color: 'var(--object-muted)', fontFamily: 'ui-monospace, monospace', fontSize: 12 },
  controls: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  submit: {
    minHeight: 44, paddingInline: 16, borderRadius: 999, borderWidth: 0,
    backgroundColor: 'var(--object-accent)', color: 'var(--object-surface)', fontWeight: 900, cursor: 'pointer',
    ':focus-visible': focusRing, ':disabled': { cursor: 'default', opacity: 0.55 },
  },
  reset: {
    minHeight: 44, paddingInline: 16, borderRadius: 999, borderWidth: 1, borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)', backgroundColor: 'transparent',
    color: 'var(--object-text)', fontWeight: 800, cursor: 'pointer', ':focus-visible': focusRing,
  },
  feedback: { margin: 0, minHeight: 20, color: 'var(--object-muted)', fontSize: 13 },
  feedbackError: { color: 'var(--object-danger)' }, feedbackSolved: { color: 'var(--object-success)' },
  fallback: {
    borderWidth: 1, borderStyle: 'solid', borderColor: 'color-mix(in srgb, var(--object-accent) 18%, transparent)',
    borderRadius: 14, backgroundColor: 'color-mix(in srgb, var(--object-surface-raised) 58%, transparent)', overflow: 'hidden',
  },
  fallbackSummary: {
    minHeight: 46, display: 'flex', alignItems: 'center', paddingInline: 14, color: 'var(--object-text)',
    cursor: 'pointer', fontSize: 13, fontWeight: 850, touchAction: 'manipulation',
    ':focus-visible': focusRing,
  },
  fallbackBody: { display: 'grid', gap: 12, padding: '4px 12px 12px' },
});

const labels: Record<LockDefinition['kind'], string> = {
  numeric: 'Cadeado numérico', pattern: 'Cadeado de esquema 3×3', direction: 'Cadeado direcional',
  compass: 'Cadeado bússola', colors: 'Cadeado de cores', musical: 'Cadeado musical',
  password: 'Cadeado de senha', login: 'Terminal de login', switches: 'Matriz de interruptores',
  'ordered-switches': 'Interruptores ordenados', 'grid-4x4': 'Grade 4×4', 'grid-5x5': 'Grade 5×5',
  'virtual-geolocation': 'Mapa de geolocalização virtual', 'real-geolocation': 'Verificação de geolocalização real',
};

const defaultOptions: Partial<Record<LockDefinition['kind'], readonly string[]>> = {
  pattern: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], direction: ['↑', '→', '↓', '←'],
  compass: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'],
  colors: ['Vermelho', 'Azul', 'Verde', 'Amarelo', 'Roxo', 'Laranja', 'Rosa', 'Ciano', 'Branco', 'Preto'],
  musical: ['Dó4', 'Ré4', 'Mi4', 'Fá4', 'Sol4', 'Lá4', 'Si4'],
  switches: Array.from({ length: 16 }, (_, index) => String(index + 1)),
  'ordered-switches': Array.from({ length: 16 }, (_, index) => String(index + 1)),
  'grid-4x4': Array.from({ length: 16 }, (_, index) => String(index + 1)),
  'grid-5x5': Array.from({ length: 25 }, (_, index) => String(index + 1)),
};

const noteFrequencies: Record<string, number> = {
  'Dó4': 261.63, 'Ré4': 293.66, 'Mi4': 329.63, 'Fá4': 349.23, 'Sol4': 392, 'Lá4': 440, 'Si4': 493.88,
};

function playNote(note: string) {
  if (typeof window === 'undefined') return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass || !noteFrequencies[note]) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = noteFrequencies[note];
  gain.gain.setValueAtTime(0.12, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.45);
  oscillator.addEventListener('ended', () => void context.close());
}

function colorStyle(option: string) {
  const value = option.toLocaleLowerCase('pt-BR');
  if (value === 'vermelho') return styles.red;
  if (value === 'azul') return styles.blue;
  if (value === 'verde') return styles.green;
  if (value === 'amarelo') return styles.yellow;
  if (value === 'roxo') return styles.purple;
  if (value === 'laranja') return styles.orange;
  if (value === 'rosa') return styles.pink;
  if (value === 'ciano') return styles.cyan;
  if (value === 'branco') return styles.white;
  return styles.black;
}

function gridStyle(columns: number) {
  if (columns === 3) return styles.grid3;
  if (columns === 4) return styles.grid4;
  if (columns === 5) return styles.grid5;
  return styles.gridAuto;
}

export function LockPanel({ definition, theme, title, resetKey = 0, reducedMotion = false, onSolved, onActive, onError }: LockPanelProps) {
  const [text, setText] = useState('');
  const [secondaryText, setSecondaryText] = useState('');
  const [sequence, setSequence] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState('');
  const [tracingPattern, setTracingPattern] = useState(false);
  const [status, setStatus] = useState<LockStatus>('pending');
  const [message, setMessage] = useState('Aguardando entrada.');
  const variables = toObjectThemeStyle(theme);
  const options = useMemo(() => definition.options ?? defaultOptions[definition.kind] ?? [], [definition]);
  const columns = definition.columns ?? (definition.kind === 'pattern' ? 3 : definition.kind === 'grid-5x5' ? 5 : 4);
  const isGeolocation = definition.kind === 'virtual-geolocation' || definition.kind === 'real-geolocation';

  const clear = () => {
    setText(''); setSecondaryText(''); setSequence([]); setCoordinates(''); setTracingPattern(false); setStatus('pending');
    setMessage('Aguardando entrada.');
  };

  useEffect(clear, [resetKey, definition.id]);

  const markActive = () => {
    if (status !== 'solved') setStatus('active');
    setMessage('Entrada registrada. Valide quando terminar.');
    onActive?.();
  };

  const choose = (value: string) => {
    if (status === 'solved') return;
    markActive();
    if (definition.kind === 'numeric') {
      setText((current) => current + value);
      return;
    }
    if (definition.kind === 'switches' || definition.kind === 'grid-4x4' || definition.kind === 'grid-5x5') {
      setSequence((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
      return;
    }
    if (definition.kind === 'pattern' || definition.kind === 'ordered-switches') {
      setSequence((current) => current.includes(value) ? current : [...current, value]);
      return;
    }
    if (definition.kind === 'musical') playNote(value);
    setSequence((current) => [...current, value]);
  };

  const inputValue = (): LockValue => {
    if (definition.kind === 'login') return `${text}:${secondaryText}`;
    if (isGeolocation) return coordinates;
    if (options.length > 0) return sequence;
    return text;
  };

  const submit = () => {
    if (matchesLockInput(definition, inputValue())) {
      setStatus('solved'); setMessage('Cadeado aberto. Solução confirmada.'); onSolved?.();
    } else {
      setStatus('error'); setMessage('A combinação ainda não corresponde à solução.'); onError?.();
    }
  };

  const chooseMapPoint = (event: MouseEvent<HTMLButtonElement>) => {
    if (status === 'solved' || !definition.location) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width;
    const vertical = (event.clientY - bounds.top) / bounds.height;
    const latitude = definition.location.latitude + (0.5 - vertical) * 0.04;
    const longitude = definition.location.longitude + (horizontal - 0.5) * 0.04;
    setCoordinates(`${latitude.toFixed(5)},${longitude.toFixed(5)}`);
    markActive();
  };

  const chooseVirtualPoint = (horizontal: number, vertical: number) => {
    if (status === 'solved' || !definition.location) return;
    const latitude = definition.location.latitude + (0.5 - vertical) * 0.04;
    const longitude = definition.location.longitude + (horizontal - 0.5) * 0.04;
    setCoordinates(`${latitude.toFixed(5)},${longitude.toFixed(5)}`);
    markActive();
  };

  const tracePattern = (event: PointerEvent<HTMLDivElement>, startsTrace: boolean) => {
    if (definition.kind !== 'pattern' || (!startsTrace && !tracingPattern)) return;
    if (startsTrace) {
      setTracingPattern(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const column = Math.max(0, Math.min(columns - 1, Math.floor((event.clientX - bounds.left) / bounds.width * columns)));
    const row = Math.max(0, Math.min(Math.ceil(options.length / columns) - 1, Math.floor((event.clientY - bounds.top) / bounds.height * Math.ceil(options.length / columns))));
    const option = options[row * columns + column];
    if (option) choose(option);
  };

  const selectTestLocation = () => {
    if (!definition.location || status === 'solved') return;
    setCoordinates(`${definition.location.latitude},${definition.location.longitude}`);
    markActive();
  };

  const readDeviceLocation = () => {
    if (!navigator.geolocation || status === 'solved') {
      setStatus('error'); setMessage('Geolocalização indisponível neste dispositivo.'); onError?.(); return;
    }
    markActive();
    setMessage('Consultando o GPS do dispositivo…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates(`${position.coords.latitude},${position.coords.longitude}`);
        setMessage(`Posição recebida com precisão de ${Math.round(position.coords.accuracy)} m.`);
      },
      () => {
        setStatus('error');
        setMessage('Não foi possível obter a localização. Verifique a permissão do navegador.');
        onError?.();
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const sequenceGrid = options.length > 0 ? (
    <>
      <div
        {...stylex.props(styles.grid, gridStyle(columns), definition.kind === 'pattern' ? styles.patternGrid : undefined)}
        onPointerDown={(event) => tracePattern(event, true)}
        onPointerMove={(event) => tracePattern(event, false)}
        onPointerUp={() => setTracingPattern(false)}
        onPointerCancel={() => setTracingPattern(false)}
      >
        {options.map((option) => {
          const selected = sequence.includes(option);
          const toggles = definition.kind === 'switches' || definition.kind === 'grid-4x4'
            || definition.kind === 'grid-5x5' || definition.kind === 'pattern'
            || definition.kind === 'ordered-switches';
          return (
            <button
              {...stylex.props(
                styles.cell,
                definition.kind === 'pattern' ? styles.point : undefined,
                definition.kind === 'colors' ? styles.colorCell : undefined,
                definition.kind === 'colors' ? colorStyle(option) : undefined,
                definition.kind === 'musical' ? styles.pianoKey : undefined,
                selected && toggles ? styles.active : undefined,
              )}
              type="button" key={option} aria-pressed={toggles ? selected : undefined}
              aria-label={definition.kind === 'musical' ? `Tocar ${option}` : option}
              disabled={status === 'solved'} onClick={() => choose(option)}
            >{option}</button>
          );
        })}
      </div>
      <div {...stylex.props(styles.sequence)} aria-label="Entrada atual" aria-live="polite">
        {sequence.length === 0
          ? <span>Nenhuma posição selecionada.</span>
          : sequence.map((item, index) => <span {...stylex.props(styles.sequenceItem)} key={`${item}-${index}`}>{item}</span>)}
      </div>
    </>
  ) : null;

  return (
    <div {...stylex.props(styles.shell)} style={variables} role="group" aria-label={title ?? labels[definition.kind]}>
      <div {...stylex.props(styles.header)}>
        <h3 {...stylex.props(styles.title)}>{title ?? labels[definition.kind]}</h3>
        <span {...stylex.props(styles.status)} aria-live="polite">{status}</span>
      </div>

      <LockObject3D
        definition={definition}
        theme={theme}
        status={status}
        text={text}
        secondaryText={secondaryText}
        sequence={sequence}
        coordinates={coordinates}
        options={options}
        columns={columns}
        reducedMotion={reducedMotion}
        onChoose={choose}
        onTextChange={(value) => { markActive(); setText(value); }}
        onSecondaryTextChange={(value) => { markActive(); setSecondaryText(value); }}
        onSubmit={submit}
        onClear={clear}
        onVirtualPoint={chooseVirtualPoint}
        onReadDeviceLocation={readDeviceLocation}
        onSelectTestLocation={selectTestLocation}
      />

      <details {...stylex.props(styles.fallback)}>
        <summary {...stylex.props(styles.fallbackSummary)}>Controles alternativos acessíveis</summary>
        <div {...stylex.props(styles.fallbackBody)}>

      {definition.kind === 'numeric' ? (
        <>
          <label {...stylex.props(styles.inputGroup)}>
            <span {...stylex.props(styles.label)}>Código numérico</span>
            <input
              {...stylex.props(styles.input, styles.inputCode)} value={text} inputMode="numeric" pattern="[0-9]*"
              autoComplete="off" aria-label="Código numérico"
              onChange={(event) => { markActive(); setText(event.currentTarget.value.replace(/\D/g, '')); }}
              onKeyDown={(event) => { if (event.key === 'Enter') submit(); }}
            />
          </label>
          <div {...stylex.props(styles.grid, styles.grid3)} aria-label="Teclado numérico">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
              <button {...stylex.props(styles.cell)} type="button" key={digit} disabled={status === 'solved'} onClick={() => { markActive(); setText((current) => current + digit); }}>{digit}</button>
            ))}
            <button {...stylex.props(styles.cell)} type="button" disabled={status === 'solved'} onClick={() => { markActive(); setText((current) => current.slice(0, -1)); }}>Apagar</button>
          </div>
        </>
      ) : null}

      {definition.kind === 'password' ? (
        <label {...stylex.props(styles.inputGroup)}>
          <span {...stylex.props(styles.label)}>Senha</span>
          <input {...stylex.props(styles.input)} value={text} autoCapitalize="none" autoCorrect="off" onChange={(event) => { markActive(); setText(event.currentTarget.value); }} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} />
        </label>
      ) : null}

      {definition.kind === 'login' ? (
        <>
          <label {...stylex.props(styles.inputGroup)}>
            <span {...stylex.props(styles.label)}>Identificador</span>
            <input {...stylex.props(styles.input)} value={text} autoCapitalize="none" autoCorrect="off" autoComplete="username" onChange={(event) => { markActive(); setText(event.currentTarget.value); }} />
          </label>
          <label {...stylex.props(styles.inputGroup)}>
            <span {...stylex.props(styles.label)}>Senha</span>
            <input {...stylex.props(styles.input)} type="password" value={secondaryText} autoComplete="current-password" onChange={(event) => { markActive(); setSecondaryText(event.currentTarget.value); }} onKeyDown={(event) => { if (event.key === 'Enter') submit(); }} />
          </label>
        </>
      ) : null}

      {!isGeolocation && definition.kind !== 'numeric' && definition.kind !== 'password' && definition.kind !== 'login' ? sequenceGrid : null}

      {definition.kind === 'virtual-geolocation' ? (
        <>
          <button {...stylex.props(styles.map)} type="button" aria-label="Selecionar ponto no mapa virtual" disabled={status === 'solved'} onClick={chooseMapPoint}>
            <span {...stylex.props(styles.crosshair)} aria-hidden="true" />
            Toque no mapa para registrar as coordenadas
          </button>
          <p {...stylex.props(styles.coordinates)}>{coordinates || 'Nenhuma coordenada selecionada.'}</p>
          {definition.allowLocationSimulation ? <button {...stylex.props(styles.reset)} type="button" disabled={status === 'solved'} onClick={selectTestLocation}>Selecionar alvo de teste</button> : null}
        </>
      ) : null}

      {definition.kind === 'real-geolocation' ? (
        <>
          <div {...stylex.props(styles.controls)}>
            <button {...stylex.props(styles.submit)} type="button" disabled={status === 'solved'} onClick={readDeviceLocation}>Usar localização do dispositivo</button>
            {definition.allowLocationSimulation ? <button {...stylex.props(styles.reset)} type="button" disabled={status === 'solved'} onClick={selectTestLocation}>Simular posição de teste</button> : null}
          </div>
          <p {...stylex.props(styles.coordinates)}>{coordinates || 'GPS ainda não consultado.'}</p>
        </>
      ) : null}

      <div {...stylex.props(styles.controls)}>
        <button {...stylex.props(styles.submit)} type="button" onClick={submit} disabled={status === 'solved'}>Validar</button>
        <button {...stylex.props(styles.reset)} type="button" onClick={clear}>Limpar</button>
      </div>
        </div>
      </details>
      <p {...stylex.props(styles.feedback, status === 'error' ? styles.feedbackError : undefined, status === 'solved' ? styles.feedbackSolved : undefined)} role="status">{message}</p>
    </div>
  );
}
