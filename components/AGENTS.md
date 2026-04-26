# ASLJS Components AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-components`.

This package currently exports the `AssistedInput`, `Button`, `ButtonAdd`,
`ButtonDelete`, `Keyboard`, `Letterpad`, `List`, `Numpad`, and `TextInput`
UI classes/components, AI chat model/factory helpers, the `FileView` web
component plus file handlers, package theming helpers, a theme provider custom
element, and related types.

## Package Scope

Exports from `src/index.ts`:

- `createAiChatComponent`
- `createAiChatModel`
- `serializeAiChatModelState`
- `createBootstrapTheme`
- `AssistedInput`
- `Button`
- `ButtonAdd`
- `ButtonDelete`
- `FileView`
- `Keyboard`
- `Letterpad`
- `Numpad`
- `createPdfFileHandler`
- `createImageFileHandler`
- `createTextFileHandler`
- `createTextEditorFileHandler`
- `List`
- `TextInput`
- `ThemeProvider`
- `findThemeProvider`
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

- `asljs-file`
- `asljs-list`
- `asljs-button`
- `asljs-button-add`
- `asljs-button-delete`
- `asljs-keyboard`
- `asljs-numpad`
- `asljs-letterpad`
- `asljs-text-input`
- `asljs-theme-provider`

Current non-custom-element UI surface:

- `AssistedInput`
- `createAiChatComponent(...)`

## AI Quick Reference

Component contract at a glance:

- import with `import 'asljs-components';`
- custom elements: `asljs-button`, `asljs-button-add`,
  `asljs-button-delete`, `asljs-file`, `asljs-keyboard`,
  `asljs-letterpad`, `asljs-list`, `asljs-numpad`, `asljs-text-input`,
  `asljs-theme-provider`
- AI chat is a model-plus-factory API, not a custom element
- `AssistedInput` is the shared Lit base for keyboard-like input surfaces
- button variants use explicit `icon` and `text` properties, with add/delete
  icons resolved from theme first and Unicode fallbacks second
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
- you want a packaged UI surface with an explicit state contract, even when the
  rendering surface is produced by a factory rather than a tag
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
- `Button` is a Lit custom element driven by explicit icon/text properties.
- `Numpad` is a Lit custom element driven by a `characters` filter and key
  event dispatch through `AssistedInput`.
- `TextInput` is a Lit custom element with explicit reset-value, validation,
  and template properties.
- `ThemeProvider` is a lightweight `HTMLElement` provider.
- AI chat uses `createAiChatModel()` plus `createAiChatComponent(...)`.

Preserve the shared design rules across those forms.

- keep state explicit and separate from rendering
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
- `type` and `disabled` for native button behavior

Prefer `asljs-button-add` and `asljs-button-delete` when their defaults fit.
They inherit the same API but resolve `button.addIcon` and
`button.deleteIcon` from theme before falling back to Unicode defaults.

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
