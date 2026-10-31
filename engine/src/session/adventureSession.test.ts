import { describe, expect, it, vi } from 'vitest';
import { createAdventureSession } from './adventureSession';

describe('AdventureSession', () => {
  it('resumes scene, puzzle input and collected evidence from a checkpoint', () => {
    const records = new Map<string, string>();
    const storage = { getItem: (key: string) => records.get(key) ?? null, setItem: (key: string, value: string) => { records.set(key, value); } };
    const definition = { adventureId: 'echo', requiredMechanisms: ['dialogue', 'cipher'], initialSceneId: 'transmission', persistence: { storage } };
    const session = createAdventureSession(definition);
    session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'dialogue' });
    session.send({ type: 'MECHANISM_INPUT_CHANGED', mechanismId: 'cipher', value: [7, 2, 0] });
    session.send({ type: 'ARTIFACT_COLLECTED', artifactId: 'recording' });
    session.send({ type: 'SCENE_CHANGED', sceneId: 'cipher' });

    const resumed = createAdventureSession(definition);
    expect(resumed.getSnapshot()).toMatchObject({ sceneId: 'cipher', mechanismResults: { dialogue: 'solved', cipher: 'pending' }, mechanismInputs: { cipher: [7, 2, 0] }, inventory: ['recording'], completed: false });
    resumed.reset();
    expect(createAdventureSession(definition).getSnapshot()).toMatchObject({ sceneId: 'transmission', mechanismInputs: {}, inventory: [], completed: false });
  });

  it('ignores corrupt checkpoints and remains playable when storage is unavailable', () => {
    const storage = { getItem: () => '{broken', setItem: () => { throw new Error('Storage full'); } };
    const session = createAdventureSession({ adventureId: 'echo', requiredMechanisms: ['dial'], persistence: { storage } });
    expect(session.getSnapshot().mechanismResults.dial).toBe('pending');
    expect(() => session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'dial' })).not.toThrow();
    expect(session.getSnapshot().completed).toBe(true);
  });

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

