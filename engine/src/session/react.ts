import { useSyncExternalStore } from 'react';
import type { ReadableModule } from '../core/module';

export function useModuleSnapshot<Snapshot>(module: ReadableModule<Snapshot>): Snapshot {
  return useSyncExternalStore(module.subscribe, module.getSnapshot, module.getSnapshot);
}

