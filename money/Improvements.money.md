# Improvements For asljs-money

This review answers two questions for `asljs-money`.

This package already explains its financial intent reasonably well. The main AI
improvement is making arithmetic rules, export shape, and currency behavior even
more explicit so agents do not fall back to generic number-handling habits.

## 1. How to make it more suitable for an AI agent without looking for extra information?

### Current situation

The package already has useful package-local information:

- `README.md` explains fixed-point money behavior and key methods
- `AGENTS.md` explains the factory-based surface and preserved constraints
- `package.json` confirms that the package root is the only public entrypoint

This is a good base. The main remaining issue is that AI agents often bring
incorrect habits into money libraries, especially:

- using raw floating-point arithmetic
- assuming currency conversion is automatic in all operations
- assuming helper functions are exported individually
- assuming rounding semantics instead of truncation semantics

Suggested improvements:

### 1. Add a "public API at a glance" section

This package would benefit from a very compact summary near the top of the
README and AGENTS.

It should answer:

- what the root export is
- what is created through the `money` factory
- which constants live on the factory
- which methods are on `Money` instances

Reasoning:

The current AGENTS file already hints at an important fact: most behavior is
exposed through the `money` factory and `Money` instances, not many separate
named exports. That fact should be impossible to miss.

### 2. Add a "do not use raw numbers for money math" rule near the top

This package should say clearly and early:

- create `Money` values first
- do arithmetic on `Money`
- convert to numbers or strings only at presentation or interop boundaries

Reasoning:

This is the most important behavioral safeguard for AI usage. If the package
does not say this prominently, the model may still compute with numbers and
only wrap values later.

### 3. Add a creation-method decision table

Examples:

- already have minor units: `money.fromMinor(...)`
- already have major units as integer-like amount: `money.fromMajor(...)`
- have human-readable string: `money.fromString(...)` or `money.parse(...)`
- have JS number input: `money.fromNumber(...)`
- already have `Money`: `money(existing)` if supported by current contract

Reasoning:

The README lists creation methods, but a decision table would make selection
faster and reduce guesswork.

### 4. Add an explicit rounding and conversion contract section

The README says `convert(rate, currency)` truncates to the nearest cent. That is
important and should be very prominent.

Reasoning:

AI often assumes round-half-up or banker’s rounding by default. If truncation is
the contract, that must be repeated in a highly visible place.

### 5. Add a clear currency-compatibility section

The docs should state explicitly:

- `add(...)` and `subtract(...)` require compatible currencies
- conversion must be explicit
- operations do not silently reconcile different currencies

Reasoning:

This is a correctness boundary. AI should not be left to infer currency rules
from examples alone.

### 6. Add a package-local edit-safety checklist

Suggested checklist:

- if touching formatting, re-check `toString()` with and without currency
- if touching arithmetic, re-check currency compatibility rules
- if touching conversion, re-check positive finite rate validation and
  truncation behavior
- if touching constructors or parsers, re-check factory method expectations

Reasoning:

This package is small enough that a short checklist covers most of the public
behavior with very little maintenance cost.

## 2. How to make the information about the package more useful for AI agents so they guess less, make less errors, and improve discoverability and usage?

Current situation:

The package information is useful, but some important constraints are still
buried in explanation text instead of shaped as quick AI decisions.

The most important questions an AI agent has here are usually:

- how do I construct values safely?
- when do I use each creation method?
- what is the rounding rule?
- can I add different currencies?
- what is exported directly and what lives on the factory?

### Suggested improvements

### 1. Add a "common wrong assumptions" section

Good entries would be:

- do not use raw JS numbers for money arithmetic
- do not assume different currencies can be combined directly
- do not assume conversion uses a general rounding policy other than the
  documented truncation rule
- do not assume many standalone helper exports exist
- do not treat `toNumber()` as the preferred arithmetic path

Reasoning:

Money libraries are a classic place where AI can sound plausible and still be
wrong. A short wrong-assumptions section would prevent many subtle mistakes.

### 2. Add a glossary for package terms

Useful terms to define:

- minor units
- major units
- fixed-point value
- currency-aware money
- truncation
- factory

Reasoning:

The package uses intuitive terms, but AI becomes more consistent when the terms
are defined explicitly and tied to the package’s own model.

### 3. Add a stronger route map for neighboring concerns

Examples:

- use `asljs-money` for precise money arithmetic
- do not use generic number utilities for financial calculations
- use application formatting or UI packages separately for presentation-layer
  concerns beyond this package’s string output

Reasoning:

This improves discoverability by helping the AI stop using the package beyond
its intended scope.

### 4. Add a small behavior matrix

A table could cover:

- creation method
- input kind
- output kind
- key rule

And another small table could cover:

- operation
- same-currency required?
- conversion involved?
- notable formatting or rounding behavior

Reasoning:

Tables are very effective for AI because they turn implicit relationships into
scan-friendly structure.

### 5. Add one realistic end-to-end example

The package would benefit from one complete example that shows:

- parsing or construction
- arithmetic
- currency check or conversion
- string output

Reasoning:

AI often copies the richest example. A realistic example would reduce the chance
of mixing raw numbers and `Money` instances incorrectly.

### 6. Add a "safe usage rules" section

This should guide AI when writing downstream code.

For example:

- construct `Money` early
- keep domain arithmetic in `Money`
- convert or stringify late
- make currency conversion explicit
- avoid describing undocumented rounding behavior

Reasoning:

This package is more often consumed than edited. Safe usage guidance is therefore
high value.

## Recommended first changes

If only a few changes are made, I would do these first:

1. Add a public API summary near the top.
2. Add a strong "do not use raw numbers for money math" rule.
3. Add a common wrong assumptions section.
4. Add a visible conversion and truncation contract section.

## Summary

`asljs-money` already explains the package purpose well. The next improvement is
to make correctness-critical rules impossible to miss.

The package should help an AI answer these questions immediately:

- what is actually exported?
- which creation method should I use?
- what arithmetic should stay on `Money` instances?
- what are the currency rules?
- what is the conversion and truncation behavior?

If those answers become more visible, AI agents will guess less, make fewer
financial-modeling mistakes, and use the package more safely.
