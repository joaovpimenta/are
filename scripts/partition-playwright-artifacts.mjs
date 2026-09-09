import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { basename, join } from 'node:path';

const source = join(process.cwd(), 'test-results');
const target = join(process.cwd(), 'interaction-artifacts');
const groups = [
  ['keypad', /keypad/i],
  ['dial', /dial|raycast/i],
  ['tuner', /tuner|signal/i],
  ['lever', /lever/i],
  ['cipher', /cipher|rotor/i],
  ['locks', /lock/i],
  ['scroll', /scroll|overflow|navigation/i],
  ['accessibility', /keyboard|reduced.motion|accessib/i],
];

await rm(target, { recursive: true, force: true });

let entries = [];
try {
  entries = await readdir(source, { withFileTypes: true });
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

for (const entry of entries) {
  const name = basename(entry.name);
  const matches = groups.filter(([, pattern]) => pattern.test(name));
  for (const [group] of matches) {
    const directory = join(target, group);
    await mkdir(directory, { recursive: true });
    await cp(join(source, entry.name), join(directory, entry.name), { recursive: true });
  }
}

console.log(`Partitioned ${entries.length} Playwright result entries into ${groups.length} puzzle/gesture groups.`);
