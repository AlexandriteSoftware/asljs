# Package README

The landing page of a workspace package.

Write it for someone meeting the package for the first time, with no prior
knowledge, who is deciding whether it is for them. That reader is the test:
every sentence has to be useful to them, at that moment.

They are looking for answers to roughly these questions, in this order:

1. Is it for me? Does what it does fit my needs?
2. How do I install it?
3. What does using it look like?
4. Where do I find more information or help?

Answer more than that where it genuinely helps the decision -- what it
deliberately does not do, what it costs, what it depends on, how mature it is,
the licence. Do not pad the file with anything that only matters once the
decision is already made.

Prefer positive statements. Say what the package is and does, and state limits
as scope rather than as negations: "Wildcard event names are out of scope", not
"Wildcard event names are not supported" or a "Not supported:" list. Do not
suggest looking elsewhere: no "Look elsewhere if", "Use something else when", or
recommendations of other libraries. `Related packages`, which links other
packages of this repository, is not affected.

Keep each section to what a junior developer can digest in three minutes. A few
small examples, not a catalogue.

Everything else belongs in the package's `docs` directory: the full API surface,
edge cases, payload and event reference, migration notes, rationale for design
decisions, trade-offs, and performance characteristics. Link to it.

Leave process and meta information out entirely. How the examples are verified,
how the package is built, which test covers which claim, and what the roadmap is
are all irrelevant to that reader. They belong in `docs`, `AGENTS.md`,
`HOWTO.md`, or `tasks/`.

## Heading style

The questions above are what a section answers, not what it is called. Name
sections with the conventional, understated noun a reader already expects, and
let the prose do the work.

Avoid headings phrased as a question the reader is being asked, and avoid
headings that narrate the file: `Is it for you?`, `What it does`,
`Where it
fits`, `Examples`, `Documentation`.

Pick the heading that covers the whole section. A section carrying both what the
package suits and what it does not is `Scope`, not `Purpose` or `Motivation`,
which describe only the first half.

Keep the same names across packages. A reader moving between two of them should
find the same five or six headings in the same order. A package with nothing to
say about a section simply leaves it out.

## Location

- Pattern: `../{libs,apps}/*/README.md`
- GitIgnore

## Rules

### RL1

Every level 2 heading is one of `Overview`, `Scope`, `Installation`, `Usage`,
`Further reading`, `Related packages` and `License`, matched exactly, including
case.

### RL2

The level 2 headings appear in that order. A heading may be absent, and no
heading may repeat.
