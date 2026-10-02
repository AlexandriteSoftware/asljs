# Skills

Procedure an agent fetches when a request calls for it. One file per skill,
named after the work it covers.

A skill file opens with a `Use when` line, which is what an agent matches
against before reading the rest. Everything after it is the procedure: what to
do, in what order, and what to report.

[AGENTS.md](../AGENTS.md) indexes these and applies always. A skill applies
only to the kind of work it names.
