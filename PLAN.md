# ARE — Architecture & Implementation Plan

> Status: initial architecture definition  
> Repository model: monorepo  
> Delivery target: GitHub Pages via CI/CD  
> Evolution path: **A — Lab → B — Clean Engine → C — Player Product**

## 1. Vision

ARE is a modular engine for building interactive puzzle/adventure experiences.

The repository is a **monorepo** containing:

- a reusable **engine**;
- reusable **components** such as keypad, dial, inventory and dialogue;
- reusable **themes**;
- reusable **scenarios**;
- a **lab** for testing components, themes, scenarios and overrides;
- multiple **adventures**, each built as an independent subpage;
- a root site that acts as the entry point/catalog.

The initial goal is to use the repository as a **technical laboratory** for experimenting with puzzle mechanisms and refining the API. The architecture should naturally evolve into a clean engine suitable for producing complete player-facing experiences.

---

## 2. Product evolution

### Phase A — Laboratory

Primary goal: experiment rapidly without compromising the architecture needed later.

Focus:

- validate puzzle mechanisms;
- refine component APIs;
- test animation patterns;
- test success/error/state feedback;
- test theme switching;
- test scenarios;
- test adventure-level overrides;
- validate GitHub Pages build/deploy flow.

### Phase B — Clean Engine

Primary goal: stabilize reusable primitives and contracts.

Focus:

- stable component APIs;
- documented events and states;
- predictable composition model;
- explicit override/resolution rules;
- theme and scenario contracts;
- reusable adventure runtime;
- stronger automated tests;
- backwards compatibility expectations.

### Phase C — Player Product

Primary goal: build polished player-facing adventures.

Possible capabilities:

- adventure catalog;
- save/persistence;
- non-linear exploration;
- graph-based progression;
- richer inventory/state interactions;
- audio system;
- cinematic transitions;
- accessibility hardening;
- analytics/telemetry if appropriate;
- production-grade content tooling.

---

## 3. Architectural principles

### 3.1 Adventures compose; the engine provides capabilities

An adventure should normally **use existing engine components** rather than implement its own version.

If a new capability is broadly useful, it should be added or generalized in the engine.

Adventure-specific code is allowed when the behavior is genuinely specific to that adventure, but it should be treated as an exception.

### 3.2 Concrete components are the primary building blocks

The engine exposes concrete reusable components such as:

- keypad;
- dial;
- inventory;
- dialogue;
- sequence input;
- switch/button groups;
- drag-and-drop interactions;
- code locks;
- timers;
- object selectors;
- clue/reveal panels;
- future puzzle mechanisms discovered during experimentation.

### 3.3 Sequential first, non-linear later

The first runtime should make sequential experiences easy:

```text
scene A → scene B → puzzle → scene C → ending
```

The architecture must not prevent future evolution toward a graph/state-driven model:

```text
        ┌→ scene B → puzzle X ┐
scene A ┤                     ├→ scene E
        └→ scene C → scene D ┘
```

### 3.4 Appearance, narrative environment and behavior remain separable

- **Component**: behavior and interaction.
- **Theme**: visual UI identity.
- **Scenario**: narrative/ambient world and assets.
- **Adventure**: composition, story, configuration and overrides.

This separation should remain explicit throughout the repository.

---

## 4. Monorepo structure

Initial target structure:

```text
/
├─ engine/
│  ├─ core/
│  ├─ runtime/
│  ├─ components/
│  │  ├─ keypad/
│  │  ├─ dial/
│  │  ├─ inventory/
│  │  ├─ dialogue/
│  │  └─ ...
│  ├─ themes/
│  │  ├─ default/
│  │  └─ ...
│  ├─ scenarios/
│  │  ├─ default/
│  │  ├─ anos-80/
│  │  └─ ...
│  ├─ styles/
│  └─ package.json
│
├─ adventures/
│  ├─ adventure-x/
│  │  ├─ src/
│  │  ├─ assets/
│  │  ├─ components/
│  │  ├─ themes/
│  │  ├─ scenarios/
│  │  ├─ adventure.js
│  │  └─ package.json
│  └─ ...
│
├─ lab/
│  ├─ src/
│  ├─ component-demos/
│  ├─ theme-demos/
│  ├─ scenario-demos/
│  └─ package.json
│
├─ site/
│  └─ home/
│
├─ scripts/
│  └─ build/
│
├─ .github/
│  └─ workflows/
│     └─ pages.yml
│
├─ package.json
└─ PLAN.md
```

