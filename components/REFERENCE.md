# REFERENCE

## Button variants

- `asljs-button` is the only public button custom element.
- Button presets such as add/delete/settings are selected with the `variant`
	property or `variant` attribute.
- Theme data can provide button-wide defaults in `button` and variant-specific
	overrides in `button.variants.<name>`.
- Resolution order for button display defaults is:
	explicit `icon` / `text` / `buttonClassName` -> selected
	`button.variants.<name>` -> base `button` theme -> package default theme.
- The package default theme includes built-in `add`, `delete`, and `settings`
	icon/text defaults.

## Runtime model definitions

- Exported `*ModelDefinition` values describe runtime-visible component
	properties for all public component classes.
- Each property definition includes at least `name` and `type`, and may also
	include `title`, `description`, and `editable`.
- `asljs-properties` renders a generated editor from a model definition and a
	target object.
- `asljs-properties` uses `asljs-text-input` for string/number fields and
	`asljs-select` for boolean fields using `Yes` / `No` options.
- Non-primitive or read-only fields are shown as read-only values and are not
	mutated by the generated editor.

## AI chat state surface

- `asljs-ai-chat` exposes its mutable chat state directly on the custom element
	properties (`messages`, `messageHistory`, `promptDraft`, and related state
	fields).
- Collection state should be configured on the custom element itself instead of
	requiring a separate external model object.
