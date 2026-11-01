import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCallback, type ComponentProps } from 'react';

export function HardwareLabel(props: Omit<ComponentProps<typeof Html>, 'ref'>) {
  const invalidate = useThree((state) => state.invalidate);
  const projectLabel = useCallback((node: HTMLDivElement | null) => {
    // Html commits through a separate DOM root after the initial Three frame.
    // Project after that commit even when the scene renders on demand.
    if (node) invalidate();
  }, [invalidate]);
  return <Html {...props} ref={projectLabel} />;
}
