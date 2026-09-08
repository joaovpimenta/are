# ARE — Adventure Rooms Engine

ARE is a monorepo for building interactive puzzle/adventure experiences for the web.

The project starts as an engine laboratory and is designed to evolve into a reusable adventure engine and, later, a player-facing platform.

## Stack

- TypeScript
- React + Vite
- StyleX
- Three.js + React Three Fiber
- Drei where useful
- Zustand for simple shared/session state
- XState for explicit behavioral state machines
- Vitest + React Testing Library
- Playwright for E2E and visual regression

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for responsibility boundaries and [`PLAN.md`](PLAN.md) for the broader roadmap.

## Workspace

```text
engine/       reusable engine, puzzles, runtime and renderers
adventures/   adventure modules discovered by the build
lab/          interactive component/regression laboratory
site/         root catalog shell
scripts/      monorepo build/validation tooling
```

## Commands

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The initial build assembles a GitHub Pages-ready `dist/` containing `/`, `/lab/`, and one route for every directory found under `adventures/`.

## CI/CD

`.github/workflows/ci-pages.yml` separates the pipeline into:

1. **Quality** — lint, typecheck and unit/component tests.
2. **Build** — assemble the single Pages artifact.
3. **Deploy** — deploy `dist/` to the `github-pages` environment on non-PR runs.

Pull requests validate/build without deploying production Pages.
