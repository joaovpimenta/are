import { Html, Line, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Group, Mesh } from 'three';
import {
  beginGesture,
  isTapGesture,
  moveGesture,
  moveGestureRespectingPageScroll,
  shouldCaptureAfterMove,
  type GestureState,
  type PointerSample,
} from '../../input/gesture';
import { capturePointer, releasePointer } from '../../input/pointerCapture';
import {
  compassDirectionForHeading,
  headingFromOrientation,
  isCompassDirection,
} from '../../input/deviceCompass';
import type { LockDefinition } from '../../mechanisms/locks';
import type { AreTheme, ThreeTheme } from '../../theme';
import { toObjectThemeStyle, toThreeTheme } from '../../theme';
import { AccentRail, PanelInset, PanelScrew, StatusLamp } from '../hardware/HardwareParts';
import { Keypad3D } from '../keypad/Keypad3D';

export type LockVisualStatus = 'pending' | 'active' | 'solved' | 'error';

type LockObject3DProps = {
  definition: LockDefinition;
  theme: AreTheme;
  status: LockVisualStatus;
  text: string;
  secondaryText: string;
  sequence: readonly string[];
  coordinates: string;
  options: readonly string[];
  columns: number;
  reducedMotion?: boolean;
  onChoose: (value: string) => void;
  onTextChange: (value: string) => void;
  onSecondaryTextChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onVirtualPoint: (horizontal: number, vertical: number) => void;
  onReadDeviceLocation: () => void;
  onSelectTestLocation: () => void;
};

const styles = stylex.create({
  canvasShell: {
    position: 'relative',
    width: '100%',
    height: { default: 540, '@media (max-width: 560px)': 420 },
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 24%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 96%, black)',
    backgroundImage: [
      'radial-gradient(circle at 50% 36%, var(--object-accent-soft), transparent 64%)',
      'linear-gradient(var(--object-accent-soft) 1px, transparent 1px)',
      'linear-gradient(90deg, var(--object-accent-soft) 1px, transparent 1px)',
    ].join(','),
    backgroundSize: 'auto, 32px 32px, 32px 32px',
    boxShadow: 'inset 0 0 60px rgba(0,0,0,.28), 0 18px 46px rgba(0,0,0,.22)',
    touchAction: 'pan-y',
  },
  canvas: { touchAction: 'pan-y' },
  loading: {
    width: '100%', height: '100%', display: 'grid', placeItems: 'center', padding: 24,
    color: 'var(--object-muted)', fontSize: 13, textAlign: 'center',
  },
  plate: {
    minWidth: 122, padding: '7px 11px', borderRadius: 7,
    color: 'var(--object-text)', backgroundColor: 'color-mix(in srgb, var(--object-surface) 92%, black)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'color-mix(in srgb, var(--object-accent) 25%, transparent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 10, fontWeight: 900,
    letterSpacing: 1.2, textAlign: 'center', textTransform: 'uppercase', pointerEvents: 'none', userSelect: 'none',
    boxShadow: '0 0 22px color-mix(in srgb, var(--object-accent) 12%, transparent)',
  },
  plateNarrow: { minWidth: 126 },
  plateMedium: { minWidth: 218 },
  plateWide: { minWidth: 252 },
  buttonLabel: {
    minWidth: 36, display: 'grid', placeItems: 'center', color: 'var(--object-text)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 10, fontWeight: 950,
    lineHeight: 1, textAlign: 'center', pointerEvents: 'none', userSelect: 'none', textShadow: '0 0 10px var(--object-accent)',
  },
  tinyLabel: {
    color: 'var(--object-muted)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 8, fontWeight: 900, letterSpacing: 0.5, pointerEvents: 'none', userSelect: 'none',
  },
  terminal: {
    width: 230, display: 'grid', gap: 7, padding: 10, borderRadius: 8,
    color: 'var(--object-text)', backgroundColor: 'color-mix(in srgb, var(--object-surface) 94%, black)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'color-mix(in srgb, var(--object-accent) 32%, transparent)',
    boxShadow: '0 0 24px color-mix(in srgb, var(--object-accent) 12%, transparent)',
  },
  terminalLabel: { display: 'grid', gap: 3, color: 'var(--object-muted)', fontSize: 9, fontWeight: 850 },
  terminalInput: {
    width: '100%', minHeight: 34, paddingInline: 8, borderRadius: 5, borderWidth: 1, borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)', backgroundColor: 'var(--object-surface-raised)',
    color: 'var(--object-text)', fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 800,
    ':focus-visible': { outlineWidth: 2, outlineStyle: 'solid', outlineColor: 'var(--object-accent)', outlineOffset: 2 },
  },
  readout: {
    width: 220, minHeight: 48, display: 'grid', placeItems: 'center', padding: 8, borderRadius: 6,
    color: 'var(--object-accent)', backgroundColor: 'color-mix(in srgb, var(--object-surface) 94%, black)',
    borderWidth: 1, borderStyle: 'solid', borderColor: 'color-mix(in srgb, var(--object-accent) 25%, transparent)',
    fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 850, textAlign: 'center',
    pointerEvents: 'none', userSelect: 'none', overflowWrap: 'anywhere',
  },
});

