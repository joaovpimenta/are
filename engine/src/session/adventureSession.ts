import { TypedEventEmitter } from '../core/events';
import type { ModuleListener, StatefulModule } from '../core/module';
import { loadCheckpoint, saveCheckpoint } from './checkpoint';

export type MechanismResult = 'pending' | 'active' | 'error' | 'solved';
export type MechanismInput = string | number | boolean | readonly (string | number | boolean)[];

export type AdventureSessionSnapshot = {
  adventureId: string;
  sceneId: string | null;
  mechanismResults: Readonly<Record<string, MechanismResult>>;
  mechanismInputs: Readonly<Record<string, MechanismInput>>;
  inventory: readonly string[];
  selectedArtifactId: string | null;
  completed: boolean;
  revision: number;
};

export type AdventureSessionEvent =
  | { type: 'MECHANISM_ACTIVE'; mechanismId: string }
  | { type: 'MECHANISM_ERROR'; mechanismId: string }
  | { type: 'MECHANISM_SOLVED'; mechanismId: string }
  | { type: 'MECHANISM_INPUT_CHANGED'; mechanismId: string; value: MechanismInput }
  | { type: 'ARTIFACT_COLLECTED'; artifactId: string }
  | { type: 'ARTIFACT_SELECTED'; artifactId: string | null }
  | { type: 'SCENE_CHANGED'; sceneId: string }
  | { type: 'RESET' };

export type AdventureSessionDefinition = {
  adventureId: string;
  requiredMechanisms: readonly string[];
  initialSceneId?: string | null;
  persistence?: { storage: Pick<Storage, 'getItem' | 'setItem'>; key?: string };
};

export type AdventureSessionEvents = {
  change: { event: AdventureSessionEvent; snapshot: AdventureSessionSnapshot };
  completed: { snapshot: AdventureSessionSnapshot };
  reset: { snapshot: AdventureSessionSnapshot };
};

function initialResults(requiredMechanisms: readonly string[]): Record<string, MechanismResult> {
  return Object.fromEntries(requiredMechanisms.map((id) => [id, 'pending']));
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export class AdventureSession implements StatefulModule<AdventureSessionSnapshot, AdventureSessionEvent> {
  readonly events = new TypedEventEmitter<AdventureSessionEvents>();

  private readonly definition: AdventureSessionDefinition;
  private readonly listeners = new Set<ModuleListener>();
  private snapshot: AdventureSessionSnapshot;
  private destroyed = false;

  constructor(definition: AdventureSessionDefinition) {
    const requiredMechanisms = unique(definition.requiredMechanisms);
    if (!definition.adventureId.trim()) throw new Error('AdventureSession requires a non-empty adventureId.');
    if (requiredMechanisms.some((id) => !id.trim())) throw new Error('Mechanism ids must be non-empty.');

    this.definition = { ...definition, requiredMechanisms };
    this.snapshot = loadCheckpoint(this.definition, this.createInitialSnapshot());
  }

  getSnapshot = (): AdventureSessionSnapshot => this.snapshot;

  subscribe = (listener: ModuleListener): (() => void) => {
    this.assertAlive();
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  send(event: AdventureSessionEvent): AdventureSessionSnapshot {
    this.assertAlive();
    if (event.type === 'RESET') return this.reset();

    const previousCompleted = this.snapshot.completed;
    let mechanismResults = this.snapshot.mechanismResults;
    let mechanismInputs = this.snapshot.mechanismInputs;
    let inventory = this.snapshot.inventory;
    let selectedArtifactId = this.snapshot.selectedArtifactId;
    let sceneId = this.snapshot.sceneId;

    switch (event.type) {
      case 'MECHANISM_INPUT_CHANGED':
        mechanismInputs = { ...mechanismInputs, [event.mechanismId]: Array.isArray(event.value) ? Object.freeze([...event.value]) : event.value };
        break;
      case 'MECHANISM_ACTIVE':
        mechanismResults = { ...mechanismResults, [event.mechanismId]: 'active' };
        break;
      case 'MECHANISM_ERROR':
        mechanismResults = { ...mechanismResults, [event.mechanismId]: 'error' };
        break;
      case 'MECHANISM_SOLVED':
        mechanismResults = { ...mechanismResults, [event.mechanismId]: 'solved' };
        break;
      case 'ARTIFACT_COLLECTED':
        inventory = unique([...inventory, event.artifactId]);
        break;
      case 'ARTIFACT_SELECTED':
        selectedArtifactId = event.artifactId;
        break;
      case 'SCENE_CHANGED':
        sceneId = event.sceneId;
        break;
    }

    const completed = this.definition.requiredMechanisms.every(
      (id) => mechanismResults[id] === 'solved',
    );

    this.snapshot = {
      ...this.snapshot,
      sceneId,
      mechanismResults: Object.freeze({ ...mechanismResults }),
      mechanismInputs: Object.freeze({ ...mechanismInputs }),
      inventory: Object.freeze([...inventory]),
      selectedArtifactId,
      completed,
      revision: this.snapshot.revision + 1,
    };
    saveCheckpoint(this.definition, this.snapshot);
    this.notify();
    this.events.emit('change', { event, snapshot: this.snapshot });
    if (!previousCompleted && completed) this.events.emit('completed', { snapshot: this.snapshot });
    return this.snapshot;
  }

  reset(): AdventureSessionSnapshot {
    this.assertAlive();
    this.snapshot = {
      ...this.createInitialSnapshot(),
      revision: this.snapshot.revision + 1,
    };
    saveCheckpoint(this.definition, this.snapshot);
    this.notify();
    this.events.emit('reset', { snapshot: this.snapshot });
    return this.snapshot;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.listeners.clear();
    this.events.clear();
  }

  private createInitialSnapshot(): AdventureSessionSnapshot {
    return {
      adventureId: this.definition.adventureId,
      sceneId: this.definition.initialSceneId ?? null,
      mechanismResults: Object.freeze(initialResults(this.definition.requiredMechanisms)),
      mechanismInputs: Object.freeze({}),
      inventory: Object.freeze([]),
      selectedArtifactId: null,
      completed: false,
      revision: 0,
    };
  }

  private notify(): void {
    for (const listener of [...this.listeners]) listener();
  }

  private assertAlive(): void {
    if (this.destroyed) throw new Error('AdventureSession has been destroyed.');
  }
}

export function createAdventureSession(definition: AdventureSessionDefinition): AdventureSession {
  return new AdventureSession(definition);
}

