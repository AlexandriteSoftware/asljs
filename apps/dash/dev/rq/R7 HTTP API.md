# R7 HTTP API

The server is an Express app listening on the port PORT names. Its API is
textual and curl-friendly, and validates nothing but the key pattern.

## Implementation

- [R8 Writing values][R8]
- [R9 Reading values][R9]
- [R10 Countdown][R10]
- [R11 Dashboards and assets][R11]
- [T18 Server][T18]

[R8]: <R8 Writing values.md>
[R9]: <R9 Reading values.md>
[R10]: <R10 Countdown.md>
[R11]: <R11 Dashboards and assets.md>
[T18]: <tests/T18 Server.md>

## Coverage

R7 is now fully covered. The coverage section in the R7 file is out of date: it
still discusses "on PORT, 3000 by default", but R7 no longer says that. It now
only says the server listens on the port PORT names, and T18 has since been
linked to check it.

R7 makes four statements:

- **"The server is an Express app"** describes how it is built, not what it
  does. T18 runs `src/server.js` as a program and gets answers from it over
  HTTP. Every route in R8 to R11 is served by that app, which is enough for this
  statement.
- **"listening on the port PORT names"** is covered by T18. Its step "server as
  a program" uses the test in `src/server.test.js` that starts `server.js` with
  `PORT` set to a free port. The test checks that the server logs `dash server
  on http://localhost:<port>`, then reads `/api/get/proc.start` on that port and
  gets the counter's value back. The 3000 default in `src/server.js:7` is no
  longer part of R7, so nothing needs to check it.
- **"Its API is textual and curl-friendly"** is covered by R8 and R9:
  - R8, tested by T5: a PUT stores the body as text whatever its content type
    and sends it back unchanged.
  - R9, tested by T6: a single value comes back as text/plain, and a key never
    written comes back empty.
  - R9 and R10 also answer keys they don't know with empty or null, not with an
    error.
- **"validates nothing but the key pattern"** is covered by R8:
  - Key pattern: a key outside the pattern gets a 400, checked by T5.
  - Nothing else: any body is accepted whatever its content type, also in T5.
  - R9 caps a large `limit` at 5000 instead of rejecting it, which fits the
    statement.

The sub-requirements have gaps of their own:

- **R9:** nothing checks the history `limit` default of 500 or its cap of 5000,
  and `/api/keys` is checked against only one store.
- **R10:** nothing pins the five-second line between due and stale.
- **R11:** no test shows a config error appearing in `/api/dashboards`, and no
  test requests the database files to show they are not served.

None of these gaps leaves a statement of R7 uncovered. They belong to the
coverage of R9, R10 and R11.

Two pieces of upkeep, neither a coverage gap:

- **T18's step name** is shorter than the test's real name. The test is
  "server.js as a program opens every configured database at startup, listens on
  PORT, and runs the counters with --with-runner". It currently passes, so the
  shorter name matches, but spelling it out in full would be clearer.
- **R7's coverage section** should be rewritten to match the current wording and
  the T18 link.

Verdict: R7 is fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
