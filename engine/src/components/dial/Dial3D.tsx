import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { useRef, useState } from 'react';
import type { Group } from 'three';
import type { AreTheme } from '../../theme';

const styles = stylex.create({
  readout: {
    minWidth: 58,
    padding: '7px 10px',
    borderRadius: 999,
    textAlign: 'center',
    color: '#f7fbff',
    backgroundColor: 'rgba(5, 10, 16, .86)',
    border: '1px solid rgba(255,255,255,.12)',
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
};

export function Dial3D({ value, target = 7, min = 0, max = 9, theme, onChange }: Dial3DProps) {
  const group = useRef<Group>(null);
  const dragStartX = useRef<number | null>(null);
  const dragLastStep = useRef(0);
  const [hovered, setHovered] = useState(false);
  const solved = value === target;
  const range = max - min + 1;
  const targetRotation = -(value - min) * ((Math.PI * 2) / range);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.z += (targetRotation - group.current.rotation.z) * Math.min(1, delta * 9);
    const targetScale = hovered ? 1.04 : 1;
    const next = group.current.scale.x + (targetScale - group.current.scale.x) * Math.min(1, delta * 12);
    group.current.scale.setScalar(next);
  });

  const step = (direction: number) => {
    const next = value + direction;
    if (next > max) onChange(min);
    else if (next < min) onChange(max);
    else onChange(next);
  };

  return (
    <group position={[0, -0.05, 0]}>
      <mesh castShadow receiveShadow position={[0, 0, -0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.05, 2.05, 0.42, 64]} />
        <meshStandardMaterial color={theme.surface} metalness={0.84} roughness={0.22} />
      </mesh>

      <group
        ref={group}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(event) => {
          event.stopPropagation();
          dragStartX.current = event.nativeEvent.clientX;
          dragLastStep.current = 0;
          // R3F targets are not guaranteed to be DOM elements, so narrow before capture.
          if (event.target instanceof Element) {
            event.target.setPointerCapture(event.pointerId);
          }
        }}
        onPointerMove={(event) => {
          if (dragStartX.current === null) return;
          event.stopPropagation();
          const distance = event.nativeEvent.clientX - dragStartX.current;
          const stepIndex = Math.trunc(distance / 34);
          const delta = stepIndex - dragLastStep.current;
          if (delta !== 0) {
            step(delta > 0 ? 1 : -1);
            dragLastStep.current = stepIndex;
          }
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          const start = dragStartX.current;
          dragStartX.current = null;
          dragLastStep.current = 0;
          if (event.target instanceof Element) {
            event.target.releasePointerCapture(event.pointerId);
          }
          if (start !== null && Math.abs(event.nativeEvent.clientX - start) < 8) {
            step(event.point.x < 0 ? -1 : 1);
          }
        }}
        onPointerCancel={() => {
          dragStartX.current = null;
          dragLastStep.current = 0;
        }}
        onWheel={(event) => {
          event.stopPropagation();
          step(event.deltaY > 0 ? 1 : -1);
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[1.48, 1.64, 0.72, 64]} />
          <meshStandardMaterial
            color={hovered ? theme.surfaceRaised : theme.metal}
            metalness={0.88}
            roughness={0.18}
            emissive={solved ? theme.success : theme.accent}
            emissiveIntensity={solved ? 0.16 : hovered ? 0.08 : 0.02}
          />
        </mesh>
        {Array.from({ length: range }, (_, index) => {
          const angle = index * ((Math.PI * 2) / range);
          return (
            <mesh key={index} position={[Math.sin(angle) * 1.31, 0.39, -Math.cos(angle) * 1.31]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.055, 0.08, 0.22]} />
              <meshStandardMaterial color={index === value - min ? theme.accent : '#263342'} emissive={theme.accent} emissiveIntensity={index === value - min ? 0.7 : 0.02} />
            </mesh>
          );
        })}
      </group>

      <mesh position={[0, 1.78, 0.14]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.26, 0.26, 0.18]} />
        <meshStandardMaterial color={solved ? theme.success : theme.accent} emissive={solved ? theme.success : theme.accent} emissiveIntensity={0.5} />
      </mesh>

      <Html transform center position={[0, -2.25, 0.2]} distanceFactor={6}>
        <div {...stylex.props(styles.readout)}>{String(value).padStart(2, '0')}</div>
      </Html>

      <pointLight position={[0, 1.2, 1.4]} color={solved ? theme.success : theme.accent} intensity={solved ? 1.1 : 0.45} distance={4.5} />
    </group>
  );
}
