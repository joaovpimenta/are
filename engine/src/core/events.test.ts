import { describe, expect, it, vi } from 'vitest';
import { TypedEventEmitter } from './events';

type Events = {
  change: { value: number };
  reset: undefined;
};

describe('TypedEventEmitter', () => {
  it('emits payloads and unsubscribes listeners', () => {
    const emitter = new TypedEventEmitter<Events>();
    const listener = vi.fn();
    const subscription = emitter.on('change', listener);

    emitter.emit('change', { value: 1 });
    subscription.unsubscribe();
    emitter.emit('change', { value: 2 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ value: 1 });
  });

  it('supports one-shot listeners', () => {
    const emitter = new TypedEventEmitter<Events>();
    const listener = vi.fn();
    emitter.once('reset', listener);

    emitter.emit('reset', undefined);
    emitter.emit('reset', undefined);

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
