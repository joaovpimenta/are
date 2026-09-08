import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { useRef, useState } from 'react';
import type { Mesh } from 'three';
import type { AreTheme } from '../../theme';

const styles = stylex.create({
  keyLabel: {
    width: 34,
    height: 34,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 9,
    color: '#f7fbff',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontWeight: 800,
    fontSize: 14,
    lineHeight: 1,
    userSelect: 'none',
    pointerEvents: 'none',
    textShadow: '0 0 12px rgba(120, 230, 255, .7)',
  },
  display: {
    minWidth: 118,
    padding: '7px 12px',
    borderRadius: 7,
    textAlign: 'center',
    color: '#dff9ff',
    backgroundColor: 'rgba(4, 11, 18, .88)',
    border: '1px solid rgba(120, 225, 255, .2)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 4,
    boxShadow: '0 0 24px rgba(60, 200, 255, .12)',
    userSelect: 'none',
    pointerEvents: 'none',
  },
});

type KeyButtonProps = {
  label: string;
  position: [number, number, number];
  theme: AreTheme;
  disabled?: boolean;
  onPress: (label: string) => void;
};

function KeyButton({ label, position, theme, disabled, onPress }: KeyButtonProps) {
  const mesh = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const targetZ = pressed ? -0.08 : hovered ? 0.08 : 0;
    mesh.current.position.z += (targetZ - mesh.current.position.z) * Math.min(1, delta * 18);
  });

  return (
    <group position={position}>
      <mesh
        ref={mesh}
        castShadow
        receiveShadow
        onPointerEnter={(event) => {
          event.stopPropagation();
          if (!disabled) setHovered(true);
        }}
        onPointerLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          if (!disabled) setPressed(true);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          if (disabled) return;
          setPressed(false);
          onPress(label);
        }}
      >
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
        <span {...stylex.props(styles.keyLabel)}>{label}</span>
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
};

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', 'OK'],
];

export function Keypad3D({ value, status, theme, onDigit, onClear, onSubmit }: Keypad3DProps) {
  const root = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!root.current) return;
    const shake = status === 'error' ? Math.sin(clock.elapsedTime * 55) * 0.045 : 0;
    root.current.rotation.z = shake;
  });

  const accent = status === 'solved' ? theme.success : status === 'error' ? theme.danger : theme.accent;

  return (
    <group rotation={[-0.08, 0.08, 0]}>
      <mesh ref={root} castShadow receiveShadow position={[0, 0, -0.2]}>
        <boxGeometry args={[3.45, 4.25, 0.38]} />
        <meshStandardMaterial color={theme.surface} metalness={0.72} roughness={0.24} />
      </mesh>

      <mesh position={[0, 1.5, 0.05]}>
        <boxGeometry args={[2.65, 0.58, 0.16]} />
        <meshStandardMaterial color="#050b12" emissive={accent} emissiveIntensity={status === 'idle' ? 0.08 : 0.25} />
      </mesh>
      <Html transform center position={[0, 1.5, 0.15]} distanceFactor={5.6}>
        <div {...stylex.props(styles.display)}>{value.padEnd(4, '·')}</div>
      </Html>

      {keys.flatMap((row, rowIndex) =>
        row.map((label, colIndex) => {
          const x = (colIndex - 1) * 0.9;
          const y = 0.72 - rowIndex * 0.72;
          const handler = label === 'C' ? onClear : label === 'OK' ? onSubmit : () => onDigit(label);
          return (
            <KeyButton
              key={label}
              label={label}
              position={[x, y, 0.07]}
              theme={theme}
              disabled={status === 'solved'}
              onPress={handler}
            />
          );
        }),
      )}

      <pointLight position={[0, 1.5, 1.2]} color={accent} intensity={status === 'idle' ? 0.45 : 1.05} distance={5} />
    </group>
  );
}
