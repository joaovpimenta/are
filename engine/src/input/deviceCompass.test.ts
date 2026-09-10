import { describe, expect, it } from 'vitest';
import {
  EMPTY_COMPASS_HOLD,
  compassDirectionForHeading,
  compassHeadingDistance,
  headingFromOrientation,
  isHeadingAligned,
  normalizeCompassHeading,
  updateCompassHold,
} from './deviceCompass';

describe('device compass helpers', () => {
  it('normalizes headings around 0/360', () => {
    expect(normalizeCompassHeading(360)).toBe(0);
    expect(normalizeCompassHeading(-45)).toBe(315);
    expect(normalizeCompassHeading(725)).toBe(5);
  });

  it('maps headings to the nearest one of eight compass directions', () => {
    expect(compassDirectionForHeading(0)).toBe('N');
    expect(compassDirectionForHeading(44)).toBe('NE');
    expect(compassDirectionForHeading(91)).toBe('E');
    expect(compassDirectionForHeading(181)).toBe('S');
    expect(compassDirectionForHeading(316)).toBe('NO');
  });

  it('uses the shortest angular distance across north', () => {
    expect(compassHeadingDistance(355, 5)).toBe(10);
    expect(isHeadingAligned(351, 'N', 10)).toBe(true);
    expect(isHeadingAligned(344, 'N', 10)).toBe(false);
  });

  it('confirms only after the target remains continuously aligned', () => {
    const first = updateCompassHold(EMPTY_COMPASS_HOLD, 2, 'N', 1000);
    expect(first.confirmed).toBeNull();
    expect(first.state).toEqual({ target: 'N', since: 1000 });

    const early = updateCompassHold(first.state, 359, 'N', 1500);
    expect(early.confirmed).toBeNull();
    expect(early.state).toEqual({ target: 'N', since: 1000 });

    const confirmed = updateCompassHold(early.state, 1, 'N', 1650);
    expect(confirmed.confirmed).toBe('N');
    expect(confirmed.state).toEqual(EMPTY_COMPASS_HOLD);
  });

  it('resets dwell when the device leaves the target tolerance', () => {
    const first = updateCompassHold(EMPTY_COMPASS_HOLD, 0, 'N', 1000);
    const reset = updateCompassHold(first.state, 45, 'N', 1400);
    expect(reset).toEqual({ state: EMPTY_COMPASS_HOLD, confirmed: null });

    const restarted = updateCompassHold(reset.state, 3, 'N', 1500);
    const tooSoon = updateCompassHold(restarted.state, 2, 'N', 2000);
    expect(tooSoon.confirmed).toBeNull();

    const confirmed = updateCompassHold(tooSoon.state, 1, 'N', 2150);
    expect(confirmed.confirmed).toBe('N');
  });

  it('starts a fresh dwell when the next solution target changes', () => {
    const north = updateCompassHold(EMPTY_COMPASS_HOLD, 0, 'N', 1000);
    const northConfirmed = updateCompassHold(north.state, 0, 'N', 1650);
    expect(northConfirmed.confirmed).toBe('N');

    const northEast = updateCompassHold(northConfirmed.state, 45, 'NE', 1700);
    expect(northEast.state).toEqual({ target: 'NE', since: 1700 });
    expect(updateCompassHold(northEast.state, 45, 'NE', 2350).confirmed).toBe('NE');
  });

  it('prefers WebKit magnetic compass heading when available', () => {
    expect(headingFromOrientation({
      alpha: 220,
      absolute: false,
      webkitCompassHeading: 91,
      webkitCompassAccuracy: 8,
    })).toBe(91);
  });

  it('rejects an uncalibrated WebKit compass', () => {
    expect(headingFromOrientation({
      alpha: 12,
      absolute: false,
      webkitCompassHeading: 48,
      webkitCompassAccuracy: -1,
    })).toBeNull();
  });

  it('converts absolute alpha and compensates for screen orientation', () => {
    expect(headingFromOrientation({ alpha: 270, absolute: true })).toBe(90);
    expect(headingFromOrientation({ alpha: 270, absolute: true }, 90)).toBe(180);
  });

  it('does not treat relative alpha as a magnetic heading', () => {
    expect(headingFromOrientation({ alpha: 90, absolute: false })).toBeNull();
  });
});
