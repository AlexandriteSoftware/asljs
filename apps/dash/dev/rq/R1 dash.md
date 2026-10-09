# R1 dash

dash is a personal dashboard: agents collect values on a schedule, a server
stores them, and one web page shows them as cards on tabs. Each project is one
config file, and several projects are loaded at once. The collecting side and
the page are joined only by the HTTP API and the key namespace.

## Implementation

- [R2 Values and samples][R2]
- [R7 HTTP API][R7]
- [R12 Project configuration][R12]
- [R15 Runner][R15]
- [R16 Page][R16]
- [R21 Git agent][R21]

[R2]: <R2 Values and samples.md>
[R7]: <R7 HTTP API.md>
[R12]: <R12 Project configuration.md>
[R15]: <R15 Runner.md>
[R16]: <R16 Page.md>
[R21]: <R21 Git agent.md>

## Coverage

R1 is fully covered. Its current statement no longer contains "one user on one
machine", "no accounts" or "no alerting", so the gaps listed in R1's own
Coverage section are out of date. That section should be rewritten next time the
file is edited.

Below is each statement of R1 and what covers it:

- "dash is a personal dashboard" only says what the product is. It asks for no
  behaviour of its own, and the statements after it give it its content.
- "agents collect values on a schedule" is covered by R15 and R21 together. R15
  says the runner runs each counter's command on its schedule, checked at the
  top of every minute, plus the startup counters and --once. R21 says what an
  agent produces: git.ps1 prints its value on stdout and exits 0.
- "a server stores them" is covered by R2 and R7. R2 says every key belongs to
  one project and its samples are kept in that project's store, and R3–R6 sit
  under it. R7 says the server is an Express app whose API stores and reads
  values, with R8 for writing.
- "one web page shows them as cards on tabs" is covered by R16. It requires one
  static page that shows the tabs of every loaded project and the cards of the
  active tab, with R17 below it.
- "Each project is one config file" is covered by R12, which says a project is
  one JSON config naming the project, its database, its policy, its counters and
  its tabs.
- "several projects are loaded at once" is covered by R12 through R13. R13 has
  the server and the runner load every --config in order, and requires project
  names, keys and tab names to be unique across every loaded config.
- "the collecting side and the page are joined only by the HTTP API and the key
  namespace" is covered by several linked requirements together:
  - R15 says the runner puts stdout to the key over HTTP, even inside the server
    with --with-runner.
  - R19, under R16, has the page read values and countdowns through the API.
  - R7 makes the API the server's textual surface.
  - R3, under R2, makes a key name one value across every loaded config, which
    is the global key namespace.

No single requirement states the "only" in that last statement. To make the
trace explicit, R1's Coverage could name R3 and R19 next to it.

Some of the linked requirements are themselves incomplete. R2, R7, R12, R15, R16
and R21 each record gaps in their own coverage, such as the PORT default, the
DASH_URL default and the project-level policy. Those gaps sit at their own
level. None of them leaves one of R1's statements without a requirement that
states it.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
