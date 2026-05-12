# Components

Components in ASLJS are reusable UI building blocks with a clear DOM-facing
state/update contract.

Components currently appear in two DOM-facing forms plus shared base classes:

- custom elements built around Lit, for example `asljs-list`
- lightweight provider elements built directly on `HTMLElement`, for example
  `asljs-theme-provider`

The component form should follow the runtime need, not a fixed framework rule.

Some components also share a base class when they truly share the same runtime
contract. In `asljs-components`, `AssistedInput` is the shared Lit base for
the on-screen keyboard-style controls.

## Shared structure

Most ASLJS UI components share the same state and interaction principles.

Examples in the current package:

- `asljs-button` expose simple explicit inputs for icon/text button content.
- `AssistedInput` owns the shared `characters` filter plus `key` and `submit`
  event contract for the package's assisted input controls.
- `asljs-keyboard` exposes a fixed QWERTY keyboard surface with a
  `characters` filter and emitted `key`/`submit` events.
- `asljs-letterpad` exposes a fixed alphabetic keypad surface with a
  `characters` filter, a `collapsed` state, and emitted `key`/`submit`
  events.
- `asljs-numpad` exposes a fixed keypad surface with a `characters` filter and
  emitted `key` events.
- `asljs-ai-chat` exposes chat state directly as custom-element properties plus
  `options` configuration.
- `asljs-file` accepts `provider`, `handlers`, and `fileName` as explicit
  inputs.
- `asljs-list` accepts `items`, `context`, and `theme` as explicit inputs.
- `asljs-text-input` accepts `value`, validation, editing mode, and theming as
  explicit inputs while keeping live draft state in an observable status
  object.

Binding/composition connects explicit component state to rendered DOM.

- Prefer declarative binding with `asljs-data-binding` when rendering repeated
  or model-driven DOM.
- Keep interaction flow explicit: DOM event -> property update or emitted event.
- Keep template-driven rendering template-driven. Do not add ad hoc callback
  protocols when a binding context already expresses the relationship.

## Choosing a component form

Use this decision rule.

- If the component needs an HTML tag, property-based configuration, and DOM
  lifecycle hooks, use a custom element.
- If the component mainly provides scoped configuration to descendants, use a
  lightweight provider element.

## General patterns to preserve

These patterns already show up across `asljs-components` and should remain the
default approach for new work.

### Keep state explicit on the component

- The component should expose the mutable state needed for initialization.
- Rendering should consume explicit component properties instead of hidden DOM
  state.
- Serialization and persistence should continue to be explicit and testable.

### Keep component inputs explicit

- Prefer explicit properties or constructor/factory arguments.
- Avoid hidden global state except where the component is specifically a
  provider or theme boundary.
- If the component depends on ambient context, document the fallback order.

### Prefer declarative row/template rendering

For collection rendering, prefer slot or template-based rendering plus a bound
row context.

- Keep row rendering template-driven.
- Keep shared row actions on `context`.
- Pass row-local values through the bound `this` context or row fields rather
  than inventing inline call syntax.

`asljs-list` follows this pattern through `template[data-slot]` and row
bindings that expose `item`, `index`, `first`, `last`, `odd`, `even`, `count`,
and `context`.

`asljs-text-input` follows the same declarative approach for layout override:
its optional `template[data-slot="template"]` can use `asljs-data-binding`
expressions, but must preserve `[data-role="control-host"]` as the insertion
point for the actual control element.

### Keep theme resolution explicit

If a component supports theming, keep the precedence deterministic and local
overrides authoritative.

`asljs-list` currently resolves templates in this order:

- local slot template
- per-component theme
- nearest theme provider
- package default theme

`asljs-text-input` now follows the same precedence for its single template
slot. The default packaged template uses Bootstrap-style form markup, but the
component contract is still template-driven rather than CSS-framework-specific.

### Clean up subscriptions and listeners

Components that subscribe to observable state or DOM events must clean up those
links when detached or replaced.

- Lit custom elements should dispose subscriptions in `disconnectedCallback()`.
- Rebinding logic should tear down previous subscriptions before attaching new
  ones.

## Current `asljs-components` alignment

The current package is aligned with this broader guide.

### `asljs-list`

- Form: Lit custom element
- State surface: `items`, `context`, `theme`
- Rendering model: slot-template and theme-template driven
- Binding: `asljs-data-binding`

### `asljs-file`

- Form: Lit custom element
- State surface: `provider`, `handlers`, `fileName`
- Rendering model: first-matching handler selected from ordered file handlers
- Binding/composition: provider abstraction plus handler-specific rendering

### `asljs-text-input`

- Form: Lit custom element
- State surface: `value`, `label`, `description`, `validator`, `multiline`,
  `enterKeyBehavior`, `autoExtend`, `autoExtendMaxRows`, `theme`
- Rendering model: one control host plus an overridable bound template
- Binding/composition: observable status object plus explicit `input` and
  `change` events carrying draft-state details

### `asljs-button`, `asljs-button-add`, and `asljs-button-delete`

- Form: Lit custom elements
- State surface: `icon`, `text`, `disabled`, `type`
- Rendering model: simple icon-plus-text button content
- Composition rule: specialized variants inherit the base API and set default
  text values plus themed icon fallbacks

### `AssistedInput`

- Form: shared Lit base class, not a standalone custom element
- State surface: `characters`
- Rendering model: concrete subclasses provide layout-specific button grids
- Interaction contract: centralizes `key` and `submit` dispatch plus shared
  button filtering behavior

### `asljs-numpad`

- Form: Lit custom element
- State surface: `characters`
- Rendering model: fixed numeric/operator keypad layout
- Interaction contract: extends `AssistedInput` and emits bubbling `key`
  events with the selected logical key value

### `asljs-keyboard`

- Form: Lit custom element
- State surface: `characters`
- Rendering model: fixed QWERTY keyboard layout
- Interaction contract: extends `AssistedInput` and emits bubbling `key`
  events plus a bubbling `submit` event for Enter

### `asljs-letterpad`

- Form: Lit custom element
- State surface: `characters`, `collapsed`
- Rendering model: fixed alphabetic keypad layout with a collapse toggle
- Interaction contract: extends `AssistedInput` and emits bubbling `key`
  events plus a bubbling `submit` event for Enter

If an application wants Bootstrap icon markup for the add/delete variants,
prefer the shared preset helper instead of repeating theme literals at each
call site.

### `asljs-theme-provider`

- Form: lightweight `HTMLElement` provider
- State surface: `theme`
- Responsibility: provide themed defaults to descendant components

### `asljs-ai-chat`

- Form: Lit custom element
- State surface: explicit chat properties on the element (`messages`,
  `promptDraft`, and related state fields) plus `options`
- Rendering model: custom-element rendering driven directly by those properties
