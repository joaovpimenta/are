import { Html, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { useRef, useState } from 'react';
import type { Group } from 'three';
import { dialRotation, dialValueFromClockPoint, stepDialValue } from '../../mechanisms/dial';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle, toThreeTheme } from '../../theme';
import { PanelScrew, StatusLamp } from '../hardware/HardwareParts';

const styles = stylex.create({
  readout: {
    minWidth: 58,
    padding: '7px 10px',
    borderRadius: 999,
    textAlign: 'center',
    color: 'var(--object-text)',
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 90%, black)',
    border: '1px solid color-mix(in srgb, var(--object-accent) 22%, transparent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 13,
    fontWeight: 800,
    userSelect: 'none',
    pointerEvents: 'none',
  },
});

type Dial3DProps = {
  value: number;
  target?: number;
  min?: number;
  max?: number;
  theme: AreTheme;
  onChange: (value: number) => void;
  reducedMotion?: boolean;
  disabled?: boolean;
};

export function Dial3D({
  value,
  target = 7,
  min = 0,
  max = 9,
  theme,
  onChange,
  reducedMotion = false,
  disabled = false,
}: Dial3DProps) {
  const group = useRef<Group>(null);
  const dragging = useRef(false);
  const [hovered, setHovered] = useState(false);
  const solved = value === target;
  const range = max - min + 1;
  const targetRotation = dialRotation(value, { min, max });
  const palette = toThreeTheme(theme);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (reducedMotion) group.current.rotation.z = targetRotation;
    else group.current.rotation.z += (targetRotation - group.current.rotation.z) * Math.min(1, delta * 9);
    const targetScale = hovered ? 1.04 : 1;
    const next = reducedMotion
      ? targetScale
      : group.current.scale.x + (targetScale - group.current.scale.x) * Math.min(1, delta * 12);
    group.current.scale.setScalar(next);
  });

  const step = (direction: number) => {
    if (!disabled) onChange(stepDialValue(value, direction, { min, max }));
  };

  const readClockPoint = (x: number, y: number) => {
    if (!disabled) onChange(dialValueFromClockPoint(x, y + 0.05, { min, max }));
  };

  return (
    <group position={[0, -0.05, 0]}>
      <RoundedBox args={[4.65, 4.75, 0.42]} radius={0.22} smoothness={5} position={[0, 0, -0.52]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.housing} metalness={0.82} roughness={0.24} />
      </RoundedBox>
      <mesh position={[0, 0, -0.27]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.92, 1.98, 0.18, 64]} />
        <meshStandardMaterial color={palette.metalDark} metalness={0.92} roughness={0.18} />
      </mesh>
      <PanelScrew position={[-1.96, 1.98, -0.25]} palette={palette} />
      <PanelScrew position={[1.96, 1.98, -0.25]} palette={palette} />
      <PanelScrew position={[-1.96, -1.98, -0.25]} palette={palette} />
      <PanelScrew position={[1.96, -1.98, -0.25]} palette={palette} />
      <StatusLamp position={[1.72, -1.65, -0.24]} color={solved ? palette.success : palette.warning} active={solved} />

      <group
        ref={group}
        rotation={[0, 0, 0]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(event) => {
          event.stopPropagation();
          dragging.current = true;
          readClockPoint(event.point.x, event.point.y);
          const nativeTarget = event.nativeEvent.target;
          if (nativeTarget instanceof Element) {
            nativeTarget.setPointerCapture(event.pointerId);
          }
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          event.stopPropagation();
          readClockPoint(event.point.x, event.point.y);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          dragging.current = false;
          readClockPoint(event.point.x, event.point.y);
          const nativeTarget = event.nativeEvent.target;
          if (nativeTarget instanceof Element && nativeTarget.hasPointerCapture(event.pointerId)) {
            nativeTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onWheel={(event) => {
          event.stopPropagation();
          step(event.deltaY > 0 ? 1 : -1);
        }}
      >
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.42, 1.62, 0.72, 64]} />
          <meshStandardMaterial
            color={hovered ? palette.housingRaised : palette.metal}
            metalness={0.88}
            roughness={0.18}
            emissive={solved ? palette.success : palette.accent}
            emissiveIntensity={solved ? 0.16 : hovered ? 0.08 : 0.02}
          />
        </mesh>
        {Array.from({ length: range }, (_, index) => {
          const angle = index * ((Math.PI * 2) / range);
          return (
            <mesh key={index} position={[Math.sin(angle) * 1.31, Math.cos(angle) * 1.31, 0.39]} rotation={[0, 0, -angle]}>
              <boxGeometry args={[0.055, 0.22, 0.08]} />
              <meshStandardMaterial color={index === value - min ? palette.accent : palette.metalDark} emissive={palette.accent} emissiveIntensity={index === value - min ? 0.7 : 0.02} />
            </mesh>
          );
        })}
      </group>

      <mesh position={[0, 1.78, 0.14]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.26, 0.26, 0.18]} />
        <meshStandardMaterial color={solved ? palette.success : palette.accent} emissive={solved ? palette.success : palette.accent} emissiveIntensity={0.5} />
      </mesh>

      <Html transform center position={[0, -2.25, 0.2]} distanceFactor={6}>
        <div {...stylex.props(styles.readout)} style={toObjectThemeStyle(theme)}>{String(value).padStart(2, '0')}</div>
      </Html>

      <pointLight position={[0, 1.2, 1.4]} color={solved ? palette.success : palette.accent} intensity={solved ? 1.1 : 0.45} distance={4.5} />
    </group>
  );
}
