import { Canvas, useFrame } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { getCanvasQuality } from '@are/engine/core/canvasQuality';

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
}: {
  children: ReactNode;
  cameraZ?: number;
  ariaLabel: string;
}) {
  const quality = getCanvasQuality();

  return (
    <Canvas
      aria-label={ariaLabel}
      shadows="percentage"
      frameloop={quality.frameloop}
      camera={{ position: [0, 0.12, cameraZ], fov: 38 }}
      dpr={quality.dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <SceneLighting />
      {children}
      <SceneReady />
    </Canvas>
  );
}
