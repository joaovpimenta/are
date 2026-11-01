import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { HardwareViewport } from '@are/engine/components/hardware/HardwareViewport';
import { echoStyles } from './styles';

export function HardwareStage({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div {...stylex.props(echoStyles.stage)}>
      <HardwareViewport ariaLabel={label} cameraZ={7.7}>
        {children}
      </HardwareViewport>
    </div>
  );
}
