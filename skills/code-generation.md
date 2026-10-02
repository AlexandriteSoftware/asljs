# code-generation

Use when: writing new code or changing existing code.

- Produce **complete, runnable code** unless told otherwise
- Follow `CONVENTIONS.md`.

## Guidelines

- Avoid unnecessary abstractions
- Avoid introducing new dependencies unless clearly justified
- Explain changes in backward compatibility when changing behavior

## Validation

Validate the package you changed, from the repository root, in this order:

1. `npm -w <package> run test`
2. `npm -w <package> run typecheck`
3. `npm -w <package> run lint`
4. `npm -w <package> run build`, when emitted output matters

The script shape and the per-app exceptions are in `docs/Repository Layout.md`.

## Comments

- Only add comments for **non-obvious logic**
- Keep them concise and technical