const ReducedMotionContext = createContext(false);
let cachedWebGlSupport: boolean | undefined;

type CompassDeviceOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

type DeviceOrientationPermissionConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: (absolute?: boolean) => Promise<'granted' | 'denied'>;
};

type CompassPermissionState = 'checking' | 'prompt' | 'granted' | 'denied' | 'unsupported';

function supportsWebGl() {
  if (cachedWebGlSupport !== undefined) return cachedWebGlSupport;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    cachedWebGlSupport = context !== null;
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cachedWebGlSupport = false;
  }
  return cachedWebGlSupport;
}

function statusColor(status: LockVisualStatus, palette: ThreeTheme) {
  if (status === 'solved') return palette.success;
  if (status === 'error') return palette.danger;
  return palette.accent;
}

function pointerSample(event: ThreeEvent<PointerEvent>): PointerSample {
  return {
    pointerId: event.pointerId,
    pointerType: event.nativeEvent.pointerType,
    clientX: event.nativeEvent.clientX,
    clientY: event.nativeEvent.clientY,
  };
}

function SceneLighting({ accent }: { accent: string }) {
  return (
    <>
      <ambientLight intensity={0.74} />
      <directionalLight position={[4, 7, 8]} intensity={2.25} castShadow />
      <directionalLight position={[-5, 0, 5]} intensity={0.62} />
      <pointLight position={[0, 1.6, 3]} color={accent} intensity={0.42} distance={8} />
      <hemisphereLight color="#c7edff" groundColor="#05070b" intensity={0.34} />
    </>
  );
}

function ResponsiveCamera({ musical }: { musical: boolean }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const compact = size.width / Math.max(1, size.height) < 1.08;
    camera.position.z = compact ? (musical ? 11.8 : 10.4) : (musical ? 8.6 : 7.7);
    camera.updateProjectionMatrix();
  }, [camera, musical, size.height, size.width]);

  return null;
}

function DeviceHousing({ children, palette, status, width = 5.8, height = 4.5 }: {
  children: React.ReactNode;
  palette: ThreeTheme;
  status: LockVisualStatus;
  width?: number;
  height?: number;
}) {
  const root = useRef<Group>(null);
  const signal = statusColor(status, palette);
  const reducedMotion = useContext(ReducedMotionContext);

  useFrame(({ clock }) => {
    if (!root.current) return;
    root.current.rotation.z = status === 'error' && !reducedMotion ? Math.sin(clock.elapsedTime * 48) * 0.015 : 0;
  });

  return (
    <group ref={root} rotation={[-0.055, 0.055, 0]}>
      <RoundedBox args={[width, height, 0.48]} radius={0.22} smoothness={5} position={[0, 0, -0.34]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.housing} metalness={0.82} roughness={0.24} />
      </RoundedBox>
      <RoundedBox args={[width - 0.48, height - 0.5, 0.14]} radius={0.14} smoothness={4} position={[0, 0, -0.05]} receiveShadow>
        <meshStandardMaterial color={palette.face} metalness={0.58} roughness={0.38} />
      </RoundedBox>
      <PanelInset position={[0, 0, -0.13]} size={[width - 0.7, height - 0.72, 0.1]} palette={palette} />
      <AccentRail position={[-width / 2 + 0.58, height / 2 - 0.38, 0.1]} length={Math.max(1.8, width - 1.16)} palette={palette} />
      <PanelScrew position={[-width / 2 + 0.23, height / 2 - 0.23, 0.02]} palette={palette} scale={0.7} />
      <PanelScrew position={[width / 2 - 0.23, height / 2 - 0.23, 0.02]} palette={palette} scale={0.7} />
      <PanelScrew position={[-width / 2 + 0.23, -height / 2 + 0.23, 0.02]} palette={palette} scale={0.7} />
      <PanelScrew position={[width / 2 - 0.23, -height / 2 + 0.23, 0.02]} palette={palette} scale={0.7} />
      <StatusLamp position={[width / 2 - 0.48, height / 2 - 0.48, 0.04]} color={signal} active={status !== 'pending'} scale={0.68} />
      {children}
    </group>
  );
}

function LabelPlate({ children, position, theme, width = 1.4 }: {
  children: React.ReactNode;
  position: [number, number, number];
  theme: AreTheme;
  width?: number;
}) {
  return (
    <Html transform center position={position} distanceFactor={6.6}>
      <div
        {...stylex.props(styles.plate, width < 2 ? styles.plateNarrow : width < 2.75 ? styles.plateMedium : styles.plateWide)}
        style={toObjectThemeStyle(theme)}
      >{children}</div>
    </Html>
  );
}

type PhysicalButtonProps = {
  label: string;
  position: [number, number, number];
  palette: ThreeTheme;
  theme: AreTheme;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  color?: string;
  size?: [number, number, number];
  labelDistance?: number;
};

