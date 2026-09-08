import { execFileSync } from 'node:child_process';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const adventuresDir = join(root, 'adventures');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
execFileSync(pnpm, ['--filter', '@are/lab', 'build'], { cwd: root, stdio: 'inherit' });

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
  <meta name="color-scheme" content="dark" />
  <title>${title}</title>
  <style>
    :root { font-family: ui-sans-serif, system-ui, sans-serif; color-scheme: dark; background: #070a0f; color: #f4f5f7; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: radial-gradient(circle at 50% 20%, #102638, #070a0f 48%); }
    main { width: min(860px, calc(100% - 48px)); }
    h1 { font-size: clamp(44px, 9vw, 88px); letter-spacing: -4px; margin-bottom: 12px; }
    a { color: #8dd8ff; }
    .cta { display: inline-block; margin-top: 18px; padding: 12px 16px; border: 1px solid #1f596d; border-radius: 12px; text-decoration: none; background: #0e1a24; }
  </style>
</head>
<body><main>${body}</main></body>
</html>`;

const adventureLinks = adventures.length
  ? `<ul>${adventures.map((slug) => `<li><a href="./${slug}/">${slug}</a></li>`).join('')}</ul>`
  : '<p>Nenhuma adventure implementada ainda.</p>';

await writeFile(join(dist, 'index.html'), shell({
  title: 'ARE — Adventure Rooms Engine',
  body: `<p>ADVENTURE ROOMS ENGINE</p><h1>ARE</h1><p>Engine modular de puzzles e experiências interativas.</p><a class="cta" href="./lab/">Abrir Component Lab →</a><h2>Adventures</h2>${adventureLinks}`,
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
console.log(`ARE build assembled: root + compiled lab + ${adventures.length} adventure(s)`);
