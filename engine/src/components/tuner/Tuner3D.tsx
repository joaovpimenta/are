import { Html, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { useRef, useState } from 'react';
import type { Group, Vector3 } from 'three';
import {
  beginGesture,
  isTapGesture,
  moveGestureRespectingPageScroll,
  shouldCaptureAfterMove,
  type GestureState,
  type PointerSample,
} from '../../input/gesture';
import { interactionDebugEnabled, recordPointerDebug } from '../../input/interactionDebug';
import { capturePointer, releasePointer } from '../../input/pointerCapture';
import { dialValueFromClockPoint, stepDialValue } from '../../mechanisms/dial';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle, toThreeTheme } from '../../theme';
import { AccentRail, PanelInset, PanelScrew, StatusLamp } from '../hardware/HardwareParts';

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
  value: { color: 'var(--object-accent)', fontSize: 18, fontWeight: 900, letterSpacing: 2 },
  unit: { color: 'var(--object-muted)', fontSize: 9, fontWeight: 800, letterSpacing: 2 },
});

type Tuner3DProps = {
  value: number;
  target?: number;
  min?: number;
  max?: number;
  theme: AreTheme;
  reducedMotion?: boolean;
  disabled?: boolean;
  onChange: (value: number) => void;
};

function pointerSample(event: ThreeEvent<PointerEvent>): PointerSample {
  return {
    pointerId: event.pointerId,
    pointerType: event.nativeEvent.pointerType,
    clientX: event.nativeEvent.clientX,
    clientY: event.nativeEvent.clientY,
  };
}

