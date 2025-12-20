---
applyTo: '**'
---

- **Naming & Scope:**
  - Package name begins with `asljs-` and aligns with its domain (e.g.,
    observable, machine, eventful, money).
  - Keep the public API surface minimal, consistent, and orthogonal; avoid
    leaking internal structures.
- **Module & Export Style:**
  - Prefer ESM `type: module` and `export { ... }` in source; avoid CommonJS
    `module.exports`. Use clear, consistent export shapes (named or default) and
    reflect them in docs and typings.
  - Ensure runtime, types, and README agree on how consumers import and use
    the package.
- **Options & Hooks:**
  - Options should be explicit, optional, and default-safe. Hooks (like tracing
    or error handling) should be opt-in and invoked conditionally.
  - Hook payloads must be stable, serializable, and avoid exposing mutable
    internals.
- **Error Handling Philosophy:**
  - Provide a clear strict vs non-strict behavior when relevant. In non-strict
    flows, isolate errors while still surfacing them via hooks or logs.
  - In strict flows, fail fast and document the contract.
- **State & Internals:**
  - Use appropriate data structures (e.g., `Map`, `Set`) for internal state. Do
    not expose these directly; return safe views or booleans/counters.
  - Ensure idempotent operations (e.g., unsubscribe closures) return consistent
    results.
- **Guardrails:**
  - Protect against name collisions and invalid inputs; validate function/object
    arguments with clear TypeErrors.
  - Keep method/property descriptors non-enumerable unless intended for public
    iteration.
- **Typings:**
  - Avoid overly specific types tied to one package; keep them generic and
    reusable.
- **Documentation:**
  - Provide minimal, accurate examples consistent with exports and options.
    Document strict/non-strict behaviors, hooks, and return values.
  - Keep README, types, and runtime synchronized whenever contracts change.
- **Testing:**
  - Use Node’s test runner. Cover happy paths, error paths, and surface-level
    API contracts.
  - Add tests when changing behavior; prefer small, fast, deterministic cases.
- **Code style**
  - Use 2-space indentation.
  - Always use semicolons.
  - Prefer single quotes for strings.
  - Prefer multi-line formatting over long lines; wrap at logical boundaries.
  - Prefer this assignment wrapping pattern for complex expressions:
    - `const name =` on its own line, with the initializer starting on the next
      line indented by two spaces.
  - Prefer this multi-line function signature style:
    - One parameter per double-indented line, closing `)` is indented once and
      on its own line. Example:
      `function name(\n    param1: Type1,\n    param2: Type2\n  ) : ReturnType\n{\n  ...`
  - Prefer this arrow-function block style:
    - Put the opening `{` on the next line after `=>`.
  - Prefer fluent/chained call formatting with the `.` starting each chained
    line, e.g.:
    - `Object.prototype\n  .hasOwnProperty\n  .call(...)`
  - For multi-line boolean expressions, place `&&` / `||` at the start of the
    continued line and align indentation, e.g.:
    - `if (a\n  && b\n  && c) { ... }`
  - For multi-line imports/exports, use the brace-block style:
    - `import {\n    a,\n    b\n  } from '...';`
    - `export {\n    a\n  } from '...';`
  - Prefer trailing commas in multi-line import lists and object/array literals.
  - Keep blank lines between logical sections (imports, helpers, main impl,
    exports).
