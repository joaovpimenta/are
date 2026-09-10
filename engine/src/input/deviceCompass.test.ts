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
    expect(first.state).toEqual({ target: 'N', since: 1000, lastSampleAt: 1000 });

    const middle = updateCompassHold(first.state, 359, 'N', 1200);
    expect(middle.confirmed).toBeNull();
    expect(middle.state).toEqual({ target: 'N', since: 1000, lastSampleAt: 1200 });

    const late = updateCompassHold(middle.state, 1, 'N', 1450);
    expect(late.confirmed).toBeNull();
    expect(late.state).toEqual({ target: 'N', since: 1000, lastSampleAt: 1450 });

    const confirmed = updateCompassHold(late.state, 1, 'N', 1650);
    expect(confirmed.confirmed).toBe('N');
    expect(confirmed.state).toEqual(EMPTY_COMPASS_HOLD);
  });

  it('resets dwell when the device leaves the target tolerance', () => {
    const first = updateCompassHold(EMPTY_COMPASS_HOLD, 0, 'N', 1000);
    const reset = updateCompassHold(first.state, 45, 'N', 1200);
    expect(reset).toEqual({ state: EMPTY_COMPASS_HOLD, confirmed: null });

    const restarted = updateCompassHold(reset.state, 3, 'N', 1300);
    const middle = updateCompassHold(restarted.state, 2, 'N', 1500);
    const tooSoon = updateCompassHold(middle.state, 2, 'N', 1700);
    expect(tooSoon.confirmed).toBeNull();

    const confirmed = updateCompassHold(tooSoon.state, 1, 'N', 1950);
    expect(confirmed.confirmed).toBe('N');
  });

  it('resets dwell when aligned samples stop arriving continuously', () => {
    const first = updateCompassHold(EMPTY_COMPASS_HOLD, 0, 'N', 1000);
    const second = updateCompassHold(first.state, 1, 'N', 1200);
    const stale = updateCompassHold(second.state, 359, 'N', 1600);

    expect(stale.confirmed).toBeNull();
    expect(stale.state).toEqual({ target: 'N', since: 1600, lastSampleAt: 1600 });

    const resumed = updateCompassHold(stale.state, 0, 'N', 1800);
    const nearlyThere = updateCompassHold(resumed.state, 1, 'N', 2050);
    expect(nearlyThere.confirmed).toBeNull();
    expect(updateCompassHold(nearlyThere.state, 359, 'N', 2250).confirmed).toBe('N');
  });

  it('starts a fresh dwell when the next solution target changes', () => {
    let north = updateCompassHold(EMPTY_COMPASS_HOLD, 0, 'N', 1000);
    north = updateCompassHold(north.state, 0, 'N', 1200);
    north = updateCompassHold(north.state, 0, 'N', 1450);
    const northConfirmed = updateCompassHold(north.state, 0, 'N', 1650);
    expect(northConfirmed.confirmed).toBe('N');

    const northEast = updateCompassHold(northConfirmed.state, 45, 'NE', 1700);
    expect(northEast.state).toEqual({ target: 'NE', since: 1700, lastSampleAt: 1700 });
    const northEastMiddle = updateCompassHold(northEast.state, 45, 'NE', 1900);
    const northEastLate = updateCompassHold(northEastMiddle.state, 45, 'NE', 2150);
    expect(updateCompassHold(northEastLate.state, 45, 'NE', 2350).confirmed).toBe('NE');
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
