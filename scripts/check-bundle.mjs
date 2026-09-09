import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const config = JSON.parse(await readFile(join(root, 'bundle-budget.json'), 'utf8'));

async function filesUnder(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(path));
    else if (entry.isFile()) output.push({ path, bytes: (await stat(path)).size });
  }
  return output;
}

function shipped(files) {
  return files.filter((file) => !file.path.endsWith('.map'));
}

function sum(files) {
  return files.reduce((total, file) => total + file.bytes, 0);
}

async function entryBundle(directory) {
  const files = shipped(await filesUnder(directory));
  return sum(files.filter((file) => {
    const relativePath = relative(directory, file.path).replaceAll('\\', '/');
    return relativePath === 'index.html' || relativePath.startsWith('assets/');
  }));
}

const all = shipped(await filesUnder(dist));
const engineFiles = all.filter((file) => basename(file.path).startsWith('are-engine-') && /\.(?:js|css)$/.test(file.path));
const engine = engineFiles.reduce((largest, file) => Math.max(largest, file.bytes), 0);
const siteFiles = all.filter((file) => {
  const relativePath = relative(dist, file.path).replaceAll('\\', '/');
  return relativePath === 'index.html' || relativePath.startsWith('assets/');
});
const values = {
  engine,
  site: sum(siteFiles),
  lab: await entryBundle(join(dist, 'lab')),
  'adventure:echo-station': await entryBundle(join(dist, 'echo-station')),
  total: sum(all),
};

if (values.engine === 0) throw new Error('Engine chunk was not isolated; bundle budget cannot be measured.');

const report = {
  generatedAt: new Date().toISOString(),
  measurement: 'raw deployable bytes; source maps excluded; route alias HTML excluded from entry budgets',
  values,
  budgets: config.budgets,
  softRatio: config.softRatio,
  entries: [],
};
let failed = false;
for (const [name, budget] of Object.entries(config.budgets)) {
  const bytes = values[name];
  if (typeof bytes !== 'number') throw new Error(`No bundle measurement for ${name}.`);
  const ratio = bytes / budget;
  const status = ratio > 1 ? 'fail' : ratio >= config.softRatio ? 'warn' : 'pass';
  report.entries.push({ name, bytes, budget, ratio, status });
  if (status === 'warn') console.warn(`::warning title=Bundle budget::${name} uses ${(ratio * 100).toFixed(1)}% of its budget (${bytes}/${budget} bytes)`);
  if (status === 'fail') {
    console.error(`::error title=Bundle budget::${name} exceeds budget (${bytes}/${budget} bytes)`);
    failed = true;
  }
}

await mkdir(join(root, 'bundle-report'), { recursive: true });
await writeFile(join(root, 'bundle-report', 'bundle-sizes.json'), JSON.stringify(report, null, 2));
console.table(report.entries);
if (failed) process.exitCode = 1;
