# ASLJS Components AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-components`.

This package currently exports the `AssistedInput`, `Button`, `Keyboard`,
`Letterpad`, `List`, `Numpad`, `Properties`, `Select`, and `TextInput` UI
classes/components, the `AiChat` custom element plus AI chat model helpers,
the `FileView` web component plus file handlers, runtime component model
definitions, package theming helpers, a theme provider custom element, and
related types.

## Package Scope

Exports from `src/index.ts`:

- `AiChat`
- `createAiChatModel`
- `serializeAiChatModelState`
- `createBootstrapTheme`
- `AiChatModelDefinition`
- `AllComponentModelDefinitions`
- `AssistedInput`
- `AssistedInputModelDefinition`
- `Button`
- `ButtonModelDefinition`
- `FileView`
- `FileViewModelDefinition`
- `Keyboard`
- `KeyboardModelDefinition`
- `Letterpad`
- `LetterpadModelDefinition`
- `Numpad`
- `NumpadModelDefinition`
- `Properties`
- `PropertiesModelDefinition`
- `createPdfFileHandler`
- `createImageFileHandler`
- `createTextFileHandler`
- `createTextEditorFileHandler`
- `List`
- `ListModelDefinition`
- `Select`
- `SelectModelDefinition`
- `TextInput`
- `TextInputModelDefinition`
- `ThemeProvider`
- `ThemeProviderModelDefinition`
- `findThemeProvider`
- `getComponentVariantList`
- `getDefaultTheme`
- `resolveThemeText`
- `resolveThemeTemplate`
- `setDefaultTheme`
- `THEME_CHANGED_EVENT_NAME`
- `THEME_PROVIDER_TAG_NAME`
- `AiChatAfterResponseContext`
- `AiChatBeforeSendContext`
- `AiChatBuildRequestArgs`
- `AiChatChoiceOption`
- `AiChatChoicePrompt`
- `AiChatInitializeContext`
- `AiChatMessage`
- `AiChatMessages`
- `AiChatMessageRole`
- `AiChatModel`
- `AiChatOptions`
- `AiChatProgressState`
- `AiChatResponsesInputItem`
- `AiChatSecretsAndSettingsProvider`
- `AiChatSerializableState`
- `AiChatStateStore`
- `AiChatToolDefinition`
- `AiChatToolStepLimitContext`
- `AssistedInputButtonDefinition`
- `AssistedInputKeyDetail`
- `ComponentModelDefinition`
- `ComponentModelPropertyDefinition`
- `ComponentModelPropertyType`
- `ButtonVariantThemeDefinition`
- `ButtonThemeDefinition`
- `ComponentsTheme`
- `FileHandler`
- `FileHandlerRenderContext`
- `FileHandlerRenderResult`
- `FileViewData`
- `FileViewProvider`
- `KeyboardKeyDetail`
- `LetterpadKeyDetail`
- `ListThemeDefinition`
- `SelectChangeDetail`
- `SelectItem`
- `SelectStatus`
- `SelectThemeDefinition`
- `SelectValidator`
- `NumpadKeyDetail`
- `TextInputChangeDetail`
- `TextInputEnterKeyBehavior`
- `TextInputStatus`
- `TextInputThemeDefinition`
- `TextInputValidator`
- `ThemeProviderLike`
- `ThemeTextFactory`
- `ThemeTextValue`
- `ThemeTemplateValue`
- `ThemeTemplateFactory`
- `ListItem`
- `ListItemsSource`
- `ListRowContext`

Current custom elements:

- `asljs-ai-chat`
- `asljs-file`
- `asljs-list`
- `asljs-button`
- `asljs-properties`
- `asljs-keyboard`
- `asljs-numpad`
- `asljs-letterpad`
- `asljs-select`
- `asljs-text-input`
- `asljs-theme-provider`

Current non-custom-element UI surface:

- `AssistedInput`

## AI Quick Reference

Component contract at a glance:

- import with `import 'asljs-components';`
- custom elements: `asljs-ai-chat`, `asljs-button`, `asljs-file`,
  `asljs-keyboard`, `asljs-letterpad`, `asljs-list`, `asljs-numpad`,
  `asljs-properties`, `asljs-select`, `asljs-text-input`,
  `asljs-theme-provider`
- AI chat state lives on `asljs-ai-chat` direct properties (`messages`,
  `promptDraft`, and related fields)
- `AssistedInput` is the shared Lit base for keyboard-like input surfaces
- button rendering uses explicit `icon`, `text`, `buttonClassName`, and
  optional `variant`; theme lookup checks variant-specific overrides first,
  then base button defaults, with built-in package defaults for `add`,
  `delete`, and `settings`
- runtime model metadata is exported through `*ModelDefinition` values whose
  `properties` arrays describe runtime-visible property names, types, and edit
  metadata
- `asljs-properties` renders generated editors from a model definition plus a
  target object, using `asljs-text-input` for string/number and `asljs-select`
  for boolean values
- file viewing uses provider + ordered handler matching
- keyboard uses a fixed QWERTY layout, a `characters` filter, and bubbling
  `key` plus `submit` events
