# ASLJS Money AI Guidance

## Purpose

Use this file as AI-facing guidance for `asljs-money`.

This package exposes a lightweight fixed-point money factory with optional
currency tracking.

## Package Scope

Root exports:

- `money`
- `Money` type
- `MoneyFactory` type

Important: the package does not currently export many separate named helpers.
Most public behavior is exposed as methods and properties on the `money`
factory.

## AI Quick Reference

Public API at a glance:

- Runtime entrypoint: `money`
- Factory-created values: `Money` instances
- Factory constants: `money.zero`, `money.minor`, `money.major`
- Factory helpers: `parse`, `fromString`, `fromMinor`, `fromMajor`,
  `fromNumber`, `isMoney`
- Instance methods: arithmetic, conversion, and formatting live on `Money`

Use this creation path when:

- you have minor units already -> `money.fromMinor(...)`
- you have major whole units already -> `money.fromMajor(...)`
- you have a human-readable amount string -> `money.parse(...)` or
  `money.fromString(...)`
- you have a JavaScript number -> `money.fromNumber(...)`
- you already have `Money` or minor units for the factory entrypoint ->
  `money(value, currency?)`

Safe usage rules:

- construct `Money` values early
- keep domain arithmetic on `Money` instances
- convert to numbers or strings late
- make currency conversion explicit
- do not do money math on raw floating-point values

## Preferred Usage Patterns

- Use `money.fromMinor(...)`, `money.fromMajor(...)`, `money.fromNumber(...)`,
  or `money.fromString(...)` to create values.
- Use the `money.zero`, `money.minor`, and `money.major` factory properties as
  constants already supplied by the package.
- Keep arithmetic on `Money` instances, not raw floating-point values.
- Preserve currency-aware operations by keeping same-currency checks on add and
  subtract behavior.

## Common Wrong Assumptions

- raw JS numbers are acceptable for money arithmetic
- different currencies can be added or subtracted directly
- conversion uses a general rounding policy instead of truncation
- many standalone helper exports exist at package root
- `toNumber()` is the preferred path for downstream arithmetic

## Constraints To Preserve

- `Money.value` is the integer fixed-point representation.
- `add(...)` and `subtract(...)` require compatible currencies.
- `convert(rate, currency)` uses a positive finite rate and truncates to the
  nearest cent.
- `toString()` is part of the readable external contract and currently shows
  currency when present.
- Keep the package lightweight; avoid replacing fixed-point logic with generic
  decimal libraries unless explicitly requested.

## Edit Safety Checklist

- If touching formatting, then re-check `toString()` with and without
  currency.
- If touching arithmetic, then re-check same-currency enforcement.
- If touching conversion, then re-check positive finite rate validation and
  truncation behavior.
- If touching constructors or parsers, then re-check the expected factory entry
  paths.

## Validation

- `npm -w asljs-money run test`
- `npm -w asljs-money run typecheck`
- `npm -w asljs-money run lint`

Update this file when AI-facing arithmetic or formatting constraints, exported
surface expectations, or validation commands change. Update `README.md`
separately only when user-facing behavior changes.
