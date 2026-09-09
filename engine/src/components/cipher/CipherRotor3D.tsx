import { Html, RoundedBox } from '@react-three/drei';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import type { AreTheme, ThreeTheme } from '../../theme';
import { toObjectThemeStyle, toThreeTheme } from '../../theme';
import { PanelScrew, StatusLamp } from '../hardware/HardwareParts';

const styles = stylex.create({
  readout: {
    display: 'grid',
    placeItems: 'center',
    width: 48,
    height: 56,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)',
    borderRadius: 8,
    color: 'var(--object-accent)',
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 90%, black)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 24,
    fontWeight: 950,
    pointerEvents: 'none',
    userSelect: 'none',
    textShadow: '0 0 16px var(--object-accent)',
  },
});

type RotorProps = {
  index: number;
  value: number;
  palette: ThreeTheme;
  theme: AreTheme;
  onStep: (index: number, direction: number) => void;
};

function Rotor({ index, value, palette, theme, onStep }: RotorProps) {
  const [hovered, setHovered] = useState<1 | -1 | 0>(0);
  const x = (index - 1) * 1.2;

  return (
    <group position={[x, -0.05, 0.04]}>
      <RoundedBox args={[0.92, 1.95, 0.32]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color={palette.face} metalness={0.72} roughness={0.25} />
      </RoundedBox>
      <mesh
        position={[0, 0.72, 0.23]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(1);
        }}
        onPointerLeave={() => setHovered(0)}
        onPointerDown={(event) => {
          event.stopPropagation();
          onStep(index, 1);
        }}
      >
        <coneGeometry args={[0.2, 0.3, 3]} />
        <meshStandardMaterial color={hovered === 1 ? palette.accent : palette.metal} emissive={palette.accent} emissiveIntensity={hovered === 1 ? 0.35 : 0.02} />
      </mesh>
      <mesh
        position={[0, -0.72, 0.23]}
        rotation={[0, 0, Math.PI]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(-1);
        }}
        onPointerLeave={() => setHovered(0)}
        onPointerDown={(event) => {
          event.stopPropagation();
          onStep(index, -1);
        }}
      >
        <coneGeometry args={[0.2, 0.3, 3]} />
        <meshStandardMaterial color={hovered === -1 ? palette.accent : palette.metal} emissive={palette.accent} emissiveIntensity={hovered === -1 ? 0.35 : 0.02} />
      </mesh>
      <Html transform center position={[0, 0, 0.23]} distanceFactor={6}>
        <span {...stylex.props(styles.readout)} style={toObjectThemeStyle(theme)}>{value}</span>
      </Html>
    </group>
  );
}

type CipherRotor3DProps = {
  values: readonly number[];
  solution?: readonly number[];
  theme: AreTheme;
  onStep: (index: number, direction: number) => void;
};

export function CipherRotor3D({ values, solution, theme, onStep }: CipherRotor3DProps) {
  const palette = toThreeTheme(theme);
  const solved = solution
    ? values.length === solution.length && values.every((value, index) => value === solution[index])
    : false;

  return (
    <group>
      <RoundedBox args={[4.75, 3.35, 0.5]} radius={0.22} smoothness={5} position={[0, 0, -0.34]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.housing} metalness={0.84} roughness={0.24} />
      </RoundedBox>
      <RoundedBox args={[3.85, 2.45, 0.16]} radius={0.12} smoothness={4} position={[0, -0.05, -0.03]}>
        <meshStandardMaterial color={palette.metalDark} metalness={0.88} roughness={0.2} />
      </RoundedBox>
      <PanelScrew position={[-2.04, 1.35, -0.02]} palette={palette} scale={0.8} />
      <PanelScrew position={[2.04, 1.35, -0.02]} palette={palette} scale={0.8} />
      <PanelScrew position={[-2.04, -1.35, -0.02]} palette={palette} scale={0.8} />
      <PanelScrew position={[2.04, -1.35, -0.02]} palette={palette} scale={0.8} />
      {values.slice(0, 3).map((value, index) => (
        <Rotor key={index} index={index} value={value} palette={palette} theme={theme} onStep={onStep} />
      ))}
      <StatusLamp position={[1.82, 1.02, 0.02]} color={solved ? palette.success : palette.warning} active={solved} scale={0.78} />
      <pointLight position={[0, 0.5, 1.3]} color={solved ? palette.success : palette.accent} intensity={solved ? 0.78 : 0.25} distance={4} />
    </group>
  );
}

