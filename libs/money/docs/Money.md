# Money

## Purpose

The complete public surface of `asljs-money`: how to create a `Money` value,
what each method does, how currencies combine and convert, and which calls
throw.

## Package exports

- `money` - the factory, and the only runtime export. Constants and creation
  helpers are properties of it.
- `Money`, `MoneyFactory` and `Currency` - TypeScript types.

Arithmetic and formatting live on `Money` instances, not as separate exports.

## Value model

- A `Money` value is a fixed-point decimal with two fractional digits, stored as
  an integer number of minor units (cents, pence) in `value`.
- It holds values from -90071992547409.91 to 90071992547409.91. A larger number
  of minor units throws.
- `currency` is an optional currency code, or `null`.

## Choosing a creation method

- If you already have minor units such as cents or pence, then use
  `money.fromMinor(value, currency?)`.
- If you already have major units as a whole-unit integer amount, then use
  `money.fromMajor(value, currency?)`.
- If you have a human-readable amount string such as `-1,234.56`, then use
  `money.parse(value)`, which returns `null` for an invalid string, or
  `money.fromString(value)`, which throws instead.
- If you have a JavaScript number, then use `money.fromNumber(value,
  currency?)`. Digits beyond 1/100 are truncated.
- If you already have a `Money` instance or a minor-unit integer, then use
  `money(value, currency?)`.

## Factory constants and helpers

- `money.zero` - zero.
- `money.minor` - one minor unit, `0.01`. Used as a `distribute` unit.
- `money.major` - one major unit, `1.00`. Used as a `distribute` unit.
- `money.isMoney(value)` - returns `true` if `value` is a `Money` instance.

## Instance methods

- `add(money1, money2, ...)` - returns a new `Money` with the amounts added.
  Requires compatible currencies.
- `subtract(money1, money2, ...)` - returns a new `Money` with the amounts
  subtracted. Requires compatible currencies.
- `distribute(recipients, unit?)` - divides the amount among `recipients`, a
  count or an array of proportional shares, and returns the parts. Operates in
  `unit`, `money.minor` by default.
- `inverse()` - returns the amount with its sign flipped.
- `convert(rate, currency)` - converts the amount to another currency.
- `major()` - the whole major units as an integer number, for example `1` for
  `1.23`.
- `minor()` - the minor units as an integer number, for example `23` for `1.23`.
- `toNumber()` - the amount as a floating-point number.
- `toString(format?)` - the amount as text, for example `-1,234.56`, followed by
  the currency code when there is one. Format `'c'` returns the plain number
  text instead.

## Currencies

- `add` and `subtract` require compatible currencies, and throw on a mismatch.
- Different currencies are never reconciled implicitly. Convert explicitly
  before combining values from different currencies.
- `convert(rate, currency)` requires a positive finite exchange rate, and throws
  otherwise.
- Conversion truncates beyond 1/100 rather than rounding.

## Safe usage rules

- Construct `Money` values first, as close to the input as possible.
- Do arithmetic on `Money` instances, not on JavaScript numbers that are wrapped
  later.
- Convert to numbers or strings only at presentation or interop boundaries;
  `toNumber()` is for interop, not for further arithmetic.
- Keep presentation-layer formatting beyond `toString()` outside the package.
