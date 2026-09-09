export type LockValue = string | readonly string[] | readonly boolean[];

export type LockLocation = {
  latitude: number;
  longitude: number;
  toleranceMeters: number;
};

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
  columns?: number;
  options?: readonly string[];
  location?: LockLocation;
  allowLocationSimulation?: boolean;
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

function parseCoordinates(value: LockValue): readonly [number, number] | null {
  if (typeof value !== 'string') return null;
  const [latitude, longitude, ...rest] = value.split(',').map((part) => Number(part.trim()));
  if (rest.length > 0 || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return [latitude, longitude];
}

function distanceInMeters(
  from: readonly [number, number],
  to: readonly [number, number],
): number {
  const earthRadius = 6_371_000;
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(to[0] - from[0]);
  const longitudeDelta = radians(to[1] - from[1]);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(from[0])) * Math.cos(radians(to[0]))
    * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function matchesLockInput(definition: LockDefinition, input: LockValue): boolean {
  if (definition.kind === 'switches' && Array.isArray(input) && Array.isArray(definition.solution)) {
    const selected = new Set(input);
    const expected = new Set(definition.solution);
    return selected.size === expected.size && [...selected].every((value) => expected.has(value));
  }

  if (definition.kind === 'virtual-geolocation' || definition.kind === 'real-geolocation') {
    const selected = parseCoordinates(input);
    const target = definition.location
      ? [definition.location.latitude, definition.location.longitude] as const
      : parseCoordinates(definition.solution);
    if (!selected || !target) return false;
    return distanceInMeters(selected, target) <= (definition.location?.toleranceMeters ?? 50);
  }

  return matchesLockSolution(input, definition.solution);
}
