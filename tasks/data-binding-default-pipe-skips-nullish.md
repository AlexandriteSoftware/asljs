# data-binding-default-pipe-skips-nullish

The `default` pipe only replaces the empty string, so a missing or `null` model
value never receives its default.

Package: `data-binding`.

## Context

- A value binding such as `data-bind-text="name | default:unknown"` is parsed
  into a model path (`name`) and a list of pipes, each with a name and static
  string arguments split on `:`.
- On every update the binding reads the path with `readModelPath` and passes the
  value through each pipe in order, as `formatter(current, ...args)`.
- The binding target then writes the final value; `data-bind-text` and
  `data-bind-html` render `null` and `undefined` as `''`.

`libs/data-binding/src/bind-value-model.ts`:

```ts
    const rawValue =
      readModelPath(
        model,
        spec.path);

    const formattedValue =
      applyPipes(
        rawValue,
        compiledPipes);
// ...
  for (const pipe of pipes) {
    current =
      pipe.formatter(
        current,
        ...pipe.args);
  }
```

- For a plain object model, `readModelPath` returns `null` as soon as a path
  segment is missing. A model with a `get(path)` method returns whatever `get`
  returns, which can be `undefined`.

`libs/data-binding/src/read-model-path.ts`:

```ts
if (
  typeof current
  !== 'object'
  || current === null
  || !(part in current)
) {
  return null;
}
```

- `default` rejoins its arguments with `:`, so `default:a:b` yields `a:b`, and
  returns nullish values before it checks for `''`.

`libs/data-binding/src/pipes.ts`:

```ts
           default:
             (
                 value,
                 ...fallbackParts
               ) =>
             {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      if (value === '') {
        return fallbackParts.join(':');
      }

      return value;
    },
```

## Problem

`createBuiltInPipes().default` returns `null` and `undefined` unchanged and
substitutes the fallback only when `value === ''`. `readModelPath` returns
`null` for a path that does not resolve. Together:

```html
<span data-bind-text="missing | default:unknown"></span> <!-- '' -->
<span data-bind-text="nul | default:unknown"></span>     <!-- '' -->
<span data-bind-text="empty | default:unknown"></span>   <!-- 'unknown' -->
```

with `{ nul: null, empty: '' }`. The one case a reader of `data-bind-text="name
| default:unknown"` expects it to cover, a value that is not there, is the case
it skips. The only binding-level test for it (`bind-data-model`: "subscribes
only to main path") uses `name: ''`, which is why it passes.

`docs/Pipes.md` lists `default:value` under "Built-ins" without saying what it
treats as absent, and states the general rule under "Nullish values": "Built-in
pipes preserve `null` and `undefined` values". That rule makes sense for
formatting pipes, where a later `default` or the nullish-removes-attribute
behaviour should still see the nullish value. It makes `default` itself nearly
useless.

Proposed behaviour: `default` substitutes for `null`, `undefined` and `''`.
Document it as the one built-in that consumes nullish values, and keep the
preserve rule for the rest. Add the three cases above as a test.

## Where

- `libs/data-binding/src/pipes.ts` - `default` in `createBuiltInPipes`.
- `libs/data-binding/src/read-model-path.ts` - returns `null` for a missing
  path, which is what reaches the pipe.
- `libs/data-binding/src/pipes.test.ts` - "supports upper lower and default"
  covers `''` as replaced, and `null` and `undefined` as preserved.
- `libs/data-binding/docs/Pipes.md` - "Built-ins" and "Nullish values".