export function Tuner3D({
  value,
  target = 73,
  min = 0,
  max = 99,
  theme,
  reducedMotion = false,
  disabled = false,
  onChange,
}: Tuner3DProps) {
  const palette = toThreeTheme(theme);
  const dialSpace = useRef<Group>(null);
  const rotor = useRef<Group>(null);
  const needle = useRef<Group>(null);
  const gesture = useRef<GestureState | null>(null);
  const [hovered, setHovered] = useState(false);
  const solved = value === target;
  const progress = (value - min) / (max - min);
  const debugHitTargets = interactionDebugEnabled();

  useFrame((_, delta) => {
    if (needle.current) {
      const targetX = -1.42 + progress * 2.84;
      needle.current.position.x = reducedMotion ? targetX : needle.current.position.x + (targetX - needle.current.position.x) * Math.min(1, delta * 12);
    }
    if (rotor.current) {
      const targetRotation = -progress * Math.PI * 5;
      rotor.current.rotation.z = reducedMotion ? targetRotation : rotor.current.rotation.z + (targetRotation - rotor.current.rotation.z) * Math.min(1, delta * 10);
      const targetScale = hovered ? 1.04 : 1;
      const nextScale = reducedMotion ? targetScale : rotor.current.scale.x + (targetScale - rotor.current.scale.x) * Math.min(1, delta * 12);
      rotor.current.scale.setScalar(nextScale);
    }
  });

  const localPoint = (point: Vector3) => dialSpace.current?.worldToLocal(point.clone()) ?? point.clone();
  const readLocalPoint = (point: Vector3) => {
    if (!disabled) onChange(dialValueFromClockPoint(point.x, point.y, { min, max }));
  };
  const debug = (event: ThreeEvent<PointerEvent>, local: Vector3) => {
    const target = event.nativeEvent.target;
    if (!(target instanceof Element)) return;
    recordPointerDebug(pointerSample(event), target.getBoundingClientRect(), event.object.name || 'tuner', local);
  };

  return (
    <group>
      <RoundedBox args={[5.2, 3.15, 0.5]} radius={0.2} smoothness={5} position={[0, 0, -0.34]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.housing} metalness={0.8} roughness={0.27} />
      </RoundedBox>
      <PanelScrew position={[-2.24, 1.27, -0.04]} palette={palette} scale={0.8} />
      <PanelScrew position={[2.24, 1.27, -0.04]} palette={palette} scale={0.8} />
      <PanelScrew position={[-2.24, -1.27, -0.04]} palette={palette} scale={0.8} />
      <PanelScrew position={[2.24, -1.27, -0.04]} palette={palette} scale={0.8} />
      <PanelInset position={[0, 0, -0.15]} size={[4.58, 2.5, 0.14]} palette={palette} />
      <PanelInset position={[-0.35, 0.66, 0.01]} size={[3.62, 0.84, 0.1]} palette={palette} accent />
      <AccentRail position={[-2.08, -0.18, 0.08]} length={1.18} palette={palette} vertical />
      <AccentRail position={[-2.08, 1.1, 0.08]} length={0.48} palette={palette} />

      <RoundedBox args={[3.55, 0.82, 0.14]} radius={0.08} smoothness={4} position={[-0.35, 0.66, 0]}>
        <meshStandardMaterial color={palette.face} emissive={palette.accent} emissiveIntensity={0.06} />
      </RoundedBox>
      {Array.from({ length: 17 }, (_, index) => {
        const x = -1.76 + index * 0.1775;
        const tall = index % 4 === 0;
        return <mesh key={index} position={[x, 0.68, 0.09]}><boxGeometry args={[0.025, tall ? 0.34 : 0.2, 0.03]} /><meshStandardMaterial color={tall ? palette.metalLight : palette.metal} emissive={palette.accent} emissiveIntensity={0.05} /></mesh>;
      })}
      <group ref={needle} position={[-1.42, 0.66, 0.14]}>
        <mesh><boxGeometry args={[0.045, 0.58, 0.045]} /><meshStandardMaterial color={solved ? palette.success : palette.warning} emissive={solved ? palette.success : palette.warning} emissiveIntensity={0.9} /></mesh>
      </group>

      <group
        ref={dialSpace}
        position={[1.22, -0.72, 0.12]}
        onPointerEnter={(event) => { event.stopPropagation(); if (!disabled) setHovered(true); }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(event) => {
          if (disabled) return;
          event.stopPropagation();
          gesture.current = beginGesture('rotate', pointerSample(event));
          debug(event, localPoint(event.point));
        }}
        onPointerMove={(event) => {
          const current = gesture.current;
          if (!current || current.pointerId !== event.pointerId || disabled) return;
          const next = moveGestureRespectingPageScroll(current, pointerSample(event));
          gesture.current = next;
          if (next.phase === 'cancelled') return;
          if (shouldCaptureAfterMove(current, next)) capturePointer(event.nativeEvent.target, event.pointerId);
          if (next.phase === 'active') {
            event.stopPropagation();
            const local = localPoint(event.point);
            readLocalPoint(local);
            debug(event, local);
          }
        }}
        onPointerUp={(event) => {
          const current = gesture.current;
          if (!current || current.pointerId !== event.pointerId) return;
          if (current.phase === 'cancelled') {
            releasePointer(event.nativeEvent.target, event.pointerId);
            gesture.current = null;
            return;
          }
          event.stopPropagation();
          const local = localPoint(event.point);
          if (!disabled && (current.phase === 'active' || isTapGesture(current))) readLocalPoint(local);
          debug(event, local);
          releasePointer(event.nativeEvent.target, event.pointerId);
          gesture.current = null;
        }}
        onPointerCancel={(event) => { releasePointer(event.nativeEvent.target, event.pointerId); gesture.current = null; }}
        onLostPointerCapture={() => { gesture.current = null; }}
        onWheel={(event) => {
          if (disabled) return;
          event.stopPropagation();
          onChange(stepDialValue(value, event.deltaY > 0 ? 1 : -1, { min, max }));
        }}
      >
        <mesh name="tuner-hit-target" position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.24, 40]} />
          <meshBasicMaterial color={palette.accent} transparent opacity={debugHitTargets ? 0.18 : 0} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.96, 1, 0.12, 48]} />
          <meshStandardMaterial color={palette.metalDark} metalness={0.86} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <torusGeometry args={[0.91, 0.045, 14, 48]} />
          <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.3} metalness={0.7} roughness={0.24} />
        </mesh>
        <group ref={rotor}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.72, 0.8, 0.55, 48]} />
            <meshStandardMaterial color={hovered ? palette.metalLight : palette.metal} metalness={0.9} roughness={0.2} />
          </mesh>
          {Array.from({ length: 20 }, (_, index) => {
            const angle = index * (Math.PI * 2 / 20);
            return <mesh key={index} position={[Math.sin(angle) * 0.68, Math.cos(angle) * 0.68, 0.29]} rotation={[0, 0, -angle]}><boxGeometry args={[0.035, 0.15, 0.035]} /><meshStandardMaterial color={palette.metalDark} /></mesh>;
          })}
          <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.19, 0.12, 28]} />
            <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.28} metalness={0.82} roughness={0.18} />
          </mesh>
        </group>
      </group>

      <Html transform center position={[-0.85, -0.66, 0.16]} distanceFactor={6}>
        <div {...stylex.props(styles.legend)} style={toObjectThemeStyle(theme)}><span {...stylex.props(styles.value)}>{String(value).padStart(2, '0')}</span><span {...stylex.props(styles.unit)}>SIGNAL BAND</span></div>
      </Html>
      <StatusLamp position={[-2.1, -0.82, 0.02]} color={solved ? palette.success : palette.warning} active={solved} />
      <pointLight position={[-0.4, 0.7, 1.2]} color={solved ? palette.success : palette.accent} intensity={solved ? 0.8 : 0.28} distance={4} />
    </group>
  );
}
