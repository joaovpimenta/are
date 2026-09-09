import { describe, expect, it } from 'vitest';
import { advanceDialogue, createDialogueState } from './dialogue';

describe('dialogue mechanism', () => {
  it('advances through lines and completes once', () => {
    let state = createDialogueState();
    state = advanceDialogue(state, 2);
    expect(state).toEqual({ lineIndex: 1, completed: false });
    state = advanceDialogue(state, 2);
    expect(state).toEqual({ lineIndex: 1, completed: true });
    expect(advanceDialogue(state, 2)).toBe(state);
  });
});

