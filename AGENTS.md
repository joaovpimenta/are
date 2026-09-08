# ARE Repository Rules

These rules apply to changes across this repository unless a more specific rule is documented for a subdirectory.

## UI styling

- StyleX is the required styling system for application DOM/UI in the Lab, site shell, engine DOM renderers and adventure UIs.
- Do not replace StyleX layout/component styling with ad-hoc CSS classes, CSS modules, inline presentation styles or duplicated page-specific CSS.
- Global CSS is restricted to document-level reset/base behavior that cannot reasonably live in component StyleX, such as box sizing, root/body sizing and canvas normalization.
- Shared visual structure belongs in reusable StyleX style definitions. Lab subpages must inherit and compose the parent Lab styles instead of copying them.
- Extend or override styles by composing StyleX definitions with `stylex.props(baseStyle, localStyle)`. Put the shared/base style first and the local extension/override after it.
- A subpage or adventure may override or extend only the parts it needs. Prefer partial composition over redeclaring a full style contract.
- Theme values must flow through semantic theme tokens/variables consumed by StyleX. Component behavior must not depend on theme-specific selectors or CSS class names.
- Three.js/R3F materials and shaders remain separate from StyleX, but they should consume the same semantic theme values through the engine theme contract when appropriate.

## Inheritance and extension

- Treat shared engine, Lab, theme and scenario resources as base contracts.
- Prefer inheritance/composition first, then partial override, then local specialization.
- Existing shared behavior and styles should remain available unless an override explicitly replaces them.
- Local extensions must not duplicate a reusable parent implementation when composition can express the same result.
- Override precedence must stay explicit and predictable: local specialization is applied after its shared base.

## Mobile and interaction

- All player-facing and Lab UI must be mobile-friendly by default.
- Do not make essential interactions depend only on mouse hover, mouse wheel, precise pointer movement or desktop-only viewport assumptions.
- Provide touch/pointer alternatives for spatial controls and keep keyboard-accessible controls where a DOM equivalent is practical.
- Interactive targets should remain usable on small screens and avoid horizontal page overflow.
- Responsive variants belong in the same StyleX style system so desktop and mobile presentations share one contract.
- Respect `prefers-reduced-motion`; animation must never be the only way to communicate state.

## Lab pages

- `/lab/` defines the shared Lab shell and base visual language.
- `/lab/<component>/` pages inherit that shell and its shared StyleX styles.
- Component pages may extend or override the base styles through StyleX composition without forking the parent visual system.
- Lab pages should expose component behavior, states, theme/scenario variations, accessibility and override behavior while remaining usable on touch devices.
