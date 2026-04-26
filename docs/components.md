# Components

Components in ASLJS are reusable UI building blocks with a clear rendering
surface and a clear state/update contract.

The simplest mental model is still:

- model: state and operations that drive the UI
- view: DOM or custom-element surface that renders the state
- binding/composition: code that keeps the view in sync with the model and
  routes user interaction back into the model

That model is intentionally broader than "Lit custom element". In ASLJS,
components currently appear in two DOM-facing forms plus shared base classes:

- custom elements built around Lit, for example `asljs-list`
- lightweight provider elements built directly on `HTMLElement`, for example
  `asljs-theme-provider`

The component form should follow the runtime need, not a fixed framework rule.

Some components also share a base class when they truly share the same runtime
contract. In `asljs-components`, `AssistedInput` is the shared Lit base for
the on-screen keyboard-style controls.

## Shared structure

Most ASLJS UI components still share the same responsibilities.

### Model

The model owns mutable state and the operations that change it.

- Prefer explicit state and methods over hidden DOM-derived state.
- Use ASLJS primitives such as `observable` and `eventful` when the component
  needs reactivity or emitted events.
- Keep rendering details out of the model.

Examples in the current package:

- `asljs-button`, `asljs-button-add`, and `asljs-button-delete` expose simple
  explicit inputs for icon/text button content.
- `AssistedInput` owns the shared `characters` filter plus `key` and `submit`
  event contract for the package's assisted input controls.
- `asljs-keyboard` exposes a fixed QWERTY keyboard surface with a
  `characters` filter and emitted `key`/`submit` events.
- `asljs-letterpad` exposes a fixed alphabetic keypad surface with a
  `characters` filter, a `collapsed` state, and emitted `key`/`submit`
  events.
- `asljs-numpad` exposes a fixed keypad surface with a `characters` filter and
  emitted `key` events.
- `createAiChatModel()` creates an observable, eventful chat model.
- `asljs-ai-chat` renders chat state from an explicit `model` plus `options`
  configuration.
- `asljs-file` accepts `provider`, `handlers`, and `fileName` as explicit
  inputs.
- `asljs-list` accepts `items`, `context`, and `theme` as explicit inputs.
- `asljs-text-input` accepts `value`, validation, editing mode, and theming as
  explicit inputs while keeping live draft state in an observable status
  object.

### View

The view is the DOM-facing rendering surface.

- Use a Lit custom element when the component benefits from declarative
  markup, lifecycle hooks, and property-driven rendering.
- Use a plain `HTMLElement` subclass for lightweight provider elements that do
  not need Lit templating.
- Use a plain helper or base abstraction only when no reusable custom element
  surface is needed.

### Binding and composition

Binding/composition connects model state to the rendered DOM.

- Prefer declarative binding with `asljs-data-binding` when rendering repeated
  or model-driven DOM.
- Keep interaction flow explicit: DOM event -> model method or emitted event.
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

### Keep state separate from rendering

- The model should be usable without immediately creating DOM.
- Rendering should consume model state instead of becoming the source of truth.
- Serialization and persistence belong with model/state code, not with a Lit
  render function.

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

### `createAiChatModel()` and `asljs-ai-chat`

- Form: explicit model plus Lit custom element view
- State surface: observable chat model with serializable state and events
- Rendering model: custom-element rendering kept in sync with the model

## Example: Accounts editor component

This example shows the common ASLJS pattern for a custom-element view layered
over an explicit model and declarative binding.

```ts
import {
    LitElement,
  } from 'lit';
import {
    customElement,
    property,
  } from 'lit/decorators.js';
import {
    bindDataModel,
  } from 'asljs-data-binding';
import 'asljs-components';

export type Account =
  { id: string;
    name: string; };

export type AccountsListEvents =
  { select: [id: string]; };

export type AccountsList =
  { records: Account[];
    watch: (
        propertyName: 'records',
        listener: () => void
      ) => (() => void);
    emit: (
        name: 'select',
        id: string
      ) => void; };

type AccountListItem =
  { id: string;
    name: string; };

type AccountsListContext =
  { select: (this: { item: AccountListItem }, event: Event) => void; };

@customElement('example-account-list')
class ExampleAccountList
  extends LitElement
{
  #unbind: (() => void) | null = null;
  #unwatch: (() => void) | null = null;

  @property({ attribute: false })
    accessor model: AccountsList | null = null;

  createRenderRoot(): this {
    return this;
  }

  disconnectedCallback(): void {
    this.#unwatch?.();
    this.#unwatch = null;
    this.#unbind?.();
    this.#unbind = null;
    super.disconnectedCallback();
  }

  updated(changedProperties: Map<PropertyKey, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('model')) {
      this.#bindModel();
    }
  }

  #bindModel(): void {
    this.#unwatch?.();
    this.#unwatch = null;

    if (this.model === null) {
      this.#unbind?.();
      this.#unbind = null;
      this.replaceChildren();
      return;
    }

    this.#unwatch =
      this.model.watch(
        'records',
        () => {
          this.#renderFromModel();
        });

    this.#renderFromModel();
  }

  #renderFromModel(): void {
    if (this.model === null) {
      return;
    }

    const model =
      this.model;

    const items: AccountListItem[] =
      model.records.map(
        record =>
          ({ id: record.id,
             name: record.name }));

    const context: AccountsListContext =
      { select(this: { item: AccountListItem }): void {
          model.emit(
            'select',
            this.item.id);
        } };

    const template =
      document.createElement('template');

    template.innerHTML =
      `
        <asljs-list data-bind-prop-items="items"
                    data-bind-prop-context="context">
          <template data-slot="item">
            <div>
              <span data-bind-text="item.name"></span>
              <button data-bind-onclick="context.select">Edit</button>
            </div>
          </template>
        </asljs-list>
      `;

    const root =
      template.content.firstElementChild as HTMLElement;

    this.#unbind?.();
    this.#unbind =
      bindDataModel(
        root,
        { items,
          context });

    this.replaceChildren(root);
  }
}
```

Usage:

```ts
const component =
  document.createElement('example-account-list') as HTMLElement & {
    model: AccountsList | null;
  };

component.model = model;
host.appendChild(component);
```

Or with binding:

```html
<example-account-list
  data-bind-prop-model="accountListModel"></example-account-list>
```