The exact tooling can change during Phase A, but the conceptual boundaries above should remain stable.

---

## 5. Public GitHub Pages structure

The CI/CD pipeline should generate a single deployable tree.

Example:

```text
dist/
├─ index.html
├─ lab/
│  ├─ index.html
│  ├─ keypad/
│  │  └─ index.html
│  ├─ dial/
│  │  └─ index.html
│  ├─ inventory/
│  │  └─ index.html
│  └─ ...
├─ adventure-x/
│  └─ index.html
├─ adventure-y/
│  └─ index.html
└─ assets/
```

Resulting public URLs:

```text
/are/                    → root/catalog
/are/lab/                → engine laboratory
/are/lab/keypad/         → keypad test/reference page
/are/lab/dial/           → dial test/reference page
/are/adventure-x/        → Adventure X
/are/adventure-y/        → Adventure Y
```

The source folder `adventures/` does **not** need to appear in the public URL.

A future `/are/adventures/` route may be added if the catalog grows enough to justify it, but it is not required initially.

---

## 6. Engine component contract

Each component should expose a small, predictable API.

Conceptual example:

```js
const instance = Keypad.mount(target, config, context)

instance.reset()
instance.destroy()
```

Expected responsibilities:

- mount/render itself;
- receive explicit configuration;
- expose/reset its state;
- clean up listeners/resources;
- emit standardized events;
- remain theme-independent at the behavior layer;
- respect accessibility and reduced-motion preferences.

Candidate common events:

```text
ready
change
input
select
success
error
solved
completed
reset
```

Individual components may expose additional events, but common naming conventions should be preferred.

---

## 7. Theme system

A **theme** defines the visual language of the interface.

Examples:

- default;
- terminal;
- neon;
- arcade;
- future themes added by the engine or overridden by an adventure.

Themes should primarily use CSS custom properties/design tokens.

Example token categories:

```css
--bg
--surface
--surface-elevated
--text
--text-muted
--accent
--accent-2
--success
--danger
--warning
--border
--shadow
--radius
--font-ui
--font-display
--motion-fast
--motion-normal
--motion-slow
--ease-out
--glow-color
```

Behavioral JavaScript should not depend on theme-specific CSS implementation details.

---

## 8. Scenario system

A **scenario** represents the narrative/ambient world rather than the base UI style.

Examples:

- anos-80;
- sci-fi;
- noir;
- retro-computer;
- other future settings.

A scenario can provide:

- background art;
- ambient assets;
- sounds;
- object imagery;
- decorative elements;
- vocabulary/content defaults;
- scenario-specific design tokens;
- optional scenario-specific component styling.

Themes and scenarios must remain independently composable.

Example:

```text
scenario: anos-80
theme: arcade
```

or:

```text
scenario: anos-80
theme: terminal
```

---

## 9. Override system

Overrides are a core architectural feature.

An adventure may redeclare an engine resource using the same identifier/path convention.

### 9.1 Component override

Base:

```text
engine/components/keypad/
```

Adventure override:

```text
adventures/adventure-x/components/keypad/
```

When Adventure X resolves `keypad`, the adventure version takes precedence.

### 9.2 Theme override

Base:

```text
engine/themes/neon/
```

Adventure override:

```text
adventures/adventure-x/themes/neon/
```

The adventure should be able to override only the files/tokens it needs rather than duplicate the full theme.

### 9.3 Scenario override

Base:

```text
engine/scenarios/anos-80/
```

Adventure override:

```text
adventures/adventure-x/scenarios/anos-80/
```

Example:

```text
engine/scenarios/anos-80/
├─ background.jpg
├─ sounds/
└─ tokens.css

adventures/adventure-x/scenarios/anos-80/
└─ background.jpg
```

Only `background.jpg` is replaced; the remaining scenario resources fall back to the engine version.

### 9.4 Override philosophy

Overrides should be **partial by default**.

Avoid requiring an adventure to copy an entire component/theme/scenario just to change one asset or token.

### 9.5 Resolution precedence

Initial resolution order:

```text
1. adventure-local override
2. selected scenario contribution
3. selected theme contribution
4. engine component/default
```

This order must be made explicit in implementation and documented with tests.

Where theme and scenario affect different resource categories, the resolver should avoid ambiguous merges and use typed/resource-aware resolution rules.

