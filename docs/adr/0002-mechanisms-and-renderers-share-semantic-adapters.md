# ADR 0002 Mechanisms and Renderers Share Semantic Adapters

## Status

Accepted

## Context

Puzzle rules previously lived inside individual renderers, so tests exercised extracted helpers while integration defects remained hidden in callbacks. DOM and Three.js presentations also translated theme values independently.

## Decision

A puzzle mechanism owns deterministic transitions and has no rendering dependency. A DOM or Three.js renderer adapts player input to that mechanism. The mechanism result is the interface published to the Adventure session.

Theme is semantic. `toObjectThemeStyle`, `toLabThemeStyle` and `toThreeTheme` are explicit adapters from one Theme to each rendering environment. Two real adapters justify this seam.

## Consequences

- Mechanism tests use the same interface as renderers.
- DOM fallbacks and Three.js artifacts stay behaviorally equivalent.
- Theme additions fail at one typed translation point.
- Renderer-only state remains local and does not leak into the Adventure session.
