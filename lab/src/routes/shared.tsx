import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

function SurfaceTouchAction({ value }: { value: 'pan-y' | 'none' }) {
  const { gl } = useThree();

  useEffect(() => {
    gl.domElement.style.touchAction = value;
    return () => {
      gl.domElement.style.touchAction = '';
    };
  }, [gl, value]);

  return null;
}

function SceneReady() {
  useFrame(({ gl }) => {
    gl.domElement.dataset.sceneReady = 'true';
  });
  return null;
}

export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 6, 7]} intensity={2.2} castShadow />
      <directionalLight position={[-5, 1, 4]} intensity={0.72} />
      <hemisphereLight color="#bceeff" groundColor="#05070b" intensity={0.34} />
    </>
  );
}

export function HardwareCanvas({
  children,
  cameraZ = 7.5,
  ariaLabel,
  touchAction = 'pan-y',
}: {
  children: ReactNode;
  cameraZ?: number;
  ariaLabel: string;
  touchAction?: 'pan-y' | 'none';
}) {
  return (
    <Canvas
      aria-label={ariaLabel}
      shadows
      camera={{ position: [0, 0.12, cameraZ], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <SceneLighting />
      <SurfaceTouchAction value={touchAction} />
      {children}
      <SceneReady />
    </Canvas>
  );
}
