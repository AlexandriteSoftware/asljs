# data-binding-date-pipe-shifts-date-only-strings

The `date` pipe parses a date-only string as UTC and formats it in local time,
so `2026-02-03` renders as `2026-02-02` west of Greenwich, and the shipped test
for it fails there.

Package: `data-binding`.

## Context

- A value binding such as `data-bind-text="due | date:yyyy-MM-dd"` is parsed
  into a model path (`due`) and a list of pipes, each with a name and static
  string arguments split on `:`.
- On every update the binding reads the path from the model and passes the value
  through each pipe in order, as `formatter(current, ...args)`.
- The pipe registry is `mergePipes(options)`: the built-ins from
  `createBuiltInPipes()` without a locale, overridden by `options.pipes`.

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

- `date` (and `datetime`) hand the value to `formatDateOrIntl`. A format of
  `short`, `medium`, `long` or `full` goes to `Intl.DateTimeFormat` with no
  `timeZone`; any other format string goes to `formatDate`.
- Both start from `asDate`, which passes a string straight to `new Date`.

`libs/data-binding/src/pipes.ts`:

```ts
  const dt =
    asDate(value);
// ...
    return withTime
      ? new Intl.DateTimeFormat(
        locale,
        { dateStyle: style,
          timeStyle: style })
        .format(dt)
      : new Intl.DateTimeFormat(
        locale,
        { dateStyle: style })
        .format(dt);
  }

  return formatDate(
    dt,
    format);
// ...
  if (
    typeof value
    === 'string'
    || typeof value
       === 'number'
  ) {
    const dt =
      new Date(value);
```

- `formatDate` replaces the tokens `yyyy`, `yy`, `MM`, `dd`, `hh`, `mm`, `ss`
  with local-time getters.

`libs/data-binding/src/date-formatting.ts`:

```ts
{ token: 'dd',
  getter:
    (d: Date) =>
d.getDate().toString().padStart(
  2,
  '0') },
```

## Problem

`asDate` in `pipes.ts` turns a string into `new Date(value)`. For an ISO
date-only string the platform defines that as UTC midnight. Both formatters then
read local time: `formatDate` uses `getFullYear`, `getMonth`, `getDate`,
`getHours`, and `Intl.DateTimeFormat` without a `timeZone` option uses the
runtime zone. Any zone with a negative offset lands on the previous day:

```text
TZ=America/New_York
date('2026-02-03', 'yyyy-MM-dd')  -> 2026-02-02
date('2026-02-03', 'short')       -> 02/02/2026
```

A date-only string is the shape a JSON API, `<input type="date">` and
`asljs-dali` records hand to a model, so this is the common input, not a corner.

`pipes.test.ts` ("supports currency and date formatting") asserts
`pipes.date('2026-02-03', 'yyyy-MM-dd') === '2026-02-03'`, which passes in
London and fails under `TZ=America/New_York` with `actual: '2026-02-02'`. The
same test asserts `pipes.number(1234.5) === '1,234.5'` through `mergePipes({})`,
which formats in the runtime locale. With `createBuiltInPipes('de-DE')` the same
call gives `1.234,5`, so a machine with a German default locale would fail that
line too (not reproduced here: the host locale could not be switched).

`docs/Pipes.md` ("Locale") says the `Intl`-based pipes use the runtime or
browser locale, and says nothing about time zones or date-only strings.

Proposed behaviour: treat a string that matches `YYYY-MM-DD` as a local date
(construct with `new Date(y, m - 1, d)`), which is what a user who wrote
`yyyy-MM-dd` expects back, and document that other strings follow the platform's
`Date` parsing. Make the tests independent of the host: build the `Date` with
the local constructor, and pass an explicit locale to the `number` and
`currency` assertions.

## Where

- `libs/data-binding/src/pipes.ts` - `asDate`, `formatDateOrIntl`.
- `libs/data-binding/src/date-formatting.ts` - the local-time getters.
- `libs/data-binding/src/pipes.test.ts` - "supports currency and date
  formatting", "supports fixed and number formatting".
- `libs/data-binding/docs/Pipes.md` - "Locale".
