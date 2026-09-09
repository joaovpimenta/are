import { describe, expect, it } from 'vitest';
import { createSequenceState, transitionSequence } from './sequence';

describe('sequence mechanism', () => {
  it('solves the configured order and ignores repeated positions', () => {
    const solution = [1, 3, 0];
    let state = createSequenceState();
    state = transitionSequence(state, { type: 'SELECT', index: 1 }, solution);
    state = transitionSequence(state, { type: 'SELECT', index: 1 }, solution);
    state = transitionSequence(state, { type: 'SELECT', index: 3 }, solution);
    state = transitionSequence(state, { type: 'SELECT', index: 0 }, solution);
    expect(state).toEqual({ selection: solution, status: 'solved' });
  });

  it('enters error and can reset without a timer', () => {
    const solution = [0, 1];
    let state = transitionSequence(createSequenceState(), { type: 'SELECT', index: 1 }, solution);
    state = transitionSequence(state, { type: 'SELECT', index: 0 }, solution);
    expect(state.status).toBe('error');
    expect(transitionSequence(state, { type: 'RESET' }, solution)).toEqual(createSequenceState());
  });
});

