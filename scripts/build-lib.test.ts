import { describe, expect, it } from 'vitest';
import { labRouteIndex, validateAdventureManifest } from './build-lib.mjs';

describe('build assembly', () => {
  it('validates and normalizes an Adventure manifest', () => {
    expect(validateAdventureManifest({
      id: 'echo-station',
      title: ' Echo Station ',
      description: ' Restores a carrier. ',
      package: '@are/adventure-echo-station',
      entry: 'src/main.tsx',
    })).toMatchObject({ title: 'Echo Station', description: 'Restores a carrier.' });
  });

  it('rejects ids that cannot become stable routes', () => {
    expect(() => validateAdventureManifest({ id: '../escape', title: 'x', description: 'x', package: 'x', entry: 'x' }))
      .toThrow(/kebab-case/);
  });

  it('rewrites Lab assets for direct nested routes', () => {
    expect(labRouteIndex('<script src="./assets/app.js"></script>'))
      .toBe('<script src="../assets/app.js"></script>');
  });

  it('requires all catalog fields before assembly', () => {
    expect(() => validateAdventureManifest({ id: 'safe', title: 'Safe' }))
      .toThrow(/description/);
  });
});
