import { Canvas } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

const styles = stylex.create({
  stage: {
    minWidth: 0,
    minHeight: {
      default: 520,
      '@media (max-width: 820px)': 360,
      '@media (max-width: 480px)': 310,
    },
    backgroundImage: 'radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--echo-accent) 9%, transparent), transparent 52%)',
  },
});

export function HardwareStage({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div {...stylex.props(styles.stage)}>
      <Canvas aria-label={label} shadows dpr={[1, 1.5]} camera={{ position: [0, 0.15, 7.7], fov: 38 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 7]} intensity={2.2} castShadow />
        <directionalLight position={[-4, 1, 3]} intensity={0.65} />
        <hemisphereLight color="#ffd29d" groundColor="#050708" intensity={0.3} />
        {children}
      </Canvas>
    </div>
  );
}
