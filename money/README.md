# money

> Part of [Alexantrite Software Library][#1] - a set of high-quality and
performant JavaScript libraries for everyday use.

Provides a lightweight fixed-point type and helpers for financial calculations
in JavaScript, now with optional currency tracking.

`Money`, a type that the library provides, represents a fixed-point decimal
number. This type is designed to be used in financial calculations, where
rounding errors are not acceptable.

The `asljs-money` named export `money` creates a new instance of `Money` from
a number of minor units (e.g. cents) or another `Money` instance. It also
provides functions to create a `Money` instance from a variety of sources:

- from a string formatted as `-1,234.56`, use `money.parse(value)` or
  `money.fromString(value)`.
- from a number of cents (or pence), use `money.fromMinor(value)`.
- from a floating-point number, truncating beyond 1/100, use
  `money.fromNumber(value)`.
- from a number of major units (dollars), use `money.fromMajor(value)`.

It holds values from -90071992547409.91 to 90071992547409.91.

A `Money` instance provides these operations:

- `value` - returns an integer representation of this `Money` instance.
- `add(money1, money2, ...)` - returns a new instance of `Money` with added
  amounts. Requires the same currency.
- `distribute(recipients, unit)` - divides the amount among `recipients`,
  proportionally to their shares. Operate in `unit` (default is `minor`).
- `major()` - returns a number of major units (dollars) as an integer JavaScript
  number, e.g. `1` for `1.23`.
- `minor()` - returns a number of minor units (dollars) as an integer JavaScript
  number, e.g. `23` for `1.23`.
- `subtract(money1, money2, ...)` - returns a new instance of `Money` with
  subtracted amounts. Requires the same currency.
- `toNumber()` - returns a floating-point number representation of the `Money`
  instance.
- `toString()` - returns string representation of the `Money` instance, e.g.
  `-1,234.56`.
- `convert(rate, currency)` - converts the amount to another currency using a
  positive finite exchange rate. Rounds by truncation to the nearest cent.

Constants, defined in the module:

- `minor` - indicates that computations are done in minor units (cents).
- `major` - indicates that computations are done in major units (dollars).
- `zero` - zero value.

In addition, `money` provides these utility functions:

- `isMoney(value)` - returns `true` if `value` is an instance of `Money`.

## Usage

Import `money` (ESM):

```js
import { money } from 'asljs-money';
```

Create a `Money` instance, distribute it among shareholders, and sum up the result:

```js
const amount =
  money.fromString('1,204.20');

const dividends =
  amount.distribute([0.6, 0.2, 0.2]);

const total =
  dividends.reduce(
    (sum, item) =>
      sum.add(item),
    money.zero);

console.log(total.toString());
```

Currency-aware operations:

```js
const usd = money.fromMinor(10000, 'USD');
const eur = usd.convert(0.9, 'EUR');
console.log(usd.toString()); // "100.00 USD"
console.log(eur.toString()); // "90.00 EUR"
```

[#1]: https://github.com/AlexandriteSoftware/asljs
