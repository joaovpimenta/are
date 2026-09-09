export type SequenceStatus = 'idle' | 'active' | 'error' | 'solved';

export type SequenceState = {
  selection: readonly number[];
  status: SequenceStatus;
};

export type SequenceEvent =
  | { type: 'SELECT'; index: number }
  | { type: 'RESET' };

export function createSequenceState(): SequenceState {
  return { selection: [], status: 'idle' };
}

export function transitionSequence(
  state: SequenceState,
  event: SequenceEvent,
  solution: readonly number[],
): SequenceState {
  if (event.type === 'RESET') return createSequenceState();
  if (state.status === 'solved' || state.selection.includes(event.index)) return state;

  const selection = [...state.selection, event.index];
  if (selection.length < solution.length) return { selection, status: 'active' };

  const solved = selection.every((value, position) => value === solution[position]);
  return { selection, status: solved ? 'solved' : 'error' };
}