function PhysicalButton({
  label, position, palette, theme, onPress, active = false, disabled = false,
  color, size = [0.72, 0.54, 0.2], labelDistance = 6.6,
}: PhysicalButtonProps) {
  const mesh = useRef<Mesh>(null);
  const gesture = useRef<GestureState | null>(null);
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useContext(ReducedMotionContext);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const target = pressed ? -0.065 : hovered ? 0.055 : 0;
    mesh.current.position.z = reducedMotion ? target : mesh.current.position.z + (target - mesh.current.position.z) * Math.min(1, delta * 20);
  });

  const materialColor = color ?? (active ? palette.accentSoft : palette.housingRaised);
  return (
    <group position={position}>
      <RoundedBox
        ref={mesh}
        args={size}
        radius={Math.min(size[0], size[1]) * 0.14}
        smoothness={3}
        castShadow
        receiveShadow
        onPointerEnter={(event) => { event.stopPropagation(); if (!disabled) setHovered(true); }}
        onPointerLeave={() => { setHovered(false); setPressed(false); }}
        onPointerDown={(event) => {
          event.stopPropagation();
          if (disabled) return;
          gesture.current = beginGesture('press', pointerSample(event));
          setPressed(true);
        }}
        onPointerMove={(event) => {
          const current = gesture.current;
          if (!current || current.pointerId !== event.pointerId) return;
          const next = moveGesture(current, pointerSample(event));
          gesture.current = next;
          if (next.phase === 'cancelled') setPressed(false);
        }}
        onPointerUp={(event) => {
          const current = gesture.current;
          if (!current || current.pointerId !== event.pointerId) return;
          event.stopPropagation();
          setPressed(false);
          if (!disabled && isTapGesture(current)) onPress();
          gesture.current = null;
        }}
        onPointerCancel={() => { setPressed(false); gesture.current = null; }}
      >
        <meshStandardMaterial
          color={hovered ? palette.metalLight : materialColor}
          emissive={color ?? palette.accent}
          emissiveIntensity={active ? 0.42 : hovered ? 0.18 : 0.025}
          metalness={0.7}
          roughness={0.28}
        />
      </RoundedBox>
      <Html transform center position={[0, 0, size[2] / 2 + 0.035]} distanceFactor={labelDistance}>
        <span {...stylex.props(styles.buttonLabel)} style={toObjectThemeStyle(theme)}>{label}</span>
      </Html>
    </group>
  );
}

function ActionBar({ palette, theme, status, onSubmit, onClear }: Pick<LockObject3DProps, 'theme' | 'status' | 'onSubmit' | 'onClear'> & { palette: ThreeTheme }) {
  const disabled = status === 'solved';
  return (
    <group position={[0, -1.72, 0.12]}>
      <PhysicalButton label="VALIDAR" position={[-0.78, 0, 0]} palette={palette} theme={theme} onPress={onSubmit} active={!disabled} disabled={disabled} size={[1.28, 0.48, 0.2]} />
      <PhysicalButton label="LIMPAR" position={[0.78, 0, 0]} palette={palette} theme={theme} onPress={onClear} disabled={false} size={[1.28, 0.48, 0.2]} />
    </group>
  );
}

function SequenceReadout({ sequence, theme, position = [0, 1.55, 0.12] }: {
  sequence: readonly string[];
  theme: AreTheme;
  position?: [number, number, number];
}) {
  return <LabelPlate position={position} theme={theme} width={2.8}>{sequence.length > 0 ? sequence.join(' · ') : 'AGUARDANDO ENTRADA'}</LabelPlate>;
}

function PatternLock3D(props: LockObject3DProps & { palette: ThreeTheme }) {
  const { palette, theme, sequence, status, onChoose, onSubmit, onClear } = props;
  const gesture = useRef<GestureState | null>(null);
  const points = useMemo(() => Array.from({ length: 9 }, (_, index) => [((index % 3) - 1) * 1.15, (1 - Math.floor(index / 3)) * 0.95, 0.16] as [number, number, number]), []);
  const line = sequence.map((item) => points[Number(item) - 1]).filter(Boolean);

  useEffect(() => {
    const stop = () => { gesture.current = null; };
    window.addEventListener('pointerup', stop);
    return () => window.removeEventListener('pointerup', stop);
  }, []);

  const select = (value: string) => {
    if (!sequence.includes(value)) onChoose(value);
  };

  return (
    <DeviceHousing palette={palette} status={status}>
      <SequenceReadout sequence={sequence} theme={theme} />
      {line.length > 1 ? <Line points={line} color={palette.accent} lineWidth={3} /> : null}
      {points.map((position, index) => {
        const value = String(index + 1);
        const active = sequence.includes(value);
        return (
          <group key={value} position={position}>
            <mesh
              castShadow
              onPointerDown={(event) => {
                if (status === 'solved') return;
                event.stopPropagation();
                gesture.current = beginGesture('drag', pointerSample(event));
              }}
              onPointerEnter={(event) => {
                const current = gesture.current;
                if (!current || current.pointerId !== event.pointerId || status === 'solved') return;
                event.stopPropagation();
                const next = moveGestureRespectingPageScroll(current, pointerSample(event));
                gesture.current = next;
                if (next.phase === 'active') select(value);
              }}
              onPointerMove={(event) => {
                const current = gesture.current;
                if (!current || current.pointerId !== event.pointerId || status === 'solved') return;
                const next = moveGestureRespectingPageScroll(current, pointerSample(event));
                gesture.current = next;
                if (next.phase === 'cancelled') return;
                if (shouldCaptureAfterMove(current, next)) capturePointer(event.nativeEvent.target, event.pointerId);
                if (next.phase === 'active') {
                  event.stopPropagation();
                  select(value);
                }
              }}
              onPointerUp={(event) => {
                const current = gesture.current;
                if (!current || current.pointerId !== event.pointerId) return;
                event.stopPropagation();
                if (current.phase !== 'cancelled' && (current.phase === 'active' || isTapGesture(current))) select(value);
                releasePointer(event.nativeEvent.target, event.pointerId);
                gesture.current = null;
              }}
              onPointerCancel={(event) => {
                releasePointer(event.nativeEvent.target, event.pointerId);
                gesture.current = null;
              }}
            >
              <sphereGeometry args={[0.23, 28, 28]} />
              <meshStandardMaterial color={active ? palette.accent : palette.metalDark} emissive={palette.accent} emissiveIntensity={active ? 1.2 : 0.06} metalness={0.76} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0, -0.06]}>
              <cylinderGeometry args={[0.34, 0.34, 0.1, 28]} />
              <meshStandardMaterial color={palette.housingRaised} metalness={0.88} roughness={0.25} />
            </mesh>
          </group>
        );
      })}
      <ActionBar palette={palette} theme={theme} status={status} onSubmit={onSubmit} onClear={onClear} />
    </DeviceHousing>
  );
}

