import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const adventuresDir = join(root, 'adventures');

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'lab'), { recursive: true });

let adventures = [];
try {
  const entries = await readdir(adventuresDir, { withFileTypes: true });
  adventures = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
} catch {
  adventures = [];
}

const shell = ({ title, body }) => `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark light" />
  <title>${title}</title>
  <style>
    :root { font-family: ui-sans-serif, system-ui, sans-serif; color-scheme: dark; background: #0a0b0f; color: #f4f5f7; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; }
    main { width: min(860px, calc(100% - 48px)); }
    a { color: #8dd8ff; }
    code { color: #d5b8ff; }
  </style>
</head>
<body><main>${body}</main></body>
</html>`;

const adventureLinks = adventures.length
  ? `<ul>${adventures.map((slug) => `<li><a href="./${slug}/">${slug}</a></li>`).join('')}</ul>`
  : '<p>Nenhuma adventure implementada ainda.</p>';

await writeFile(join(dist, 'index.html'), shell({
  title: 'ARE — Adventure Rooms Engine',
  body: `<h1>ARE</h1><p>Adventure Rooms Engine — Phase A.</p><p><a href="./lab/">Abrir Lab</a></p><h2>Adventures</h2>${adventureLinks}`,
}));

await writeFile(join(dist, 'lab', 'index.html'), shell({
  title: 'ARE Lab',
  body: '<h1>ARE Lab</h1><p>Shell inicial do laboratório. Os componentes interativos entram nos próximos milestones.</p><p><a href="../">Voltar</a></p>',
}));

for (const slug of adventures) {
  const target = join(dist, slug);
  await mkdir(target, { recursive: true });
  await writeFile(join(target, 'index.html'), shell({
    title: `ARE — ${slug}`,
    body: `<h1>${slug}</h1><p>Adventure module detectado pelo build.</p><p><a href="../">Voltar</a></p>`,
  }));
}

await writeFile(join(dist, '.nojekyll'), '');
console.log(`ARE build assembled: root + lab + ${adventures.length} adventure(s)`);
