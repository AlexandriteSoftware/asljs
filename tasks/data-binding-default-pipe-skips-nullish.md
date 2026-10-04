# data-binding-default-pipe-skips-nullish

The `default` pipe only replaces the empty string, so a missing or `null` model
value never receives its default.

Package: `data-binding`.

`createBuiltInPipes().default` returns `null` and `undefined` unchanged and
substitutes the fallback only when `value === ''`. `readModelPath` returns
`null` for a path that does not resolve. Together:

```html
<span data-bind-text="missing | default:unknown"></span> <!-- '' -->
<span data-bind-text="nul | default:unknown"></span>     <!-- '' -->
<span data-bind-text="empty | default:unknown"></span>   <!-- 'unknown' -->
```

with `{ nul: null, empty: '' }`. The one case a reader of
`data-bind-text="name | default:unknown"` expects it to cover, a value that is
not there, is the case it skips. The only test for it (`bind-data-model`:
"subscribes only to main path") uses `name: ''`, which is why it passes.

`README.md` lists `default:value` under Built-ins without saying what it
treats as absent, and states the general rule "built-in pipes preserve `null`
and `undefined` values". That rule makes sense for formatting pipes, where a
later `default` or the nullish-removes-attribute behaviour should still see the
nullish value. It makes `default` itself nearly useless.

Proposed behaviour: `default` substitutes for `null`, `undefined` and `''`.
Document it as the one built-in that consumes nullish values, and keep the
preserve rule for the rest. Add the three cases above as a test.

## Where

- `libs/data-binding/src/pipes.ts` - `default` in `createBuiltInPipes`.
- `libs/data-binding/src/read-model-path.ts` - returns `null` for a missing
  path, which is what reaches the pipe.
- `libs/data-binding/src/pipes.test.ts` - only covers `''`, `null` and
  `undefined` as preserved.
- `libs/data-binding/README.md` - "Built-ins" and "Nullish behavior".
