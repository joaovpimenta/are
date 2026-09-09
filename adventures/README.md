# Adventures

Each direct child directory must be an Adventure module with a validated manifest. Directories without `adventure.json` fail the build instead of becoming placeholder routes.

Expected shape:

```text
adventures/<slug>/
├─ package.json
├─ src/
├─ index.html
├─ vite.config.ts
├─ adventure.json
└─ src/
   ├─ main.tsx
   ├─ scenario.ts
   └─ local renderers
```

Adventure responsibilities:

- compose engine modules through their focused interfaces;
- define Scene progression and content;
- select a Theme and Scenario;
- provide assets;
- add local renderers only when an Adventure-specific Artifact justifies the seam.

Reusable behavior should move to `engine/` after a second use proves leverage. See `echo-station/` for the smallest complete assembly.