- letterpad uses a fixed alphabetic layout, a `characters` filter, a
  `collapsed` toggle, and bubbling `key` plus `submit` events
- numpad uses a fixed keypad layout, a `characters` filter, and bubbling
  `key` events
- text input editing uses explicit properties plus `input` and `change`
  events whose detail reports draft value, validity, and dirty state
- theme provider element: `asljs-theme-provider`
- required row template: `template[data-slot="item"]`
- optional templates: `template[data-slot="empty"]` and
  `template[data-slot="container"]`
- optional text-input template: `template[data-slot="template"]`
- optional text-input control templates: `template[data-slot="input"]` and
  `template[data-slot="textarea"]`
- optional select template: `template[data-slot="template"]`
- optional select control template: `template[data-slot="select"]`
- theme fallback order: local slot template -> `list.theme` -> nearest
  `asljs-theme-provider` -> package default theme
- container templates must include `[data-role="items"]`
- text-input templates must include `[data-role="control-host"]`
- text-input control templates must include a real `input` or `textarea`
  element that matches the slot name
- row bindings expose `item`, `index`, `first`, `last`, `odd`, `even`,
  `count`, and `context`

Use this package when:

- you want reusable web components already designed for ASLJS patterns
- you want a packaged UI surface with an explicit state contract and a custom
  element tag
- you specifically want `asljs-list` rather than raw DOM binding

Use another package when:

- you only need DOM binding -> `asljs-data-binding`
- you need state reactivity -> `asljs-observable`
- you need event primitives -> `asljs-eventful`

## General Component Patterns

The package currently uses more than one component form.

- `AssistedInput` is a shared Lit base class for keyboard-like inputs.
- `FileView` is a Lit custom element driven by provider and handler properties.
- `Keyboard` is a Lit custom element driven by a `characters` filter and event
  dispatch through `AssistedInput`.
- `Letterpad` is a Lit custom element driven by `characters`, `collapsed`, and
  event dispatch through `AssistedInput`.
- `List` is a Lit custom element with explicit properties.
- `Button` is a Lit custom element driven by explicit icon/text properties,
  an optional `variant`, and theme-backed defaults.
- `Properties` is a Lit custom element that renders a generated property form
  from runtime model metadata.
- `Numpad` is a Lit custom element driven by a `characters` filter and key
  event dispatch through `AssistedInput`.
- `Select` is a Lit custom element with explicit items, validation, and
  template properties.
- `TextInput` is a Lit custom element with explicit reset-value, validation,
  and template properties.
- `ThemeProvider` is a lightweight `HTMLElement` provider.
- `AiChat` is a Lit custom element with explicit state properties and `options`.

Preserve the shared design rules across those forms.

- keep state explicit on the custom element and separate from rendering
- use the simplest rendering surface that fits the runtime need
- keep model-to-view synchronization explicit
- clean up subscriptions and listeners when components detach or rebind

## Preferred Usage Patterns

### Use ordered handlers for file display

Inside `asljs-file`, configure:

- `provider.loadFile(fileName)` to return normalized file data
- `handlers` ordered from most specific to most general
- `fileName` for the selected file

The first handler whose `canDisplay(...)` returns true owns rendering.

Prefer package handlers when they fit:

- `createPdfFileHandler()`
- `createImageFileHandler()`
- `createTextFileHandler()`
- `createTextEditorFileHandler()`

If text editing must persist, provide `provider.saveText(...)`.

### Register components once

```ts
import 'asljs-components';
```

Create and configure elements through normal DOM APIs.

### Use the base button for icon-plus-text actions

Inside `asljs-button`, configure:

- `icon` as an HTML string for the icon markup
- `text` as the visible label
- `variant` when the button should use theme-provided defaults such as `add`,
  `delete`, or `settings`
- `buttonClassName` when host CSS needs to target the inner native button
- `type` and `disabled` for native button behavior

Prefer `variant="add"`, `variant="delete"`, or `variant="settings"` when
their defaults fit. Theme overrides live under
`button.variants.<variantName>.icon`, `.text`, and `.className`. Explicit
`icon`, `text`, and `buttonClassName` values still win over theme defaults.

If Bootstrap icon markup is desired, prefer `createBootstrapTheme()` over
duplicating raw icon HTML literals at multiple call sites.

### Use explicit reset-value semantics for text input

Inside `asljs-text-input`, configure:

- `value` as the external set/reset value
- `validator` to return an error message or `null`
- `multiline` and `enterKeyBehavior` for editing behavior
- `autoExtend` plus `autoExtendMaxRows` for textarea growth
- `theme` or a local `template[data-slot="template"]` for layout override
- local `template[data-slot="input"]` or `template[data-slot="textarea"]`
  for themed native control markup override

User edits update `draftValue` and `status`; they do not mutate `value`
directly. Consumers should listen for `input` or `change` and decide whether
to persist or reset.

### Use explicit items/value semantics for select

Inside `asljs-select`, configure:

