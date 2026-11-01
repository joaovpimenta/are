import type { ReactNode } from 'react';
import { HardwareViewport } from '@are/engine/components/hardware/HardwareViewport';

export function HardwareCanvas({ children, cameraZ = 7.5, ariaLabel }: { children: ReactNode; cameraZ?: number; ariaLabel: string }) {
  return <HardwareViewport ariaLabel={ariaLabel} cameraZ={cameraZ}>{children}</HardwareViewport>;
}
