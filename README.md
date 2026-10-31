# ARE — Adventure Rooms Engine

ARE is a TypeScript monorepo for diegetic puzzle Adventures on the web. It now includes a reusable engine, an interactive Lab and the playable **Echo Station** Adventure.

Echo Station keeps the current scene, solved mechanisms, collected evidence and partial radio/rotor inputs in this browser. Players can revisit unlocked scenes, consult the recorded transmission, request progressive hints and return to the Adventure gallery. Restarting asks for confirmation before clearing progress. Touch-friendly DOM controls remain available when WebGL is unavailable.

Session persistence is opt-in through `createAdventureSession({ ..., persistence: { storage: window.localStorage } })`. `MECHANISM_INPUT_CHANGED` stores a mechanism's scalar or flat-array input alongside session progress. Checkpoints are versioned and scoped to the Adventure and its required mechanisms; invalid or unavailable storage falls back to an in-memory session.

## What is implemented

- `AdventureSession` as the single owner of progress, inventory, Scene and completion;
- deterministic Dial, Sequence, Switch, Cipher and Dialogue mechanisms with tests;
- DOM and Three.js renderer seams backed by semantic Theme adapters;
- refined Keypad and Dial artifacts plus new Signal Tuner, Lever Console and Cipher Rotor artifacts;
- touch, pointer, keyboard and reduced-motion paths for mobile and desktop;
- one lazy Lab route per mechanism, direct-link output for GitHub Pages and persistent session telemetry;
- manifest-driven Adventure discovery and real output assembly;
- pinned pnpm toolchain, lockfile, lint, typecheck, Vitest, React Testing Library and Playwright regression.

## Workspace

```text
engine/                  deep reusable modules and renderers
lab/                     interactive test harness
adventures/echo-station/ first playable Adventure
scripts/                 deterministic build assembly
docs/adr/                accepted architecture decisions
```

Read [CONTEXT.md](CONTEXT.md) for domain language and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the module, interface, depth, seam, adapter, leverage and locality model.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm quality
```

`pnpm build` creates a GitHub Pages-ready `dist/` with the catalog, direct Lab routes and every validated Adventure manifest. Pull requests run validation and Chromium regression; `main` additionally deploys the assembled artifact.
