import { assign, setup } from 'xstate';

export type KeypadContext = {
  value: string;
  solution: string;
};

export type KeypadEvent =
  | { type: 'PRESS'; digit: string }
  | { type: 'CLEAR' }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

export const createKeypadMachine = (solution = '1984') => setup({
  types: {
    context: {} as KeypadContext,
    events: {} as KeypadEvent,
  },
  guards: {
    isCorrect: ({ context }) => context.value === context.solution,
  },
  actions: {
    press: assign({
      value: ({ context, event }) =>
        event.type === 'PRESS' && context.value.length < context.solution.length
          ? `${context.value}${event.digit}`
          : context.value,
    }),
    clear: assign({ value: '' }),
  },
}).createMachine({
  id: 'keypad',
  initial: 'idle',
  context: { value: '', solution },
  states: {
    idle: {
      on: {
        PRESS: { target: 'typing', actions: 'press' },
        CLEAR: { actions: 'clear' },
      },
    },
    typing: {
      on: {
        PRESS: { actions: 'press' },
        CLEAR: { target: 'idle', actions: 'clear' },
        SUBMIT: [
          { guard: 'isCorrect', target: 'solved' },
          { target: 'error' },
        ],
      },
    },
    error: {
      after: { 650: { target: 'idle', actions: 'clear' } },
      on: { RESET: { target: 'idle', actions: 'clear' } },
    },
    solved: {
      on: { RESET: { target: 'idle', actions: 'clear' } },
    },
  },
});
