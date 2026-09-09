# ADR 0003 Manifest-driven Build and Lazy Routes

## Status

Accepted

## Context

The build treated every directory under `adventures/` as a deployable Adventure and generated placeholders. Lab subpaths existed only as client-side guesses. Importing the engine barrel also pulled Three.js into the initial interface.

## Decision

Every deployable Adventure has a validated `adventure.json` manifest and an independently built workspace package. The build discovers manifests, assembles their real output, materializes direct Lab route documents and validates relative asset references.

Lab routes and spatial Adventure scenes are lazy modules. Consumers use focused engine exports so the Three.js seam is loaded only when a spatial renderer is requested.

## Consequences

- A directory cannot silently become a broken public route.
- Direct GitHub Pages URLs work without server rewrites.
- The catalog is generated from trusted metadata.
- Initial Lab and Adventure interfaces no longer include the Three.js payload.
