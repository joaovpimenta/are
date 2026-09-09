# ADR 0001 Adventure Session Owns Progress

## Status

Accepted

## Context

The first Lab slice stored progress in React state, an XState actor, Zustand and RuntimeContext. Reset and room completion depended on effects that copied facts between those locations. The documented single source of truth rule was therefore not observable in running code.

## Decision

Adventure session is the single owner of cross-mechanism progress, collected artifacts, current scene and completion.

Puzzle mechanisms own their internal transitions. Renderers publish meaningful results to the Adventure session and observe its snapshot. XState may remain inside a mechanism when explicit transitions add value, but its result is published once rather than mirrored by effects. React state is reserved for presentation state that does not affect Adventure progress.

## Consequences

- Completion and reset are testable without mounting a renderer.
- DOM and Three.js renderers can share a puzzle mechanism.
- Persistence can later adapt the Adventure session without changing renderers.
- A renderer cannot declare the Adventure complete by itself.
- Existing global Zustand state is removed from the public engine surface until a real persistence adapter is required.