- `items` as explicit `{ value, label, disabled? }` entries
- `value` as the external set/reset selection
- `validator` to return an error message or `null`
- `placeholder` when an empty prompt option should be shown first
- `controlClassName` when host CSS needs to target the inner native `select`
- `theme` or a local `template[data-slot="template"]` for layout override
- local `template[data-slot="select"]` for themed control markup override

User selection updates `draftValue` and `status`; it does not mutate `value`
directly. Consumers should listen for `input` or `change` and decide whether
to persist or reset.

### Use explicit state/options semantics for AI chat

Inside `asljs-ai-chat`, configure:

- `messages`, `promptDraft`, and related chat state directly
  on the custom element
- `options` as the request/persistence/tool callbacks the chat runtime needs
- `messages` as a store object (`save(...)`, `read()`, and `list`)
- rely on default sessionStorage persistence when `options.stateStore` is omitted

The chat element owns the rendered conversation UI and the primary state
surface.

### Keep text-input templates control-host based

If a local or themed template is used for `asljs-text-input`, it must include
`[data-role="control-host"]`. That host is where the real `input` or
`textarea` is mounted.

If a local or themed `template[data-slot="input"]` or
`template[data-slot="textarea"]` is used, it must include the matching native
control element. Wrappers around that control are allowed.

Template bindings may include any supported `asljs-data-binding` expressions
needed for label, description, error, or state classes.

### Use slot templates for rendering

Inside `asljs-list`, use:

- required: `template[data-slot="item"]`
- optional: `template[data-slot="empty"]`
- optional: `template[data-slot="container"]` with required
  `[data-role="items"]`

If `items` is non-empty and no item template is provided, the component warns
and renders nothing.

### Use themes as template defaults

Themes provide fallback templates. They do not replace slot-template authoring.

Preferred resolution order:

- local `template[data-slot]`
- per-component theme such as `list.theme` or `textInput.theme`
- nearest `asljs-theme-provider`
- `setDefaultTheme(...)`

If a local slot template exists, it must continue to win over the active theme.

### Use row bindings through `asljs-data-binding`

Row binding context fields are:

- `item`
- `index`
- `first`
- `last`
- `odd`
- `even`
- `count`
- `context`

Prefer path-based binding expressions such as:

- `item.title`
- `index`
- `context.select`

### Use `list.context` for shared row actions and state

`List.context` is the shared base context. Row rendering derives a row-local
context that includes row-specific `item` and `index` values and binds base
context methods to that derived object.

If a handler needs row data, prefer the `context` plus `this` pattern.

## How Row Actions Receive Row Data

- handlers should usually be referenced as `context.someAction`
- row-specific values arrive through the derived row-local `this` context
- the derived row context includes at least `item` and `index`
- do not invent inline argument syntax like `select(item.id)`

## Common Wrong Assumptions

- this is React-style callback rendering
- this is template-expression syntax with inline function calls
- row actions should pass arguments in attributes
- any container template shape is acceptable
- item rendering is driven by imperative callbacks instead of templates

## Constraints To Preserve

- Keep row rendering template-driven.
- Keep theme behavior template-driven and slot-compatible.
- Keep `TextInput.value` as a set/reset input, not the live mutable draft.
- Keep event bindings path-based; do not add parameter-expression syntax.
- Do not introduce custom invocation protocols such as `*-args` or inline call
  expressions for bindings.
- `template[data-slot="container"]` must keep `[data-role="items"]` as the
  insertion point.
- `template[data-slot="template"]` for `TextInput` must keep
  `[data-role="control-host"]` as the insertion point.
- `template[data-slot="input"]` and `template[data-slot="textarea"]` for
  `TextInput` must keep a matching native control element.
- `List.items` can be a plain array or an eventful-like collection; when the
  source emits `set`, `delete`, or `define`, list rerender behavior is part of
  the current design.

## Safe Authoring Rules

- keep row templates declarative
- use themes only as fallback template sources
- use `TextInput.status` or emitted events for live draft state
- use `context` methods for shared row actions
- avoid custom attribute protocols
- do not mutate slot templates at runtime
- update `list.items` or the source collection instead of rewriting row DOM

## Change Safety Checklist

- If touching row rendering, then preserve template-driven rendering.
- If touching theming, then preserve fallback precedence and local-template
  override behavior.
- If touching container handling, then preserve `[data-role="items"]` as the
  insertion point.
- If touching text-input layout handling, then preserve
  `[data-role="control-host"]` as the insertion point.
- If touching text-input control templating, then preserve matching native
  `input` or `textarea` lookup for the documented control slots.
- If touching row context, then preserve the documented field names.
- If touching event binding integration, then preserve path-based
  `asljs-data-binding` handler rules.
- If touching item sources, then preserve rerender behavior for arrays and
  eventful-like collections.

## Validation

- `npm -w asljs-components run test`
- `npm -w asljs-components run typecheck`
- `npm -w asljs-components run lint`

Update this file when AI-facing constraints, exported surface expectations, or
validation commands change. Update `README.md` separately only when
user-facing usage or behavior changes.
