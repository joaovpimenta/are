import { describe, expect, it, vi } from 'vitest';
import { createRuntimeContext } from './context';
import { createSequentialRuntime } from './sequentialRuntime';

const scenes = [
  { id: 'intro', title: 'Intro' },
  { id: 'vault', title: 'Vault' },
  { id: 'ending', title: 'Ending' },
] as const;

describe('SequentialRuntime', () => {
  it('starts, advances and navigates by id without DOM coupling', () => {
    const runtime = createSequentialRuntime({
      scenes,
      context: createRuntimeContext({ adventureId: 'fixture' }),
    });

    expect(runtime.currentScene).toBeNull();
    expect(runtime.start().id).toBe('intro');
    expect(runtime.next()?.id).toBe('vault');
    expect(runtime.goto('ending').title).toBe('Ending');
    expect(runtime.completed).toBe(true);
  });

  it('emits change and completion events', () => {
    const runtime = createSequentialRuntime({
      scenes,
      context: createRuntimeContext({ adventureId: 'fixture' }),
    });
    const changed = vi.fn();
    const completed = vi.fn();
    runtime.events.on('change', changed);
    runtime.events.on('completed', completed);

    runtime.start('vault');
    runtime.next();
    expect(runtime.next()).toBeNull();

    expect(changed).toHaveBeenNthCalledWith(1, { from: null, to: 'vault', index: 1 });
    expect(changed).toHaveBeenNthCalledWith(2, { from: 'vault', to: 'ending', index: 2 });
    expect(completed).toHaveBeenCalledWith({ sceneId: 'ending', index: 2 });
  });

  it('rejects invalid scene definitions and unknown navigation targets', () => {
    const context = createRuntimeContext({ adventureId: 'fixture' });

    expect(() => createSequentialRuntime({ scenes: [], context })).toThrow('at least one scene');
    expect(() => createSequentialRuntime({ scenes: [{ id: 'same' }, { id: 'same' }], context })).toThrow('Duplicate scene id');

    const runtime = createSequentialRuntime({ scenes, context });
    expect(() => runtime.goto('missing')).toThrow('Unknown scene id: missing');
  });

  it('resets back to the pre-start state', () => {
    const runtime = createSequentialRuntime({
      scenes,
      context: createRuntimeContext({ adventureId: 'fixture' }),
    });

    runtime.start();
    runtime.next();
    runtime.reset();

    expect(runtime.currentScene).toBeNull();
    expect(runtime.index).toBe(-1);
    expect(runtime.started).toBe(false);
  });
});
