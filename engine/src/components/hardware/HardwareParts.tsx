import type { ThreeElements } from '@react-three/fiber';
import type { ThreeTheme } from '../../theme';

type Position = ThreeElements['group']['position'];

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
      <mesh>
        <cylinderGeometry args={[0.14, 0.14, 0.08, 24]} />
        <meshStandardMaterial color="#18212c" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.085, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 2.2 : 0.08} roughness={0.25} />
      </mesh>
      {active ? <pointLight position={[0, 0, 0.28]} color={color} intensity={0.65} distance={1.8} /> : null}
    </group>
  );
}

