export type DialRange = {
  min: number;
  max: number;
};

function span({ min, max }: DialRange): number {
  const size = Math.trunc(max) - Math.trunc(min) + 1;
  if (!Number.isFinite(size) || size < 2) throw new Error('Dial range must contain at least two integer values.');
  return size;
}

export function normalizeDialValue(value: number, range: DialRange): number {
  const size = span(range);
  const integer = Math.round(value);
  return ((integer - range.min) % size + size) % size + range.min;
}

export function stepDialValue(value: number, direction: number, range: DialRange): number {
  if (direction === 0) return normalizeDialValue(value, range);
  return normalizeDialValue(value + Math.sign(direction), range);
}

export function dialRotation(value: number, range: DialRange): number {
  return -(normalizeDialValue(value, range) - range.min) * ((Math.PI * 2) / span(range));
}

export function dialValueFromClockPoint(x: number, y: number, range: DialRange): number {
  const clockwiseAngle = (Math.atan2(x, y) + Math.PI * 2) % (Math.PI * 2);
  const index = Math.round(clockwiseAngle / ((Math.PI * 2) / span(range))) % span(range);
  return range.min + index;
}

