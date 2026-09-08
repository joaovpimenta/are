export type EventMap = Record<string, unknown>;

export type EventListener<Payload> = (payload: Payload) => void;

export interface EventSubscription {
  unsubscribe(): void;
}

export class TypedEventEmitter<Events extends EventMap> {
  private readonly listeners = new Map<keyof Events, Set<EventListener<Events[keyof Events]>>>();

  on<Key extends keyof Events>(event: Key, listener: EventListener<Events[Key]>): EventSubscription {
    const listeners = this.listeners.get(event) ?? new Set<EventListener<Events[keyof Events]>>();
    listeners.add(listener as EventListener<Events[keyof Events]>);
    this.listeners.set(event, listeners);

    return {
      unsubscribe: () => this.off(event, listener),
    };
  }

  once<Key extends keyof Events>(event: Key, listener: EventListener<Events[Key]>): EventSubscription {
    let subscription: EventSubscription;
    subscription = this.on(event, (payload) => {
      subscription.unsubscribe();
      listener(payload);
    });
    return subscription;
  }

  off<Key extends keyof Events>(event: Key, listener: EventListener<Events[Key]>): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    listeners.delete(listener as EventListener<Events[keyof Events]>);
    if (listeners.size === 0) this.listeners.delete(event);
  }

  emit<Key extends keyof Events>(event: Key, payload: Events[Key]): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    for (const listener of [...listeners]) {
      listener(payload);
    }
  }

  clear(event?: keyof Events): void {
    if (event !== undefined) {
      this.listeners.delete(event);
      return;
    }

    this.listeners.clear();
  }
}