function DirectionLock3D(props: LockObject3DProps & { palette: ThreeTheme }) {
  const { palette, theme, sequence, status, onChoose, onSubmit, onClear } = props;
  const positions: Record<string, [number, number, number]> = {
    '↑': [0, 0.72, 0.14], '→': [0.82, 0, 0.14], '↓': [0, -0.72, 0.14], '←': [-0.82, 0, 0.14],
  };

  return (
    <DeviceHousing palette={palette} status={status}>
      <SequenceReadout sequence={sequence} theme={theme} />
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.34, 1.34, 0.16, 48]} />
        <meshStandardMaterial color={palette.metalDark} metalness={0.85} roughness={0.24} />
      </mesh>
      {props.options.map((option) => (
        <PhysicalButton key={option} label={option} position={positions[option] ?? [0, 0, 0.14]} palette={palette} theme={theme} onPress={() => onChoose(option)} disabled={status === 'solved'} size={[0.68, 0.58, 0.22]} />
      ))}
      <ActionBar palette={palette} theme={theme} status={status} onSubmit={onSubmit} onClear={onClear} />
    </DeviceHousing>
  );
}

function CompassLock3D(props: LockObject3DProps & { palette: ThreeTheme }) {
  const { palette, theme, sequence, status, onSubmit, onClear } = props;
  const [permission, setPermission] = useState<CompassPermissionState>('checking');
  const [heading, setHeading] = useState<number | null>(null);
  const solution = useMemo(
    () => Array.isArray(props.definition.solution)
      ? props.definition.solution.filter((value): value is string => typeof value === 'string' && isCompassDirection(value))
      : [],
    [props.definition.solution],
  );
  const nextTarget = solution[sequence.length] ?? null;
  const currentDirection = heading === null ? null : compassDirectionForHeading(heading);
  const needleRotation = heading === null ? 0 : heading * Math.PI / 180;
  const directionPositions: Record<string, [number, number, number]> = {
    N: [0, 1.08, 0.19], NE: [0.78, 0.78, 0.19], E: [1.1, 0, 0.19], SE: [0.78, -0.78, 0.19],
    S: [0, -1.08, 0.19], SO: [-0.78, -0.78, 0.19], O: [-1.1, 0, 0.19], NO: [-0.78, 0.78, 0.19],
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const constructor = (window as typeof window & { DeviceOrientationEvent?: DeviceOrientationPermissionConstructor }).DeviceOrientationEvent;
    if (!constructor) {
      setPermission('unsupported');
      return;
    }
    setPermission(typeof constructor.requestPermission === 'function' ? 'prompt' : 'granted');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOrientation = (rawEvent: Event) => {
      const event = rawEvent as CompassDeviceOrientationEvent;
      const screenAngle = window.screen.orientation?.angle ?? 0;
      const nextHeading = headingFromOrientation({
        alpha: event.alpha,
        absolute: event.absolute,
        eventType: rawEvent.type,
        webkitCompassHeading: event.webkitCompassHeading,
        webkitCompassAccuracy: event.webkitCompassAccuracy,
      }, screenAngle);
      if (nextHeading !== null) setHeading(nextHeading);
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (status === 'solved' || solution.length === 0 || sequence.length !== solution.length) return;
    if (!sequence.every((value, index) => value === solution[index])) return;
    const timer = window.setTimeout(onSubmit, 250);
    return () => window.clearTimeout(timer);
  }, [onSubmit, sequence, solution, status]);

  const requestCompass = async () => {
    if (typeof window === 'undefined') return;
    const constructor = (window as typeof window & { DeviceOrientationEvent?: DeviceOrientationPermissionConstructor }).DeviceOrientationEvent;
    if (!constructor) {
      setPermission('unsupported');
      return;
    }
    if (typeof constructor.requestPermission !== 'function') {
      setPermission('granted');
      return;
    }
    try {
      const result = await constructor.requestPermission(true);
      setPermission(result === 'granted' ? 'granted' : 'denied');
    } catch {
      setPermission('denied');
    }
  };

  const readout = permission === 'prompt'
    ? 'PERMISSÃO NECESSÁRIA · MAGNETÔMETRO'
    : permission === 'denied'
      ? 'PERMISSÃO NEGADA · USE O CONTROLE ALTERNATIVO'
      : permission === 'unsupported'
        ? 'BÚSSOLA INDISPONÍVEL · USE O CONTROLE ALTERNATIVO'
        : heading === null
          ? 'AGUARDANDO NORTE MAGNÉTICO…'
          : `${Math.round(heading).toString().padStart(3, '0')}° · ${currentDirection} · ALVO ${nextTarget ?? 'CONCLUÍDO'}`;

  return (
    <DeviceHousing palette={palette} status={status}>
      <SequenceReadout sequence={sequence} theme={theme} />
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.18, 64]} />
        <meshStandardMaterial color={palette.metalDark} metalness={0.86} roughness={0.23} />
      </mesh>
      <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.27, 0.035, 16, 64]} />
        <meshStandardMaterial color={palette.metalLight} metalness={0.92} roughness={0.18} />
      </mesh>
      {Object.entries(directionPositions).map(([direction, position]) => (
        <Html key={direction} transform center position={position} distanceFactor={6.7}>
          <span
            {...stylex.props(styles.buttonLabel)}
            style={{ ...toObjectThemeStyle(theme), color: direction === nextTarget ? theme.accent : theme.text }}
          >{direction}</span>
        </Html>
      ))}
      <group position={[0, 0, 0.3]} rotation={[0, 0, needleRotation]}>
        <mesh position={[0, 0.43, 0]}>
          <coneGeometry args={[0.15, 0.82, 3]} />
          <meshStandardMaterial color={palette.danger} emissive={palette.danger} emissiveIntensity={0.42} metalness={0.48} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.39, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.12, 0.7, 3]} />
          <meshStandardMaterial color={palette.metalLight} metalness={0.88} roughness={0.22} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.36]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.22} metalness={0.9} roughness={0.18} />
      </mesh>
      <LabelPlate position={[0, -1.38, 0.18]} theme={theme} width={2.8}>{readout}</LabelPlate>
      {permission === 'prompt' ? (
        <PhysicalButton label="ATIVAR BÚSSOLA" position={[0, -1.78, 0.12]} palette={palette} theme={theme} onPress={() => void requestCompass()} disabled={status === 'solved'} active size={[1.8, 0.48, 0.2]} />
      ) : (
        <PhysicalButton label="LIMPAR" position={[0, -1.78, 0.12]} palette={palette} theme={theme} onPress={onClear} disabled={false} size={[1.28, 0.48, 0.2]} />
      )}
    </DeviceHousing>
  );
}

