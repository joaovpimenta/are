import { Html, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { useRef, useState } from 'react';
import type { Group } from 'three';
import { dialValueFromClockPoint, stepDialValue } from '../../mechanisms/dial';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle, toThreeTheme } from '../../theme';
import { PanelScrew, StatusLamp } from '../hardware/HardwareParts';

const styles = stylex.create({
  legend: {
    display: 'grid',
    gap: 2,
    minWidth: 116,
    color: 'var(--object-text)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    textAlign: 'center',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  value: {
    color: 'var(--object-accent)',
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: 2,
  },
  unit: {
    color: 'var(--object-muted)',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 2,
  },
});

type Tuner3DProps = {
  value: number;
  target?: number;
  min?: number;
  max?: number;
  theme: AreTheme;
  reducedMotion?: boolean;
  onChange: (value: number) => void;
};

export function Tuner3D({
  value,
  target = 73,
  min = 0,
  max = 99,
  theme,
  reducedMotion = false,
  onChange,
}: Tuner3DProps) {
  const palette = toThreeTheme(theme);
  const dial = useRef<Group>(null);
  const needle = useRef<Group>(null);
  const dragging = useRef(false);
  const [hovered, setHovered] = useState(false);
  const solved = value === target;
  const progress = (value - min) / (max - min);

  useFrame((_, delta) => {
    if (needle.current) {
      const targetX = -1.42 + progress * 2.84;
      needle.current.position.x = reducedMotion
        ? targetX
        : needle.current.position.x + (targetX - needle.current.position.x) * Math.min(1, delta * 12);
    }
    if (dial.current) {
      const targetRotation = -progress * Math.PI * 5;
      dial.current.rotation.z = reducedMotion
        ? targetRotation
        : dial.current.rotation.z + (targetRotation - dial.current.rotation.z) * Math.min(1, delta * 10);
      const targetScale = hovered ? 1.04 : 1;
      const nextScale = reducedMotion
        ? targetScale
        : dial.current.scale.x + (targetScale - dial.current.scale.x) * Math.min(1, delta * 12);
      dial.current.scale.setScalar(nextScale);
    }
  });

  const readPoint = (x: number, y: number) => {
    onChange(dialValueFromClockPoint(x - 1.22, y + 0.72, { min, max }));
  };

  return (
    <group position={[0, 0, 0]}>
      <RoundedBox args={[5.2, 3.15, 0.5]} radius={0.2} smoothness={5} position={[0, 0, -0.34]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.housing} metalness={0.8} roughness={0.27} />
      </RoundedBox>
      <PanelScrew position={[-2.24, 1.27, -0.04]} palette={palette} scale={0.8} />
      <PanelScrew position={[2.24, 1.27, -0.04]} palette={palette} scale={0.8} />
      <PanelScrew position={[-2.24, -1.27, -0.04]} palette={palette} scale={0.8} />
      <PanelScrew position={[2.24, -1.27, -0.04]} palette={palette} scale={0.8} />

      <RoundedBox args={[3.55, 0.82, 0.14]} radius={0.08} smoothness={4} position={[-0.35, 0.66, 0]}>
        <meshStandardMaterial color={palette.face} emissive={palette.accent} emissiveIntensity={0.06} />
      </RoundedBox>
      {Array.from({ length: 17 }, (_, index) => {
        const x = -1.76 + index * 0.1775;
        const tall = index % 4 === 0;
        return (
          <mesh key={index} position={[x, 0.68, 0.09]}>
            <boxGeometry args={[0.025, tall ? 0.34 : 0.2, 0.03]} />
            <meshStandardMaterial color={tall ? palette.metalLight : palette.metal} emissive={palette.accent} emissiveIntensity={0.05} />
          </mesh>
        );
      })}
      <group ref={needle} position={[-1.42, 0.66, 0.14]}>
        <mesh>
          <boxGeometry args={[0.045, 0.58, 0.045]} />
          <meshStandardMaterial color={solved ? palette.success : palette.warning} emissive={solved ? palette.success : palette.warning} emissiveIntensity={0.9} />
        </mesh>
      </group>

      <group
        ref={dial}
        position={[1.22, -0.72, 0.12]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(event) => {
          event.stopPropagation();
          dragging.current = true;
          readPoint(event.point.x, event.point.y);
          const target = event.nativeEvent.target;
          if (target instanceof Element) target.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          event.stopPropagation();
          readPoint(event.point.x, event.point.y);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          dragging.current = false;
          readPoint(event.point.x, event.point.y);
          const target = event.nativeEvent.target;
          if (target instanceof Element && target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onWheel={(event) => {
          event.stopPropagation();
          onChange(stepDialValue(value, event.deltaY > 0 ? 1 : -1, { min, max }));
        }}
      >
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.72, 0.8, 0.55, 48]} />
          <meshStandardMaterial color={hovered ? palette.metalLight : palette.metal} metalness={0.9} roughness={0.2} />
        </mesh>
        {Array.from({ length: 20 }, (_, index) => {
          const angle = index * (Math.PI * 2 / 20);
          return (
            <mesh key={index} position={[Math.sin(angle) * 0.68, Math.cos(angle) * 0.68, 0.29]} rotation={[0, 0, -angle]}>
              <boxGeometry args={[0.035, 0.15, 0.035]} />
              <meshStandardMaterial color={palette.metalDark} />
            </mesh>
          );
        })}
      </group>

      <Html transform center position={[-0.85, -0.66, 0.16]} distanceFactor={6}>
        <div {...stylex.props(styles.legend)} style={toObjectThemeStyle(theme)}>
          <span {...stylex.props(styles.value)}>{String(value).padStart(2, '0')}</span>
          <span {...stylex.props(styles.unit)}>SIGNAL BAND</span>
        </div>
      </Html>
      <StatusLamp position={[-2.1, -0.82, 0.02]} color={solved ? palette.success : palette.warning} active={solved} />
      <pointLight position={[-0.4, 0.7, 1.2]} color={solved ? palette.success : palette.accent} intensity={solved ? 0.8 : 0.28} distance={4} />
    </group>
  );
}

