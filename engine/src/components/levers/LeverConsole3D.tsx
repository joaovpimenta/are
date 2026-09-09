import { Html, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { useRef, useState } from 'react';
import type { Group } from 'three';
import type { AreTheme, ThreeTheme } from '../../theme';
import { toObjectThemeStyle, toThreeTheme } from '../../theme';
import { PanelScrew, StatusLamp } from '../hardware/HardwareParts';

const styles = stylex.create({
  label: {
    minWidth: 52,
    color: 'var(--object-muted)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1.4,
    textAlign: 'center',
    pointerEvents: 'none',
    userSelect: 'none',
  },
});

type LeverProps = {
  index: number;
  label: string;
  value: boolean;
  palette: ThreeTheme;
  theme: AreTheme;
  reducedMotion: boolean;
  onToggle: (index: number) => void;
};

function Lever({ index, label, value, palette, theme, reducedMotion, onToggle }: LeverProps) {
  const lever = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!lever.current) return;
    const target = value ? -0.62 : 0.62;
    lever.current.rotation.x = reducedMotion
      ? target
      : lever.current.rotation.x + (target - lever.current.rotation.x) * Math.min(1, delta * 15);
  });

  return (
    <group position={[(index - 1.5) * 1.08, 0, 0.08]}>
      <RoundedBox args={[0.76, 1.55, 0.18]} radius={0.08} smoothness={3} position={[0, 0, -0.02]}>
        <meshStandardMaterial color={palette.face} metalness={0.68} roughness={0.34} />
      </RoundedBox>
      <group
        ref={lever}
        rotation={[0.62, 0, 0]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(event) => {
          event.stopPropagation();
          onToggle(index);
        }}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 0.2, 28]} />
          <meshStandardMaterial color={palette.metalDark} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.42, 0.28]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.92, 20]} />
          <meshStandardMaterial color={hovered ? palette.metalLight : palette.metal} metalness={0.92} roughness={0.18} />
        </mesh>
        <mesh position={[0, 0.87, 0.55]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color={value ? palette.accent : palette.metalDark} emissive={palette.accent} emissiveIntensity={value ? 0.35 : 0.02} metalness={0.76} roughness={0.24} />
        </mesh>
      </group>
      <Html transform center position={[0, -1.05, 0.12]} distanceFactor={6}>
        <span {...stylex.props(styles.label)} style={toObjectThemeStyle(theme)}>{label}</span>
      </Html>
    </group>
  );
}

type LeverConsole3DProps = {
  values: readonly boolean[];
  labels?: readonly string[];
  solution?: readonly boolean[];
  theme: AreTheme;
  reducedMotion?: boolean;
  onToggle: (index: number) => void;
};

export function LeverConsole3D({
  values,
  labels = ['N', 'E', 'S', 'W'],
  solution,
  theme,
  reducedMotion = false,
  onToggle,
}: LeverConsole3DProps) {
  const palette = toThreeTheme(theme);
  const solved = solution
    ? values.length === solution.length && values.every((value, index) => value === solution[index])
    : false;

  return (
    <group>
      <RoundedBox args={[5.35, 3.2, 0.46]} radius={0.2} smoothness={5} position={[0, 0, -0.34]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.housing} metalness={0.82} roughness={0.26} />
      </RoundedBox>
      <PanelScrew position={[-2.3, 1.3, -0.02]} palette={palette} scale={0.8} />
      <PanelScrew position={[2.3, 1.3, -0.02]} palette={palette} scale={0.8} />
      <PanelScrew position={[-2.3, -1.3, -0.02]} palette={palette} scale={0.8} />
      <PanelScrew position={[2.3, -1.3, -0.02]} palette={palette} scale={0.8} />
      {values.slice(0, 4).map((value, index) => (
        <Lever
          key={index}
          index={index}
          label={labels[index] ?? 'L' + (index + 1)}
          value={value}
          palette={palette}
          theme={theme}
          reducedMotion={reducedMotion}
          onToggle={onToggle}
        />
      ))}
      <StatusLamp position={[2.1, 0.95, 0.02]} color={solved ? palette.success : palette.warning} active={solved} scale={0.78} />
      <pointLight position={[0, 0.6, 1.4]} color={solved ? palette.success : palette.accent} intensity={solved ? 0.75 : 0.22} distance={4} />
    </group>
  );
}

