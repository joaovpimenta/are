# Adventures

Each direct child directory is an adventure module discovered by the build.

Expected shape:

```text
adventures/<slug>/
├─ package.json
├─ src/
├─ assets/
├─ components/
├─ themes/
├─ scenarios/
└─ adventure.ts
```

Adventure responsibilities:

- compose engine capabilities;
- define story/progression and content;
- select theme and scenario;
- provide assets;
- optionally override engine components/themes/scenarios by the same identifier.

Reusable behavior should be promoted to `engine/` instead of being copied between adventures.