const COLOR_VALUES: Record<string, string> = {
  Vermelho: '#c63c4a', Azul: '#285ea8', Verde: '#267454', Amarelo: '#d2a51d', Roxo: '#7447a5',
  Laranja: '#c05d22', Rosa: '#c05c91', Ciano: '#18a7b9', Branco: '#e6edf4', Preto: '#111318',
};

function ColorLock3D(props: LockObject3DProps & { palette: ThreeTheme }) {
  const { palette, theme, sequence, status, options, onChoose, onSubmit, onClear } = props;
  return (
    <DeviceHousing palette={palette} status={status}>
      <SequenceReadout sequence={sequence} theme={theme} />
      {options.map((option, index) => {
        const column = index % 5;
        const row = Math.floor(index / 5);
        return (
          <PhysicalButton
            key={option} label={String(index + 1)} position={[(column - 2) * 0.86, 0.47 - row * 0.92, 0.14]}
            palette={palette} theme={theme} color={COLOR_VALUES[option]} onPress={() => onChoose(option)}
            disabled={status === 'solved'} size={[0.66, 0.66, 0.22]}
          />
        );
      })}
      <ActionBar palette={palette} theme={theme} status={status} onSubmit={onSubmit} onClear={onClear} />
    </DeviceHousing>
  );
}

function PianoLock3D(props: LockObject3DProps & { palette: ThreeTheme }) {
  const { palette, theme, sequence, status, options, onChoose, onSubmit, onClear } = props;
  return (
    <DeviceHousing palette={palette} status={status} width={6.4}>
      <SequenceReadout sequence={sequence} theme={theme} />
      <RoundedBox args={[5.55, 1.62, 0.2]} radius={0.1} smoothness={4} position={[0, -0.02, 0.02]}>
        <meshStandardMaterial color={palette.metalDark} metalness={0.72} roughness={0.3} />
      </RoundedBox>
      {options.map((option, index) => (
        <PhysicalButton
          key={option} label={option.replace('4', '')} position={[(index - 3) * 0.73, -0.02, 0.18]}
          palette={palette} theme={theme} color="#dbe3e9" onPress={() => onChoose(option)}
          disabled={status === 'solved'} size={[0.64, 1.34, 0.2]} labelDistance={6.2}
        />
      ))}
      <ActionBar palette={palette} theme={theme} status={status} onSubmit={onSubmit} onClear={onClear} />
    </DeviceHousing>
  );
}

