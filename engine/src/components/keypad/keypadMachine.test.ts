import { createActor } from 'xstate';
import { describe, expect, it } from 'vitest';
import { createKeypadMachine } from './keypadMachine';

describe('keypad machine', () => {
  it('solves with the configured code', () => {
    const actor = createActor(createKeypadMachine('1984')).start();

    for (const digit of ['1', '9', '8', '4']) actor.send({ type: 'PRESS', digit });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('solved');
    expect(actor.getSnapshot().context.value).toBe('1984');
  });

  it('enters error for an incorrect code', () => {
    const actor = createActor(createKeypadMachine('1984')).start();

    for (const digit of ['1', '1', '1', '1']) actor.send({ type: 'PRESS', digit });
    actor.send({ type: 'SUBMIT' });

    expect(actor.getSnapshot().value).toBe('error');
  });
});
