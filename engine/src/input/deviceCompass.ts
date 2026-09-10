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

export const COMPASS_HOLD_DURATION_MS = 650;
export const COMPASS_ALIGNMENT_TOLERANCE_DEGREES = 15;

export type CompassOrientationSample = {
  alpha: number | null;
  absolute?: boolean;
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

export type CompassHoldState = {
  target: CompassDirection | null;
  since: number | null;
};

export type CompassHoldUpdate = {
  state: CompassHoldState;
  confirmed: CompassDirection | null;
};

export const EMPTY_COMPASS_HOLD: CompassHoldState = { target: null, since: null };

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
  toleranceDegrees = COMPASS_ALIGNMENT_TOLERANCE_DEGREES,
): boolean {
  return compassHeadingDistance(heading, COMPASS_DIRECTION_HEADINGS[direction]) <= toleranceDegrees;
}

export function updateCompassHold(
  state: CompassHoldState,
  heading: number,
  target: CompassDirection | null,
  timestampMs: number,
  holdDurationMs = COMPASS_HOLD_DURATION_MS,
  toleranceDegrees = COMPASS_ALIGNMENT_TOLERANCE_DEGREES,
): CompassHoldUpdate {
  if (!target || !isHeadingAligned(heading, target, toleranceDegrees)) {
    return { state: EMPTY_COMPASS_HOLD, confirmed: null };
  }

  if (state.target !== target || state.since === null) {
    return { state: { target, since: timestampMs }, confirmed: null };
  }

  if (timestampMs - state.since < holdDurationMs) {
    return { state, confirmed: null };
  }

  return { state: EMPTY_COMPASS_HOLD, confirmed: target };
}

export function headingFromOrientation(
  sample: CompassOrientationSample,
  screenAngle = 0,
): number | null {
  const webkitHeading = sample.webkitCompassHeading;
  const webkitAccuracy = sample.webkitCompassAccuracy;

  if (
    typeof webkitHeading === 'number'
    && Number.isFinite(webkitHeading)
    && webkitHeading >= 0
    && webkitAccuracy !== -1
  ) {
    return normalizeCompassHeading(webkitHeading);
  }

  if (sample.absolute === true && typeof sample.alpha === 'number' && Number.isFinite(sample.alpha)) {
    return normalizeCompassHeading(360 - sample.alpha + screenAngle);
  }

  return null;
}