function TerminalLock3D(props: LockObject3DProps & { palette: ThreeTheme; login?: boolean }) {
  const { palette, theme, status, text, secondaryText, onTextChange, onSecondaryTextChange, onSubmit, onClear, login = false } = props;
  return (
    <DeviceHousing palette={palette} status={status} width={5.9} height={4.6}>
      <LabelPlate position={[0, 1.55, 0.12]} theme={theme} width={2.6}>{login ? 'TERMINAL DE CREDENCIAIS' : 'DECODIFICADOR LEXICAL'}</LabelPlate>
      <RoundedBox args={[4.25, login ? 2.15 : 1.55, 0.16]} radius={0.08} smoothness={4} position={[0, 0.12, 0.02]}>
        <meshStandardMaterial color={palette.metalDark} metalness={0.74} roughness={0.3} />
      </RoundedBox>
      <Html transform center position={[0, login ? 0.13 : 0.18, 0.16]} distanceFactor={6.15}>
        <div {...stylex.props(styles.terminal)} style={toObjectThemeStyle(theme)} onPointerDown={(event) => event.stopPropagation()}>
          <label {...stylex.props(styles.terminalLabel)}>
            {login ? 'IDENTIFICADOR' : 'PALAVRA-CHAVE'}
            <input
              {...stylex.props(styles.terminalInput)} value={text} autoCapitalize="none" autoCorrect="off"
              autoComplete={login ? 'username' : 'off'} aria-label={login ? 'Identificador 3D' : 'Senha 3D'}
              onChange={(event) => onTextChange(event.currentTarget.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && !login) onSubmit(); }}
            />
          </label>
          {login ? (
            <label {...stylex.props(styles.terminalLabel)}>
              SENHA
              <input
                {...stylex.props(styles.terminalInput)} type="password" value={secondaryText} autoComplete="current-password"
                aria-label="Senha do login 3D" onChange={(event) => onSecondaryTextChange(event.currentTarget.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') onSubmit(); }}
              />
            </label>
          ) : null}
        </div>
      </Html>
      <ActionBar palette={palette} theme={theme} status={status} onSubmit={onSubmit} onClear={onClear} />
    </DeviceHousing>
  );
}

function Switch3D({ active, order, position, palette, theme, label, disabled, onToggle }: {
  active: boolean;
  order?: number;
  position: [number, number, number];
  palette: ThreeTheme;
  theme: AreTheme;
  label: string;
  disabled: boolean;
  onToggle: () => void;
}) {
  const lever = useRef<Group>(null);
  const gesture = useRef<GestureState | null>(null);
  const reducedMotion = useContext(ReducedMotionContext);
  useFrame((_, delta) => {
    if (!lever.current) return;
    const target = active ? -0.58 : 0.58;
    lever.current.rotation.x = reducedMotion ? target : lever.current.rotation.x + (target - lever.current.rotation.x) * Math.min(1, delta * 16);
  });
  return (
    <group position={position}>
      <RoundedBox args={[0.65, 0.65, 0.14]} radius={0.06} smoothness={3}>
        <meshStandardMaterial color={palette.metalDark} metalness={0.8} roughness={0.26} />
      </RoundedBox>
      <group
        ref={lever}
        rotation={[0.58, 0, 0]}
        onPointerDown={(event) => {
          event.stopPropagation();
          if (!disabled) gesture.current = beginGesture('press', pointerSample(event));
        }}
        onPointerMove={(event) => {
          const current = gesture.current;
          if (!current || current.pointerId !== event.pointerId) return;
          gesture.current = moveGesture(current, pointerSample(event));
        }}
        onPointerUp={(event) => {
          const current = gesture.current;
          if (!current || current.pointerId !== event.pointerId) return;
          event.stopPropagation();
          if (!disabled && isTapGesture(current)) onToggle();
          gesture.current = null;
        }}
        onPointerCancel={() => { gesture.current = null; }}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.14, 0.14, 20]} />
          <meshStandardMaterial color={palette.metal} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.25, 0.18]}>
          <cylinderGeometry args={[0.055, 0.055, 0.52, 18]} />
          <meshStandardMaterial color={active ? palette.accent : palette.metalLight} emissive={palette.accent} emissiveIntensity={active ? 0.35 : 0.02} metalness={0.88} roughness={0.2} />
        </mesh>
      </group>
      <Html transform center position={[0, -0.43, 0.12]} distanceFactor={7.2}>
        <span {...stylex.props(styles.tinyLabel)} style={toObjectThemeStyle(theme)}>{order ? `${label}·${order}` : label}</span>
      </Html>
    </group>
  );
}

