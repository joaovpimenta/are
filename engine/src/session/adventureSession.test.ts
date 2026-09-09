import { describe, expect, it, vi } from 'vitest';
import { createAdventureSession } from './adventureSession';

describe('AdventureSession', () => {
  it('completes only after every required mechanism is solved', () => {
    const session = createAdventureSession({
      adventureId: 'echo-station',
      requiredMechanisms: ['dial', 'keypad', 'inventory'],
    });

    session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'dial' });
    session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'keypad' });
    expect(session.getSnapshot().completed).toBe(false);

    session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'inventory' });
    expect(session.getSnapshot().completed).toBe(true);
  });

  it('deduplicates artifacts and resets every cross-mechanism fact', () => {
    const session = createAdventureSession({
      adventureId: 'fixture',
      requiredMechanisms: ['archive'],
      initialSceneId: 'arrival',
    });

    session.send({ type: 'ARTIFACT_COLLECTED', artifactId: 'brass-key' });
    session.send({ type: 'ARTIFACT_COLLECTED', artifactId: 'brass-key' });
    session.send({ type: 'ARTIFACT_SELECTED', artifactId: 'brass-key' });
    session.send({ type: 'SCENE_CHANGED', sceneId: 'vault' });
    session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'archive' });
    session.reset();

    expect(session.getSnapshot()).toMatchObject({
      sceneId: 'arrival',
      inventory: [],
      selectedArtifactId: null,
      completed: false,
      mechanismResults: { archive: 'pending' },
    });
  });

  it('publishes completion once and refuses work after destroy', () => {
    const session = createAdventureSession({
      adventureId: 'fixture',
      requiredMechanisms: ['dial'],
    });
    const completed = vi.fn();
    session.events.on('completed', completed);

    session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'dial' });
    session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'dial' });
    expect(completed).toHaveBeenCalledTimes(1);

    session.destroy();
    expect(() => session.send({ type: 'RESET' })).toThrow('destroyed');
  });
});

