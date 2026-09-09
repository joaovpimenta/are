import { describe, expect, it } from 'vitest';
import routeIds from '../routes.json';
import { LAB_ENTRIES, LAB_REQUIRED_MECHANISMS, labRouteHref, parseLabRoute } from './model';

describe('Lab route model', () => {
  it('keeps required mechanism ids unique and represented in the catalog', () => {
    expect(new Set(LAB_REQUIRED_MECHANISMS).size).toBe(LAB_REQUIRED_MECHANISMS.length);
    expect(LAB_REQUIRED_MECHANISMS.every((id) => LAB_ENTRIES.some((entry) => entry.id === id))).toBe(true);
    expect(routeIds).toEqual(LAB_ENTRIES.map((entry) => entry.id));
  });

  it('parses direct routes under a repository base path', () => {
    expect(parseLabRoute('/are/lab/tuner/')).toBe('tuner');
    expect(parseLabRoute('/are/lab/not-real/')).toBe('overview');
    expect(labRouteHref('cipher', '/are/lab/tuner/')).toBe('/are/lab/cipher/');
  });
});