function SwitchBoard3D(props: LockObject3DProps & { palette: ThreeTheme; ordered?: boolean }) {
  const { palette, theme, sequence, status, options, columns, onChoose, onSubmit, onClear, ordered = false } = props;
  return (
    <DeviceHousing palette={palette} status={status} width={6.1}>
      <SequenceReadout sequence={sequence} theme={theme} />
      {options.map((option, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = (column - (columns - 1) / 2) * 0.94;
        const y = 0.72 - row * 0.72;
        const order = sequence.indexOf(option);
        return <Switch3D key={option} label={option} position={[x, y, 0.1]} palette={palette} theme={theme} active={order >= 0} order={ordered && order >= 0 ? order + 1 : undefined} disabled={status === 'solved'} onToggle={() => onChoose(option)} />;
      })}
      <ActionBar palette={palette} theme={theme} status={status} onSubmit={onSubmit} onClear={onClear} />
    </DeviceHousing>
  );
}

function GridLock3D(props: LockObject3DProps & { palette: ThreeTheme }) {
  const { palette, theme, sequence, status, options, columns, onChoose, onSubmit, onClear } = props;
  const spacing = columns === 5 ? 0.63 : 0.78;
  const size: [number, number, number] = columns === 5 ? [0.52, 0.46, 0.16] : [0.65, 0.58, 0.18];
  return (
    <DeviceHousing palette={palette} status={status} width={5.7}>
      <SequenceReadout sequence={sequence} theme={theme} />
      {options.map((option, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        return (
          <PhysicalButton
            key={option} label={option} position={[(column - (columns - 1) / 2) * spacing, 0.83 - row * spacing, 0.12]}
            palette={palette} theme={theme} onPress={() => onChoose(option)} active={sequence.includes(option)}
            disabled={status === 'solved'} size={size} labelDistance={7.2}
          />
        );
      })}
      <ActionBar palette={palette} theme={theme} status={status} onSubmit={onSubmit} onClear={onClear} />
    </DeviceHousing>
  );
}

function VirtualMap3D(props: LockObject3DProps & { palette: ThreeTheme }) {
  const { palette, theme, status, coordinates, onVirtualPoint, onSelectTestLocation, onSubmit, onClear } = props;
  const markerPosition = useMemo(() => {
    const target = props.definition.location;
    const [latitude, longitude] = coordinates.split(',').map(Number);
    if (!target || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    const horizontal = Math.max(0, Math.min(1, (longitude - target.longitude) / 0.04 + 0.5));
    const vertical = Math.max(0, Math.min(1, 0.5 - (latitude - target.latitude) / 0.04));
    return [(horizontal - 0.5) * 4.65, (0.5 - vertical) * 2.35, 0.14] as [number, number, number];
  }, [coordinates, props.definition.location]);
  return (
    <DeviceHousing palette={palette} status={status} width={6.2}>
      <LabelPlate position={[0, 1.55, 0.12]} theme={theme} width={2.8}>CARTOGRAFIA VIRTUAL · ±{props.definition.location?.toleranceMeters ?? 50} M</LabelPlate>
      <group position={[0, 0.08, 0.08]}>
        <mesh
          onPointerDown={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            if (status !== 'solved' && event.uv) onVirtualPoint(event.uv.x, 1 - event.uv.y);
          }}
        >
          <planeGeometry args={[4.65, 2.35, 8, 6]} />
          <meshStandardMaterial color={palette.accentSoft} emissive={palette.accent} emissiveIntensity={0.12} metalness={0.36} roughness={0.62} />
        </mesh>
        {Array.from({ length: 7 }, (_, index) => <mesh key={`v-${index}`} position={[-2.05 + index * 0.68, 0, 0.014]}><boxGeometry args={[0.018, 2.25, 0.015]} /><meshBasicMaterial color={palette.accent} transparent opacity={0.24} /></mesh>)}
        {Array.from({ length: 4 }, (_, index) => <mesh key={`h-${index}`} position={[0, -0.82 + index * 0.55, 0.014]}><boxGeometry args={[4.55, 0.018, 0.015]} /><meshBasicMaterial color={palette.accent} transparent opacity={0.24} /></mesh>)}
        {markerPosition ? (
          <group position={markerPosition}>
            <mesh><sphereGeometry args={[0.13, 24, 24]} /><meshStandardMaterial color={palette.danger} emissive={palette.danger} emissiveIntensity={1.1} /></mesh>
            <pointLight color={palette.danger} intensity={0.6} distance={1.2} />
          </group>
        ) : null}
      </group>
      <Html transform center position={[0, -1.26, 0.14]} distanceFactor={6.5}>
        <div {...stylex.props(styles.readout)} style={toObjectThemeStyle(theme)}>{coordinates || 'TOQUE NO MAPA PARA FIXAR O ALVO'}</div>
      </Html>
      <ActionBar palette={palette} theme={theme} status={status} onSubmit={onSubmit} onClear={onClear} />
      {props.definition.allowLocationSimulation ? <PhysicalButton label="ALVO TESTE" position={[2.05, -1.72, 0.12]} palette={palette} theme={theme} onPress={onSelectTestLocation} disabled={status === 'solved'} size={[1.2, 0.48, 0.2]} /> : null}
    </DeviceHousing>
  );
}

