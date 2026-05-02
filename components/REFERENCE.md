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

