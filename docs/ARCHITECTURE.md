# ARE Technical Architecture

## Stack

- TypeScript
- React
- Vite
- StyleX
- Three.js
- React Three Fiber
- Drei when it removes meaningful boilerplate
- Zustand
- XState
- Vitest
- React Testing Library
- Playwright

## Responsibility boundaries

### React

React owns application composition, DOM UI, lifecycle integration and the Lab/adventure shells.

### Three.js / React Three Fiber

Three owns spatial rendering and interaction: scenes, cameras, lights, models, materials, particles and 3D objects. React Three Fiber is the preferred React integration layer.

### StyleX

StyleX owns DOM/UI styling, semantic design tokens, component variants and themeable presentation. Three.js materials and shaders must not depend on StyleX classes. Both renderers may consume the same semantic theme values through adapters.

### Zustand

Zustand owns simple shared/session state that needs to be read across otherwise unrelated parts of an adventure.

Typical examples:

- inventory;
- discovered clues;
- persistent/global flags;
- player settings;
- selected theme/scenario;
- save/progress data.

Zustand must not duplicate state owned by an XState machine.

### XState

XState owns behavior that benefits from explicit states, events, guards and transitions.

Typical examples:

- puzzle lifecycle;
- keypad/dial/safe behavior;
- dialogue flow;
- doors and mechanisms;
- scene/adventure progression where transitions are meaningful.

### Single source of truth rule

A piece of state has one owner. If XState owns `keypad = solved`, Zustand stores only the global consequence when needed, such as `vaultOpened = true`.

## Engine model

The engine separates logic from presentation.

```text
puzzle logic / machine
        |
        +-- DOM renderer (React + StyleX)
        |
        +-- 3D renderer (R3F + Three.js)
```

A puzzle must not require a specific renderer unless its mechanics are inherently spatial.

## Monorepo namespaces

```text
engine/
  core/
  runtime/
  puzzles/
  components/
  renderers/
    dom/
    three/
  themes/
  scenarios/
  styles/

adventures/
  <adventure>/
    src/
    assets/
    components/
    themes/
    scenarios/

lab/
site/
scripts/
```

## Resource resolution

Resolution is namespace-aware.

### Components

1. adventure-local component with the same identifier;
2. engine component.

### Themes

1. adventure-local selected-theme override;
2. engine selected theme;
3. engine default theme values.

### Scenarios

1. adventure-local selected-scenario override;
2. engine selected scenario;
3. engine default scenario resources.

Theme and scenario are orthogonal. Final presentation composition is explicit rather than relying on a single ambiguous global precedence list.

## Lab contract

Every reusable engine component should eventually have a deterministic Lab route under `/lab/<component>/` with:

- interactive demo;
- configuration controls;
- known states;
- emitted events;
- success/error/reset actions;
- theme selection;
- scenario selection where relevant;
- DOM/3D renderer selection where relevant;
- reduced-motion testing;
- override testing;
- accessibility notes.

The Lab is both documentation and the primary regression surface.

## Regression strategy

### Vitest

Use for engine logic, resolver behavior, Zustand stores, XState machines and pure puzzle rules.

### React Testing Library

Use for DOM component behavior, accessibility semantics and React integration.

### Playwright

Use for end-to-end flows and visual regression across the Lab and adventures.

For Three.js screenshot regression, tests must control viewport, DPR, camera, random seeds, assets and animation time to avoid noisy snapshots.

Do not test the full Cartesian product of renderer x theme x scenario x state. Maintain a required baseline matrix plus targeted cases for important combinations.

## CI/CD model

Pull requests run validation and build without production deployment.

`main` runs:

```text
quality
  lint
  typecheck
  unit/component tests
      |
      v
build
  assemble dist/
  configure Pages
  upload artifact
      |
      v
deploy
  GitHub Pages environment
```

A single Pages artifact contains the root site, Lab and all discovered adventures.