function GpsLock3D(props: LockObject3DProps & { palette: ThreeTheme }) {
  const { palette, theme, status, coordinates, onReadDeviceLocation, onSelectTestLocation, onSubmit, onClear } = props;
  return (
    <DeviceHousing palette={palette} status={status} width={5.8}>
      <LabelPlate position={[0, 1.55, 0.12]} theme={theme} width={2.5}>RECEPTOR GNSS · CAMPO</LabelPlate>
      <RoundedBox args={[3.55, 1.75, 0.22]} radius={0.12} smoothness={4} position={[0, 0.25, 0.05]}>
        <meshStandardMaterial color={palette.metalDark} metalness={0.78} roughness={0.27} />
      </RoundedBox>
      <mesh position={[1.55, 1.12, 0.12]} rotation={[0, 0, -0.24]}>
        <cylinderGeometry args={[0.06, 0.08, 1.12, 20]} />
        <meshStandardMaterial color={palette.metalLight} metalness={0.92} roughness={0.18} />
      </mesh>
      <mesh position={[1.69, 1.66, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.025, 12, 28]} />
        <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.62} />
      </mesh>
      <Html transform center position={[0, 0.32, 0.2]} distanceFactor={6.45}>
        <div {...stylex.props(styles.readout)} style={toObjectThemeStyle(theme)}>{coordinates || 'GPS OCIOSO · AGUARDANDO SINAL'}</div>
      </Html>
      <PhysicalButton label="OBTER GPS" position={[-0.9, -0.82, 0.13]} palette={palette} theme={theme} onPress={onReadDeviceLocation} disabled={status === 'solved'} active size={[1.42, 0.56, 0.22]} />
      {props.definition.allowLocationSimulation ? <PhysicalButton label="SIMULAR" position={[0.9, -0.82, 0.13]} palette={palette} theme={theme} onPress={onSelectTestLocation} disabled={status === 'solved'} size={[1.42, 0.56, 0.22]} /> : null}
      <ActionBar palette={palette} theme={theme} status={status} onSubmit={onSubmit} onClear={onClear} />
    </DeviceHousing>
  );
}

function LockSceneContent(props: LockObject3DProps) {
  const palette = toThreeTheme(props.theme);
  const common = { ...props, palette };

  if (props.definition.kind === 'numeric') {
    return (
      <Keypad3D
        value={props.text}
        status={props.status === 'pending' ? 'idle' : props.status === 'active' ? 'typing' : props.status}
        theme={props.theme}
        reducedMotion={props.reducedMotion}
        onDigit={props.onChoose}
        onClear={props.onClear}
        onSubmit={props.onSubmit}
      />
    );
  }
  if (props.definition.kind === 'pattern') return <PatternLock3D {...common} />;
  if (props.definition.kind === 'direction') return <DirectionLock3D {...common} />;
  if (props.definition.kind === 'compass') return <CompassLock3D {...common} />;
  if (props.definition.kind === 'colors') return <ColorLock3D {...common} />;
  if (props.definition.kind === 'musical') return <PianoLock3D {...common} />;
  if (props.definition.kind === 'password') return <TerminalLock3D {...common} />;
  if (props.definition.kind === 'login') return <TerminalLock3D {...common} login />;
  if (props.definition.kind === 'switches') return <SwitchBoard3D {...common} />;
  if (props.definition.kind === 'ordered-switches') return <SwitchBoard3D {...common} ordered />;
  if (props.definition.kind === 'grid-4x4' || props.definition.kind === 'grid-5x5') return <GridLock3D {...common} />;
  if (props.definition.kind === 'virtual-geolocation') return <VirtualMap3D {...common} />;
  return <GpsLock3D {...common} />;
}

function LockScene(props: LockObject3DProps) {
  return (
    <ReducedMotionContext.Provider value={props.reducedMotion ?? false}>
      <LockSceneContent {...props} />
    </ReducedMotionContext.Provider>
  );
}

export function LockObject3D(props: LockObject3DProps) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [webGlAvailable, setWebGlAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const element = host.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), { rootMargin: '480px 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visible && webGlAvailable === null) setWebGlAvailable(supportsWebGl());
  }, [visible, webGlAvailable]);

  return (
    <div ref={host} {...stylex.props(styles.canvasShell)} style={toObjectThemeStyle(props.theme)} data-three-lock={props.definition.kind}>
      {visible && webGlAvailable ? (
        <Canvas
          {...stylex.props(styles.canvas)}
          aria-label={`${props.definition.kind}: objeto Three.js interativo`}
          fallback={<div {...stylex.props(styles.loading)}>WebGL indisponível. Use os controles alternativos acessíveis abaixo.</div>}
          shadows
          frameloop="always"
          camera={{ position: [0, 0.12, props.definition.kind === 'musical' ? 8.6 : 7.7], fov: 38 }}
          dpr={[1, 1.45]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <ResponsiveCamera musical={props.definition.kind === 'musical'} />
          <SceneLighting accent={props.theme.accent} />
          <LockScene {...props} />
        </Canvas>
      ) : (
        <div {...stylex.props(styles.loading)}>
          {webGlAvailable === false
            ? 'WebGL indisponível. Use os controles alternativos acessíveis abaixo.'
            : 'Objeto Three.js disponível ao aproximar esta seção da viewport.'}
        </div>
      )}
    </div>
  );
}
