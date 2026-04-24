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

## Preferred Usage Patterns

- Use `money.fromMinor(...)`, `money.fromMajor(...)`, `money.fromNumber(...)`,
  or `money.fromString(...)` to create values.
- Use the `money.zero`, `money.minor`, and `money.major` factory properties as
  constants already supplied by the package.
- Keep arithmetic on `Money` instances, not raw floating-point values.
- Preserve currency-aware operations by keeping same-currency checks on add and
  subtract behavior.

## Constraints To Preserve

- `Money.value` is the integer fixed-point representation.
- `add(...)` and `subtract(...)` require compatible currencies.
- `convert(rate, currency)` uses a positive finite rate and truncates to the
  nearest cent according to the current README.
- `toString()` is part of the readable external contract and currently shows
  currency when present.
- Keep the package lightweight; avoid replacing fixed-point logic with generic
  decimal libraries unless explicitly requested.

## Validation

- `npm -w asljs-money run test`
- `npm -w asljs-money run typecheck`
- `npm -w asljs-money run lint`

When public formatting or arithmetic behavior changes, update `README.md` and
this file together.
