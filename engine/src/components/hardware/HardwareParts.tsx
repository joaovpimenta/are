import { RoundedBox } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import type { ThreeTheme } from '../../theme';

type Position = ThreeElements['group']['position'];
type Size = [number, number, number];

export function PanelInset({
  position,
  size,
  palette,
  accent = false,
  radius = 0.1,
}: {
  position: Position;
  size: Size;
  palette: ThreeTheme;
  accent?: boolean;
  radius?: number;
}) {
  const [width, height, depth] = size;
  return (
    <group position={position}>
      <RoundedBox args={[width + 0.12, height + 0.12, Math.max(0.1, depth)]} radius={radius + 0.025} smoothness={4} position={[0, 0, -0.035]}>
        <meshStandardMaterial color={palette.metalDark} metalness={0.86} roughness={0.25} />
      </RoundedBox>
      <RoundedBox args={size} radius={radius} smoothness={4} position={[0, 0, 0.035]}>
        <meshStandardMaterial
          color={accent ? palette.accentSoft : palette.face}
          emissive={accent ? palette.accent : palette.accent}
          emissiveIntensity={accent ? 0.12 : 0.025}
          metalness={accent ? 0.38 : 0.62}
          roughness={accent ? 0.42 : 0.34}
        />
      </RoundedBox>
    </group>
  );
}

export function AccentRail({
  position,
  length,
  palette,
  vertical = false,
}: {
  position: Position;
  length: number;
  palette: ThreeTheme;
  vertical?: boolean;
}) {
  return (
    <RoundedBox
      args={vertical ? [0.055, length, 0.055] : [length, 0.055, 0.055]}
      radius={0.025}
      smoothness={3}
      position={position}
    >
      <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.72} metalness={0.48} roughness={0.3} />
    </RoundedBox>
  );
}

export function PanelScrew({ position, palette, scale = 1 }: { position: Position; palette: ThreeTheme; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.07, 20]} />
        <meshStandardMaterial color={palette.metalLight} metalness={0.95} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.041]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.15, 0.025, 0.02]} />
        <meshStandardMaterial color={palette.metalDark} metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}

export function StatusLamp({
  position,
  color,
  active,
  scale = 1,
}: {
  position: Position;
  color: string;
  active: boolean;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.08, 24]} />
        <meshStandardMaterial color="#18212c" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.062]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.105, 0.018, 12, 24]} />
        <meshStandardMaterial color={active ? color : '#3c4a58'} metalness={0.84} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0, 0.083]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.085, 0.075, 0.035, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 2.2 : 0.08} roughness={0.25} />
      </mesh>
      {active ? <pointLight position={[0, 0, 0.28]} color={color} intensity={0.65} distance={1.8} /> : null}
    </group>
  );
}
