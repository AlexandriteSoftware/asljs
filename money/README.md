# money

> Part of [Alexantrite Software Library](docs/asljs.md) - a set of high-quality
and performant JavaScript libraries for everyday use.

Provides a lightweight type and a set of functions to support financial calculations in JavaScript.

`Money`, a type that the library provides, represents a fixed-point decimal number. This type is designed to be used in financial calculations, where rounding errors are not acceptable.

The `asljs-money`'s default exported function creates a new instance of `Money` from a number of minor units (e.g. cents) or another `Money` instance. It also provides functions to create a `Money` instance from a variety of sources:

- from a string formatted as `-1,234.56`, use `money.parse(value)` or `money.fromString(value)`.
- from a number of cents (or pense), use `money.fromMinor(value)`.
- from a floating-point number, rounding to a lowest cent, use `money.fromNumber(value)`.
- from a number of major units (dollars), use `money.fromMajor(value)`.

It can holds values from -90071992547409.91 to 90071992547409.91.

A `Money` instance provides these operations:

- `value` - returns an integer representation of this `Money` instance.
- `add(money1, money2, ...)` - returns a new instance of `Money` with added amounts.
- `distribute(recipients, unit)` - divides the amount among `recipients`, proportionally to their shares. Operate in `unit` (default is `minor`).
- `major()` - returns a number of major units (dollars) as an integer JavaScript number, e.g. `1` for `1.23`.
- `minor()` - returns a number of minor units (dollars) as an integer JavaScript number, e.g. `23` for `1.23`.
- `substract(money1, money2, ...)` - returns a new instance of `Money` with substracted amounts.
- `toNumber()` - returns a floating-point number representation of the `Money` instance.
- `toString()` - returns string representation of the `Money` instance, e.g. `-1,234.56`.

Constants, defined in the module:

- `minor` - indicates that computations are done in minor units (cents).
- `major` - indicates that computations are done in major units (dollars).
- `zero` - zero value.

In addition, `money` provides these utility functions:

- `isMoney(value)` - returns `true` if `value` is an instance of `Money`.

## Usage

Include `money`:

```js
const money = require('asljs-money');
```

Create a `Money` instance, distribute it among shareholders, and sum up the result:

```js
const amount = money.parse('1,204.20');

const dividends = amount.distribute([.6, .2, .2]);

const total =
  dividends.reduce(
    (sum, item) => sum.add(item),
    money.zero);
```
