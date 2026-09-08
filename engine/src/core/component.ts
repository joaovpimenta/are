import type { EventMap, EventSubscription } from './events';

export type ComponentStatus = 'idle' | 'ready' | 'active' | 'success' | 'error' | 'destroyed';

export interface ComponentContext {
  reducedMotion: boolean;
  debug?: boolean;
}

export interface ComponentInstance<Events extends EventMap = EventMap> {
  reset(): void;
  destroy(): void;
  on<Key extends keyof Events>(event: Key, listener: (payload: Events[Key]) => void): EventSubscription;
}

export interface MountableComponent<Config, Events extends EventMap = EventMap> {
  mount(target: HTMLElement, config: Config, context: ComponentContext): ComponentInstance<Events>;
}

export interface CommonComponentEvents {
  ready: undefined;
  change: unknown;
  input: unknown;
  select: unknown;
  success: unknown;
  error: unknown;
  solved: unknown;
  completed: unknown;
  reset: undefined;
}
