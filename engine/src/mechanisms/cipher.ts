export type CipherState = {
  values: readonly number[];
  solved: boolean;
};

export function createCipherState(rotors: number): CipherState {
  if (rotors < 1) throw new Error('Cipher requires at least one rotor.');
  return { values: Array.from({ length: rotors }, () => 0), solved: false };
}

export function stepCipherRotor(
  state: CipherState,
  rotor: number,
  direction: number,
  solution: readonly number[],
  symbolsPerRotor = 10,
): CipherState {
  if (state.solved || rotor < 0 || rotor >= state.values.length) return state;
  const values = state.values.map((value, index) => index === rotor
    ? ((value + Math.sign(direction)) % symbolsPerRotor + symbolsPerRotor) % symbolsPerRotor
    : value);
  return {
    values,
    solved: values.length === solution.length && values.every((value, index) => value === solution[index]),
  };
}

