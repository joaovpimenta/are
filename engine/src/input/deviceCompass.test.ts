import { describe, expect, it } from 'vitest';
import {
  compassDirectionForHeading,
  compassHeadingDistance,
  headingFromOrientation,
  isHeadingAligned,
  normalizeCompassHeading,
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
