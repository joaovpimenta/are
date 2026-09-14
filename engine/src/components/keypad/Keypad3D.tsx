import { Html, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { useRef, useState } from 'react';
import type { Mesh } from 'three';
import { beginGesture, isTapGesture, moveGesture, type GestureState, type PointerSample } from '../../input/gesture';
import { interactionDebugEnabled, recordPointerDebug } from '../../input/interactionDebug';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle, toThreeTheme } from '../../theme';
import { AccentRail, PanelInset, PanelScrew, StatusLamp } from '../hardware/HardwareParts';

const styles = stylex.create({
  keyLabel: {
    width: 34,
    height: 34,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 9,
    color: 'var(--object-text)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontWeight: 800,
    fontSize: 14,
    lineHeight: 1,
    userSelect: 'none',
    pointerEvents: 'none',
    textShadow: '0 0 12px var(--object-accent)',
  },
  display: {
    minWidth: 118,
    padding: '7px 12px',
    borderRadius: 7,
    textAlign: 'center',
    color: 'var(--object-text)',
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 90%, black)',
    border: '1px solid color-mix(in srgb, var(--object-accent) 24%, transparent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 4,
    boxShadow: '0 0 24px color-mix(in srgb, var(--object-accent) 14%, transparent)',
    userSelect: 'none',
    pointerEvents: 'none',
  },
});

type KeyButtonProps = {
  label: string;
  position: [number, number, number];
  theme: AreTheme;
  disabled?: boolean;
  reducedMotion?: boolean;
  onPress: (label: string) => void;
};

function pointerSample(event: ThreeEvent<PointerEvent>): PointerSample {
  return {
    pointerId: event.pointerId,
    pointerType: event.nativeEvent.pointerType,
    clientX: event.nativeEvent.clientX,
    clientY: event.nativeEvent.clientY,
  };
}

function KeyButton({ label, position, theme, disabled, reducedMotion = false, onPress }: KeyButtonProps) {
  const mesh = useRef<Mesh>(null);
  const gesture = useRef<GestureState | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const debugHitTargets = interactionDebugEnabled();

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const targetZ = pressed ? -0.08 : hovered ? 0.08 : 0;
    mesh.current.position.z = reducedMotion ? targetZ : mesh.current.position.z + (targetZ - mesh.current.position.z) * Math.min(1, delta * 18);
  });

  const debug = (event: ThreeEvent<PointerEvent>) => {
    const target = event.nativeEvent.target;
    if (!(target instanceof Element)) return;
    recordPointerDebug(pointerSample(event), target.getBoundingClientRect(), event.object.name || `keypad-${label}`);
  };

  return (
    <group position={position}>
      <mesh
        name={`keypad-${label}-hit-target`}
        position={[0, 0, 0.21]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          if (!disabled) setHovered(true);
        }}
        onPointerLeave={() => {
          setHovered(false);
          setPressed(false);
          gesture.current = null;
        }}
        onPointerDown={(event) => {
          if (disabled) return;
          event.stopPropagation();
          gesture.current = beginGesture('press', pointerSample(event));
          setPressed(true);
          debug(event);
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
          debug(event);
          if (!disabled && isTapGesture(current)) onPress(label);
          gesture.current = null;
        }}
        onPointerCancel={() => {
          setPressed(false);
          gesture.current = null;
        }}
      >
        <boxGeometry args={[0.82, 0.64, 0.26]} />
        <meshBasicMaterial color={theme.accent} transparent opacity={debugHitTargets ? 0.16 : 0} depthWrite={false} />
      </mesh>
      <mesh ref={mesh} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.54, 0.22]} />
        <meshStandardMaterial
          color={hovered ? theme.accentSoft : theme.surfaceRaised}
          emissive={theme.accent}
          emissiveIntensity={hovered ? 0.35 : 0.06}
          metalness={0.68}
          roughness={0.28}
        />
      </mesh>
      <Html transform center position={[0, 0, 0.16]} distanceFactor={5.8}>
        <span {...stylex.props(styles.keyLabel)} style={toObjectThemeStyle(theme)}>{label}</span>
      </Html>
    </group>
  );
}

type Keypad3DProps = {
  value: string;
  status: 'idle' | 'typing' | 'error' | 'solved';
  theme: AreTheme;
  onDigit: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  reducedMotion?: boolean;
};

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', 'OK'],
];

export function Keypad3D({ value, status, theme, onDigit, onClear, onSubmit, reducedMotion = false }: Keypad3DProps) {
  const root = useRef<Mesh>(null);
  const palette = toThreeTheme(theme);

  useFrame(({ clock }) => {
    if (!root.current) return;
    const shake = status === 'error' && !reducedMotion ? Math.sin(clock.elapsedTime * 55) * 0.045 : 0;
    root.current.rotation.z = shake;
  });

  const accent = status === 'solved' ? theme.success : status === 'error' ? theme.danger : theme.accent;

  return (
    <group rotation={[-0.08, 0.08, 0]}>
      <RoundedBox ref={root} args={[3.7, 4.55, 0.42]} radius={0.2} smoothness={5} position={[0, 0, -0.24]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.housing} metalness={0.78} roughness={0.24} />
      </RoundedBox>
      <PanelScrew position={[-1.53, 1.95, 0.02]} palette={palette} scale={0.8} />
      <PanelScrew position={[1.53, 1.95, 0.02]} palette={palette} scale={0.8} />
      <PanelScrew position={[-1.53, -1.95, 0.02]} palette={palette} scale={0.8} />
      <PanelScrew position={[1.53, -1.95, 0.02]} palette={palette} scale={0.8} />
      <StatusLamp position={[1.35, 1.5, 0.06]} color={accent} active={status !== 'idle'} scale={0.72} />
      <PanelInset position={[0, -0.25, 0.01]} size={[3.2, 3.1, 0.1]} palette={palette} />
      <PanelInset position={[0, 1.5, 0.02]} size={[2.68, 0.62, 0.12]} palette={palette} accent />
      <AccentRail position={[-1.55, -0.2, 0.12]} length={3.18} palette={palette} vertical />
      <AccentRail position={[1.55, -0.2, 0.12]} length={3.18} palette={palette} vertical />

      <Html transform center position={[0, 1.5, 0.15]} distanceFactor={5.6}>
        <div {...stylex.props(styles.display)} style={toObjectThemeStyle(theme)}>{value.padEnd(4, '·')}</div>
      </Html>

      {keys.flatMap((row, rowIndex) => row.map((label, colIndex) => {
        const x = (colIndex - 1) * 0.9;
        const y = 0.72 - rowIndex * 0.72;
        const handler = label === 'C' ? onClear : label === 'OK' ? onSubmit : () => onDigit(label);
        return <KeyButton key={label} label={label} position={[x, y, 0.07]} theme={theme} disabled={status === 'solved'} reducedMotion={reducedMotion} onPress={handler} />;
      }))}

      <pointLight position={[0, 1.5, 1.2]} color={accent} intensity={status === 'idle' ? 0.45 : 1.05} distance={5} />
    </group>
  );
}