---

## 10. Adventure structure

An adventure is a module/app inside the monorepo.

Example:

```text
adventures/midnight-terminal/
├─ src/
│  ├─ scenes/
│  ├─ story/
│  └─ main.js
├─ assets/
├─ components/
├─ themes/
├─ scenarios/
├─ adventure.js
└─ package.json
```

Typical adventure responsibilities:

- declare metadata;
- select a base theme;
- select a base scenario;
- define story/scene sequence;
- instantiate engine components;
- react to component events;
- define progression;
- provide content/assets;
- optionally provide local overrides.

Conceptual configuration:

```js
export default {
  id: "midnight-terminal",
  title: "Midnight Terminal",
  theme: "terminal",
  scenario: "anos-80",
  start: "intro",
  scenes: {
    intro: {},
    terminal: {},
    ending: {}
  }
}
```

---

## 11. Runtime progression

### Phase A runtime

Implement a simple sequential navigation contract first.

Conceptual API:

```js
runtime.start("intro")
runtime.goto("terminal")
runtime.next()
```

Components can trigger transitions through events handled by the adventure.

Example:

```js
keypad.on("solved", () => runtime.goto("vault"))
```

### Future runtime

The runtime should later support:

- global adventure state;
- conditions;
- branching;
- backtracking;
- inventory dependencies;
- scene mutation;
- event flags;
- graph-based progression;
- persistence.

The Phase A implementation should avoid coupling scene navigation to DOM assumptions so this migration remains possible.

---

## 12. Lab

`/are/lab/` is the functional reference implementation for the engine.

It serves simultaneously as:

1. interactive component test bench;
2. engine documentation;
3. theme playground;
4. scenario playground;
5. override validation environment;
6. animation/interaction QA environment.

### 12.1 Lab home

The lab home should expose:

- component catalog;
- theme selector;
- scenario selector;
- links to individual component pages;
- current engine version/build information;
- global reduced-motion toggle or detection state for testing;
- debug/reset tools where useful.

### 12.2 Component lab page

Each component page should use a consistent layout containing:

- live interactive demo;
- purpose/description;
- instructions for testing;
- supported configuration;
- supported states;
- emitted events;
- success path;
- error path;
- reset control;
- theme selector;
- scenario selector when applicable;
- animation test controls where applicable;
- accessibility notes;
- override test mode.

Example URLs:

```text
/are/lab/keypad/
/are/lab/dial/
/are/lab/inventory/
/are/lab/dialogue/
```

---

## 13. Animation principles

Animations are a first-class part of the experience, not an afterthought.

Target animation categories:

- smooth state transitions;
- hover/press/focus microinteractions;
- success feedback;
- error feedback;
- reveal animations;
- component manipulation;
- ambient effects;
- scene transitions;
- puzzle completion moments.

Implementation principles:

- prefer `transform` and `opacity` for performant transitions;
- use Web Animations API where orchestration becomes complex;
- keep animation behavior separate from theme identity where possible;
- avoid layout thrashing;
- reserve particles/heavy effects for meaningful moments;
- always respect `prefers-reduced-motion`;
- ensure animation is not the only way state is communicated.

---

## 14. Accessibility baseline

Even during Phase A, components should be built with accessibility as a default constraint.

Minimum expectations:

- keyboard operation where applicable;
- visible focus states;
- semantic HTML;
- labels/accessible names;
- `aria-live` for dynamic puzzle feedback where appropriate;
- sufficient contrast;
- no required information conveyed only by color;
- reduced-motion support;
- sane focus behavior during scene transitions.

---

## 15. Build strategy

The repository should produce **one GitHub Pages artifact**.

Conceptual pipeline:

```text
install dependencies
      ↓
build engine
      ↓
build lab
      ↓
discover adventures/*
      ↓
build each adventure
      ↓
assemble dist/
      ↓
build root catalog
      ↓
validate links/output
      ↓
publish dist/ to GitHub Pages
```

Each adventure is built independently but assembled into the same final artifact.

Adding a new adventure should ideally require only creating a new folder under `adventures/` with valid metadata/configuration.

---

## 16. CI/CD responsibilities

The GitHub Actions workflow should eventually:

- install dependencies with a deterministic lockfile;
- lint source;
- run unit/component tests;
- build the engine;
- build the lab;
- automatically discover adventure packages;
- build all adventures;
- fail on duplicate adventure slugs;
- fail on unresolved component/theme/scenario identifiers;
- assemble a single `dist/` tree;
- validate generated routes;
- upload a GitHub Pages artifact;
- deploy on the configured branch.

Pull requests should run validation/build without deploying production Pages unless explicitly desired.

---

## 17. Root site

`/are/` is initially a lightweight entry point.

Responsibilities:

- identify ARE;
- link to `/are/lab/`;
- list available adventures;
- expose adventure metadata such as title/description/status if useful;
- remain simple during Phase A.

The root can evolve into a richer player-facing catalog during Phase C.

---

## 18. Initial implementation roadmap

### Milestone A0 — Repository foundation

- [ ] Create root workspace/package configuration.
- [ ] Create `engine/` package.
- [ ] Create `adventures/` directory.
- [ ] Create `lab/` app/package.
- [ ] Create `site/` root app/package.
- [ ] Create build scripts directory.
- [ ] Add formatting/lint baseline.
- [ ] Add local development commands.
- [ ] Add initial README with run/build instructions.
- [ ] Add GitHub Pages workflow skeleton.

### Milestone A1 — Engine core

- [ ] Define common component lifecycle contract.
- [ ] Define common event contract.
- [ ] Implement base event emitter/controller.
- [ ] Implement mount/reset/destroy lifecycle.
- [ ] Define runtime context object.
- [ ] Implement sequential scene runtime.
- [ ] Add `start`, `goto` and `next` navigation primitives.
- [ ] Define common state conventions.
- [ ] Add reduced-motion utility.
- [ ] Add common accessibility helpers where useful.

### Milestone A2 — Theme system

- [ ] Define design-token contract.
- [ ] Create default theme.
- [ ] Implement runtime/build-time theme selection strategy.
- [ ] Ensure components consume semantic tokens only.
- [ ] Add theme inheritance/fallback behavior.
- [ ] Add theme override resolver.
- [ ] Add at least one visually distinct alternate theme.
- [ ] Add theme switching to Lab.

### Milestone A3 — Scenario system

- [ ] Define scenario manifest contract.
- [ ] Create default scenario.
- [ ] Create first experimental scenario.
- [ ] Support scenario assets.
- [ ] Support scenario tokens/styles.
- [ ] Define scenario fallback behavior.
- [ ] Add scenario override resolver.
- [ ] Add scenario switching to Lab.
- [ ] Test theme + scenario combinations.

### Milestone A4 — Override resolver

- [ ] Define canonical resource identifiers.
- [ ] Define path/name conventions.
- [ ] Implement adventure-local component override lookup.
- [ ] Implement theme override lookup.
- [ ] Implement scenario override lookup.
- [ ] Implement partial file/token fallback.
- [ ] Document precedence rules in code.
- [ ] Add resolver diagnostics/debug mode.
- [ ] Add conflict detection.
- [ ] Add automated tests for precedence.
- [ ] Add Lab controls/examples demonstrating overrides.

### Milestone A5 — Initial component set

- [ ] Keypad.
- [ ] Dial.
- [ ] Inventory.
- [ ] Dialogue.
- [ ] Sequence input.
- [ ] Button/switch group.
- [ ] Generic reveal/clue component.
- [ ] Generic success/error feedback component.
- [ ] Identify additional mechanisms from experimentation/source material.

For every component:

- [ ] define configuration schema;
- [ ] define states;
- [ ] define emitted events;
- [ ] implement reset;
- [ ] implement destroy/cleanup;
- [ ] implement keyboard behavior where applicable;
- [ ] implement focus behavior;
- [ ] implement success animation;
- [ ] implement error animation;
- [ ] support reduced motion;
- [ ] create Lab page;
- [ ] document testing instructions.

### Milestone A6 — Lab

- [ ] Build `/lab/` home.
- [ ] Auto/list registered components.
- [ ] Create standard component-demo layout.
- [ ] Add theme picker.
- [ ] Add scenario picker.
- [ ] Add reset state control.
- [ ] Add event log/debug console.
- [ ] Add success/error trigger tools where applicable.
- [ ] Add override test mode.
- [ ] Add accessibility test guidance.
- [ ] Add animation/reduced-motion test controls.
- [ ] Ensure each component has a dedicated subpage.

### Milestone A7 — First adventure fixture

Create a small test adventure whose purpose is to exercise the architecture rather than deliver polished content.

