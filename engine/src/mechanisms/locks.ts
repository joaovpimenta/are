export type LockValue = string | readonly string[] | readonly boolean[];

export type LockDefinition = {
  id: string;
  kind:
    | 'numeric'
    | 'pattern'
    | 'direction'
    | 'compass'
    | 'colors'
    | 'musical'
    | 'password'
    | 'login'
    | 'switches'
    | 'ordered-switches'
    | 'grid-4x4'
    | 'grid-5x5'
    | 'virtual-geolocation'
    | 'real-geolocation';
  solution: LockValue;
};

export function normalizeLockScalar(value: string): string {
  return value.trim().toLocaleLowerCase('pt-BR');
}

export function matchesLockSolution(input: LockValue, solution: LockValue): boolean {
  if (typeof input === 'string' && typeof solution === 'string') {
    return normalizeLockScalar(input) === normalizeLockScalar(solution);
  }

  if (Array.isArray(input) && Array.isArray(solution)) {
    if (input.length !== solution.length) return false;
    return input.every((value, index) => value === solution[index]);
  }

  return false;
}
