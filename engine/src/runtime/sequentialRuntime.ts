import { TypedEventEmitter } from '../core/events';
import type { RuntimeContext } from './context';

export interface RuntimeScene {
  id: string;
}

export interface SequentialRuntimeEvents {
  started: { sceneId: string; index: number };
  change: { from: string | null; to: string; index: number };
  completed: { sceneId: string; index: number };
  reset: undefined;
}

export interface SequentialRuntimeOptions<Scene extends RuntimeScene> {
  scenes: readonly Scene[];
  context: RuntimeContext;
}

export class SequentialRuntime<Scene extends RuntimeScene = RuntimeScene> {
  readonly context: RuntimeContext;
  readonly events = new TypedEventEmitter<SequentialRuntimeEvents>();

  private readonly scenes: readonly Scene[];
  private currentIndex = -1;

  constructor(options: SequentialRuntimeOptions<Scene>) {
    if (options.scenes.length === 0) {
      throw new Error('SequentialRuntime requires at least one scene.');
    }

    const ids = new Set<string>();
    for (const scene of options.scenes) {
      if (!scene.id) throw new Error('Every scene must have a non-empty id.');
      if (ids.has(scene.id)) throw new Error(`Duplicate scene id: ${scene.id}`);
      ids.add(scene.id);
    }

    this.scenes = [...options.scenes];
    this.context = options.context;
  }

  get currentScene(): Scene | null {
    return this.currentIndex >= 0 ? this.scenes[this.currentIndex] ?? null : null;
  }

  get index(): number {
    return this.currentIndex;
  }

  get started(): boolean {
    return this.currentIndex >= 0;
  }

  get completed(): boolean {
    return this.currentIndex === this.scenes.length - 1;
  }

  start(sceneId?: string): Scene {
    const scene = this.goto(sceneId ?? this.scenes[0].id);
    this.events.emit('started', { sceneId: scene.id, index: this.currentIndex });
    return scene;
  }

  goto(sceneId: string): Scene {
    const nextIndex = this.scenes.findIndex((scene) => scene.id === sceneId);
    if (nextIndex === -1) throw new Error(`Unknown scene id: ${sceneId}`);

    const previous = this.currentScene?.id ?? null;
    this.currentIndex = nextIndex;
    const scene = this.scenes[nextIndex];
    this.events.emit('change', { from: previous, to: scene.id, index: nextIndex });
    return scene;
  }

  next(): Scene | null {
    if (!this.started) return this.start();

    const nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.scenes.length) {
      const scene = this.currentScene;
      if (scene) this.events.emit('completed', { sceneId: scene.id, index: this.currentIndex });
      return null;
    }

    return this.goto(this.scenes[nextIndex].id);
  }

  reset(): void {
    this.currentIndex = -1;
    this.events.emit('reset', undefined);
  }
}

export function createSequentialRuntime<Scene extends RuntimeScene>(options: SequentialRuntimeOptions<Scene>): SequentialRuntime<Scene> {
  return new SequentialRuntime(options);
}
