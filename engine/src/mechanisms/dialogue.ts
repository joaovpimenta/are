export type DialogueState = {
  lineIndex: number;
  completed: boolean;
};

export function createDialogueState(): DialogueState {
  return { lineIndex: 0, completed: false };
}

export function advanceDialogue(state: DialogueState, lineCount: number): DialogueState {
  if (state.completed || lineCount <= 0) return state;
  if (state.lineIndex < lineCount - 1) {
    return { lineIndex: state.lineIndex + 1, completed: false };
  }
  return { lineIndex: Math.max(0, lineCount - 1), completed: true };
}

