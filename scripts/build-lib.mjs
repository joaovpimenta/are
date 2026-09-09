import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const adventureIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateAdventureManifest(value, source = 'adventure.json') {
  if (!value || typeof value !== 'object') throw new Error(`${source}: expected an object.`);
  for (const field of ['id', 'title', 'description', 'package', 'entry']) {
    if (typeof value[field] !== 'string' || !value[field].trim()) {
      throw new Error(`${source}: ${field} must be a non-empty string.`);
    }
  }
  if (!adventureIdPattern.test(value.id)) {
    throw new Error(`${source}: id must be a lowercase kebab-case slug.`);
  }
  return Object.freeze({
    id: value.id,
    title: value.title.trim(),
    description: value.description.trim(),
    package: value.package.trim(),
    entry: value.entry.trim(),
  });
}

export async function discoverAdventures(adventuresDir) {
  let entries;
  try {
    entries = await readdir(adventuresDir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }

  const manifests = [];
  for (const entry of entries.filter((candidate) => candidate.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const manifestPath = join(adventuresDir, entry.name, 'adventure.json');
    let raw;
    try {
      raw = await readFile(manifestPath, 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') throw new Error(`${entry.name}: adventure.json is required.`, { cause: error });
      throw error;
    }
    const manifest = validateAdventureManifest(JSON.parse(raw), manifestPath);
    if (manifest.id !== entry.name) throw new Error(`${manifestPath}: id must match directory name ${entry.name}.`);
    manifests.push({ ...manifest, directory: join(adventuresDir, entry.name) });
  }

  const ids = new Set();
  const packages = new Set();
  for (const manifest of manifests) {
    if (ids.has(manifest.id)) throw new Error(`Duplicate adventure id: ${manifest.id}`);
    if (packages.has(manifest.package)) throw new Error(`Duplicate adventure package: ${manifest.package}`);
    ids.add(manifest.id);
    packages.add(manifest.package);
  }
  return manifests;
}

export function labRouteIndex(indexHtml) {
  return indexHtml.replaceAll('./assets/', '../assets/');
}

export async function validateRelativeAssets(html, directory) {
  const references = [...html.matchAll(/(?:src|href)="([^"#?]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => reference.startsWith('./') || reference.startsWith('../'));
  for (const reference of references) {
    if (reference.endsWith('/')) continue;
    try {
      await readFile(join(directory, reference));
    } catch (error) {
      throw new Error(`Missing built asset referenced by ${basename(directory)}/index.html: ${reference}`, { cause: error });
    }
  }
}

export async function assembleBuild(root) {
  const dist = join(root, 'dist');
  const build = join(root, 'build');
  const adventures = await discoverAdventures(join(root, 'adventures'));
  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

  await rm(dist, { recursive: true, force: true });
  await rm(build, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  const catalog = adventures.map(({ id, title, description }) => ({ id, title, description }));
  execFileSync(pnpm, ['--filter', '@are/site', 'build'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ARE_ADVENTURE_CATALOG: JSON.stringify(catalog) },
  });
  execFileSync(pnpm, ['--filter', '@are/lab', 'build'], { cwd: root, stdio: 'inherit' });
  for (const adventure of adventures) {
    execFileSync(pnpm, ['--filter', adventure.package, 'build'], { cwd: root, stdio: 'inherit' });
    const source = join(build, 'adventures', adventure.id);
    const target = join(dist, adventure.id);
    await cp(source, target, { recursive: true });
    const html = await readFile(join(target, 'index.html'), 'utf8');
    await validateRelativeAssets(html, target);
  }

  const labIndexPath = join(dist, 'lab', 'index.html');
  const labIndex = await readFile(labIndexPath, 'utf8');
  await validateRelativeAssets(labIndex, join(dist, 'lab'));
  const routeIds = JSON.parse(await readFile(join(root, 'lab', 'routes.json'), 'utf8'));
  for (const routeId of routeIds) {
    if (!adventureIdPattern.test(routeId)) throw new Error(`Invalid Lab route id: ${routeId}`);
    const routeDirectory = join(dist, 'lab', routeId);
    await mkdir(routeDirectory, { recursive: true });
    const nestedIndex = labRouteIndex(labIndex);
    await writeFile(join(routeDirectory, 'index.html'), nestedIndex);
    await validateRelativeAssets(nestedIndex, routeDirectory);
  }

  const catalogIndex = await readFile(join(dist, 'index.html'), 'utf8');
  await validateRelativeAssets(catalogIndex, dist);
  await writeFile(join(dist, '.nojekyll'), '');
  console.log(`ARE build assembled: StyleX catalog + ${routeIds.length} Lab routes + ${adventures.length} adventure(s)`);
}
