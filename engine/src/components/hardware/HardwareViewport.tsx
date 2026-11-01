import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { Component, useLayoutEffect, useState, type ReactNode } from 'react';
import { getCanvasQuality } from '../../core/canvasQuality';

const styles = stylex.create({
  fallback: { display: 'grid', alignContent: 'center', minHeight: 240, padding: 24, color: 'inherit', fontSize: 15, lineHeight: 1.6 },
});

let webglSupported: boolean | undefined;
function supportsWebGL() {
  if (typeof document === 'undefined') return false;
  if (webglSupported !== undefined) return webglSupported;
  try {
    const context = document.createElement('canvas').getContext('webgl2');
    webglSupported = context !== null;
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch { webglSupported = false; }
  return webglSupported;
}

function Unavailable() {
  return <div {...stylex.props(styles.fallback)} role="status">A visualização 3D não está disponível. Continue o enigma pelos botões e controles da página.</div>;
}

class ViewportBoundary extends Component<{ children: ReactNode }, { unavailable: boolean }> {
  state = { unavailable: false };
  static getDerivedStateFromError() { return { unavailable: true }; }
  render() {
    return this.state.unavailable
      ? <Unavailable />
      : this.props.children;
  }
}

function CameraFit({ cameraZ }: { cameraZ: number }) {
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    // Preserve the artifact's full width on narrow portrait screens.
    camera.position.z = cameraZ * Math.max(1, 1.1 / (size.width / Math.max(1, size.height)));
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, cameraZ, size.width, size.height, invalidate]);
  useFrame(({ gl }) => { gl.domElement.dataset.sceneReady = 'true'; });
  return null;
}

export function HardwareViewport({ children, ariaLabel, cameraZ = 7.5 }: { children: ReactNode; ariaLabel: string; cameraZ?: number }) {
  const quality = getCanvasQuality();
  const [supported] = useState(supportsWebGL);
  if (!supported) return <Unavailable />;
  return <ViewportBoundary>
    <Canvas aria-label={ariaLabel} shadows="percentage" frameloop="demand" camera={{ position: [0, 0.12, cameraZ], fov: 38 }} dpr={quality.dpr} gl={{ antialias: true, powerPreference: 'high-performance' }} fallback={<p {...stylex.props(styles.fallback)}>Use os controles da página para continuar sem a visualização 3D.</p>}>
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 6, 7]} intensity={2.2} castShadow />
      <directionalLight position={[-5, 1, 4]} intensity={0.72} />
      <hemisphereLight color="#bceeff" groundColor="#05070b" intensity={0.34} />
      {children}
      <CameraFit cameraZ={cameraZ} />
    </Canvas>
  </ViewportBoundary>;
}