- [ ] Create adventure package/folder.
- [ ] Add metadata.
- [ ] Select theme.
- [ ] Select scenario.
- [ ] Create sequential scenes.
- [ ] Use at least three engine components.
- [ ] Navigate based on component events.
- [ ] Add one theme override.
- [ ] Add one scenario override.
- [ ] Add one component override.
- [ ] Validate fallback behavior.
- [ ] Validate direct URL loading on GitHub Pages.

### Milestone A8 — Build & GitHub Pages

- [ ] Discover `adventures/*` automatically.
- [ ] Build root site.
- [ ] Build Lab.
- [ ] Build each adventure independently.
- [ ] Produce `dist/<adventure-slug>/` routes.
- [ ] Produce `dist/lab/` routes.
- [ ] Ensure assets work under `/are/` base path.
- [ ] Add duplicate slug validation.
- [ ] Add missing-resource validation.
- [ ] Add generated-route validation.
- [ ] Configure GitHub Pages artifact upload.
- [ ] Configure deployment job.
- [ ] Validate published URLs.

### Milestone A9 — Refinement toward Phase B

- [ ] Review component APIs after real Lab usage.
- [ ] Remove accidental adventure/engine coupling.
- [ ] Normalize event naming.
- [ ] Normalize component configuration conventions.
- [ ] Normalize animation hooks.
- [ ] Stabilize resolver API.
- [ ] Document public engine API.
- [ ] Add versioning/deprecation policy.
- [ ] Increase automated test coverage.
- [ ] Decide which experimental mechanisms graduate into the stable engine.

---

## 19. Phase B roadmap — Clean Engine

- [ ] Freeze first stable component lifecycle API.
- [ ] Freeze resource resolver contract.
- [ ] Freeze theme contract.
- [ ] Freeze scenario contract.
- [ ] Publish component authoring guidelines.
- [ ] Publish adventure authoring guidelines.
- [ ] Add stronger type/schema validation.
- [ ] Add regression tests for all Lab components.
- [ ] Add visual regression strategy if useful.
- [ ] Add compatibility checks for adventures.
- [ ] Refactor build pipeline into maintainable packages/scripts.
- [ ] Add reusable animation primitives.
- [ ] Add reusable transition primitives.
- [ ] Create at least one complete adventure using only stable APIs.

---

## 20. Phase C roadmap — Player-facing platform

These items are intentionally deferred until the laboratory and engine contracts are stable.

- [ ] Rich adventure catalog.
- [ ] Adventure completion/progress state.
- [ ] Persistent save data.
- [ ] Non-linear scene graph.
- [ ] Conditional transitions.
- [ ] Global inventory/state dependencies.
- [ ] Backtracking and mutated scenes.
- [ ] Audio/music/ambient system.
- [ ] Player settings.
- [ ] Accessibility preferences.
- [ ] Polished loading/scene transitions.
- [ ] Production error handling.
- [ ] Optional analytics/telemetry decisions.
- [ ] Content production workflow.

---

## 21. Decisions intentionally deferred

The following decisions should be made through Lab experimentation rather than prematurely fixed:

- exact frontend/build framework;
- exact package manager/workspace implementation;
- schema validation library;
- whether components use Web Components, plain modules or another abstraction;
- exact state-management approach for non-linear adventures;
- persistence format;
- audio architecture;
- final player-facing catalog UX;
- visual regression tooling.

The architecture should prefer standard browser primitives and low coupling so these choices remain replaceable.

---

## 22. Definition of success for Phase A

Phase A is successful when:

- `/are/` lists the Lab and available adventure fixtures;
- `/are/lab/` provides a useful interactive component catalog;
- components can be tested independently;
- multiple themes can be switched without behavioral changes;
- multiple scenarios can be tested independently from themes;
- adventure-local partial overrides work predictably;
- a sequential adventure can compose engine components without copying their implementation;
- adding an adventure does not require manually rewriting the deployment workflow;
- CI/CD builds the monorepo into one GitHub Pages artifact;
- animations are polished while respecting reduced motion;
- the team can use Lab feedback to decide which APIs are ready to graduate into Phase B.

---

## 23. Core rule to preserve

> **If a behavior is reusable, improve the engine. If content or presentation is adventure-specific, keep it in the adventure. Overrides customize the base without forcing duplication. The Lab is the proving ground for every reusable capability before it becomes stable.**
