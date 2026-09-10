import { Html, RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
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
import type { CanvasBounds } from '../../input/coordinates';
import { interactionDebugEnabled, recordPointerDebug } from '../../input/interactionDebug';
import { capturePointer, releasePointer } from '../../input/pointerCapture';
import { dialRotation, dialValueFromClockPoint, stepDialValue } from '../../mechanisms/dial';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle, toThreeTheme } from '../../theme';
import { AccentRail, PanelInset, PanelScrew, StatusLamp } from '../hardware/HardwareParts';

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

function pointerSample(event: ThreeEvent<PointerEvent>): PointerSample {
  return {
    pointerId: event.pointerId,
    pointerType: event.nativeEvent.pointerType,
    clientX: event.nativeEvent.clientX,
    clientY: event.nativeEvent.clientY,
  };
}

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
  const dialSpace = useRef<Group>(null);
  const rotor = useRef<Group>(null);
  const gesture = useRef<GestureState | null>(null);
  const pointerBounds = useRef<CanvasBounds | null>(null);
  const [hovered, setHovered] = useState(false);
  const solved = value === target;
  const range = max - min + 1;
  const targetRotation = dialRotation(value, { min, max });
  const palette = toThreeTheme(theme);
  const debugHitTargets = interactionDebugEnabled();
  const canvasHost = useThree(({ gl }) => gl.domElement.parentElement?.parentElement ?? gl.domElement);

  useFrame((_, delta) => {
    if (!rotor.current) return;
    if (reducedMotion) rotor.current.rotation.z = targetRotation;
    else rotor.current.rotation.z += (targetRotation - rotor.current.rotation.z) * Math.min(1, delta * 9);
    const targetScale = hovered ? 1.04 : 1;
    const next = reducedMotion
      ? targetScale
      : rotor.current.scale.x + (targetScale - rotor.current.scale.x) * Math.min(1, delta * 12);
    rotor.current.scale.setScalar(next);
  });

  const step = (direction: number) => {
    if (!disabled) onChange(stepDialValue(value, direction, { min, max }));
  };

  const localPoint = (point: Vector3) => dialSpace.current?.worldToLocal(point.clone()) ?? point.clone();
  const readLocalPoint = (point: Vector3) => {
    if (!disabled) onChange(dialValueFromClockPoint(point.x, point.y, { min, max }));
  };
  const debug = (event: ThreeEvent<PointerEvent>, local: Vector3, bounds = pointerBounds.current ?? canvasHost.getBoundingClientRect()) => {
    recordPointerDebug(pointerSample(event), bounds, event.object.name || 'dial', local);
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
      <PanelInset position={[0, 0, -0.12]} size={[4.02, 4.02, 0.12]} palette={palette} />
      <AccentRail position={[-1.62, 2.03, 0.06]} length={3.25} palette={palette} />
      <AccentRail position={[-1.62, -2.03, 0.06]} length={3.25} palette={palette} />
      <mesh position={[0, 0, -0.03]}>
        <torusGeometry args={[1.92, 0.045, 16, 64]} />
        <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.32} metalness={0.72} roughness={0.24} />
      </mesh>

      <group
        ref={dialSpace}
        onPointerEnter={(event) => {
          event.stopPropagation();
          if (!disabled) setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(event) => {
          if (disabled) return;
          event.stopPropagation();
          gesture.current = beginGesture('rotate', pointerSample(event));
          pointerBounds.current = canvasHost.getBoundingClientRect();
          debug(event, localPoint(event.point), pointerBounds.current);
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
          pointerBounds.current = null;
        }}
        onPointerCancel={(event) => {
          releasePointer(event.nativeEvent.target, event.pointerId);
          gesture.current = null;
          pointerBounds.current = null;
        }}
        onLostPointerCapture={() => {
          gesture.current = null;
          pointerBounds.current = null;
        }}
        onWheel={(event) => {
          if (disabled) return;
          event.stopPropagation();
          step(event.deltaY > 0 ? 1 : -1);
        }}
      >
        <mesh name="dial-hit-target" position={[0, 0, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.72, 1.72, 0.24, 48]} />
          <meshBasicMaterial color={palette.accent} transparent opacity={debugHitTargets ? 0.18 : 0} depthWrite={false} />
        </mesh>
        <group ref={rotor} rotation={[0, 0, 0]}>
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
