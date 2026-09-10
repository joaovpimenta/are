export const COMPASS_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] as const;

export type CompassDirection = (typeof COMPASS_DIRECTIONS)[number];

export const COMPASS_DIRECTION_HEADINGS: Record<CompassDirection, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SO: 225,
  O: 270,
  NO: 315,
};

export type CompassOrientationSample = {
  alpha: number | null;
  absolute?: boolean;
  eventType?: string;
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

export function normalizeCompassHeading(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function compassHeadingDistance(from: number, to: number): number {
  const delta = Math.abs(normalizeCompassHeading(from) - normalizeCompassHeading(to));
  return Math.min(delta, 360 - delta);
}

export function compassDirectionForHeading(heading: number): CompassDirection {
  const index = Math.floor((normalizeCompassHeading(heading) + 22.5) / 45) % COMPASS_DIRECTIONS.length;
  return COMPASS_DIRECTIONS[index];
}

export function isCompassDirection(value: string): value is CompassDirection {
  return (COMPASS_DIRECTIONS as readonly string[]).includes(value);
}

export function isHeadingAligned(
  heading: number,
  direction: CompassDirection,
  toleranceDegrees = 15,
): boolean {
  return compassHeadingDistance(heading, COMPASS_DIRECTION_HEADINGS[direction]) <= toleranceDegrees;
}

export function headingFromOrientation(
  sample: CompassOrientationSample,
  screenAngle = 0,
): number | null {
  const webkitHeading = sample.webkitCompassHeading;
  const webkitAccuracy = sample.webkitCompassAccuracy;

  if (
    (sample.absolute === true || sample.eventType === 'deviceorientationabsolute')
    && typeof sample.alpha === 'number'
    && Number.isFinite(sample.alpha)
  ) {
    return normalizeCompassHeading(360 - sample.alpha + screenAngle);
  }

  if (
    typeof webkitHeading === 'number'
    && Number.isFinite(webkitHeading)
    && webkitHeading >= 0
    && webkitAccuracy !== -1
  ) {
    return normalizeCompassHeading(webkitHeading);
  }

  return null;
}
