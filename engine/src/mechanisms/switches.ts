export function createSwitchValues(solution: readonly boolean[]): readonly boolean[] {
  return solution.map(() => false);
}

export function toggleSwitch(values: readonly boolean[], index: number): readonly boolean[] {
  if (index < 0 || index >= values.length) return values;
  return values.map((value, position) => position === index ? !value : value);
}

export function matchesSwitchSolution(values: readonly boolean[], solution: readonly boolean[]): boolean {
  return values.length === solution.length
    && values.every((value, position) => value === solution[position]);
}

