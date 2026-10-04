# money

> Part of [Alexandrite Software Library][#1] - a set of high-quality and
> performant JavaScript libraries for everyday use.

## Overview

`asljs-money` provides `Money`, a lightweight fixed-point decimal type for
financial calculations, where floating-point rounding errors are not acceptable.
Values can optionally carry a currency.

```js
import { money } from 'asljs-money';

const price = money.fromString('19.99');
const total = price.add(price, price);

console.log(total.toString()); // "59.97"
```

## Scope

- **Exact amounts.** Values are stored as an integer number of minor units, with
  two fractional digits, from -90071992547409.91 to 90071992547409.91.
- **Fair distribution.** `distribute` splits an amount by count or by shares
  without losing a cent.
- **Explicit currencies.** Adding or subtracting different currencies throws;
  conversion happens only through `convert`, and truncates beyond 1/100.
- **Small.** One factory, `money`, with its helpers as properties.

Locale-aware formatting and general decimal arithmetic are out of scope.

## Installation

```bash
npm install asljs-money
```

NPM Package: [asljs-money][NPM]

## Usage

Create an amount, distribute it among shareholders, and sum up the result:

```js
import { money } from 'asljs-money';

const amount = money.fromString('1,204.20');

const dividends = amount.distribute([0.6, 0.2, 0.2]);

const total =
  dividends.reduce(
    (sum, item) =>
      sum.add(item),
    money.zero);

console.log(total.toString()); // "1,204.20"
```

Track and convert currencies:

```js
const usd = money.fromMinor(10000, 'USD');
const eur = usd.convert(0.9, 'EUR');

console.log(usd.toString()); // "100.00 USD"
console.log(eur.toString()); // "90.00 EUR"
```

Create values from minor units, major units, strings or numbers with
`money.fromMinor`, `money.fromMajor`, `money.fromString` and `money.fromNumber`,
keep arithmetic on `Money` instances, and convert to numbers or strings only at
the edges.

## Further reading

- [Money][MNY] - creation methods, every method and constant, currency rules,
  and which calls throw.

Questions and bugs: [asljs/issues][ISS].

## License

MIT License. See [LICENSE][LIC] for details.

[#1]: https://github.com/AlexandriteSoftware/asljs
[ISS]: https://github.com/AlexandriteSoftware/asljs/issues
[LIC]: LICENSE.md
[MNY]: docs/Money.md
[NPM]: https://www.npmjs.com/package/asljs-money
