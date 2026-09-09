export type ModuleListener = () => void;

export interface ReadableModule<Snapshot> {
  getSnapshot(): Snapshot;
  subscribe(listener: ModuleListener): () => void;
}

export interface StatefulModule<Snapshot, Event> extends ReadableModule<Snapshot> {
  send(event: Event): Snapshot;
  reset(): Snapshot;
  destroy(): void;
}

