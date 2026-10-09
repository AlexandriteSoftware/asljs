# R9 Reading values

GET /api/get/:key answers the newest value as text/plain, empty for a key never
written; with several comma-separated keys it answers a JSON object, null for a
key never written. /api/meta/:keys answers each key's ts, seen and value,
/api/history/:key the samples newest first with limit (500 by default, at
most 5000) and since, and /api/keys every key the stores hold.

## Implementation

- [T6 Reading values][T6]

[T6]: <tests/T6 Reading values.md>

## Coverage

R9 is fully covered by T6. The gap noted in the requirement's Coverage section,
that keys from a second project's database were never checked, is now closed by
T6's step "keys of every project".

R9 makes six statements:

1. "GET /api/get/:key answers the newest value as text/plain, empty for a key
   never written" is covered by T6, step "get". It checks that `Content-Type`
   starts with `text/plain`, that the body is `online`, and that `web.never`
   gives an empty body.
2. "With several comma-separated keys it answers a JSON object, null for a key
   never written" is covered by T6, step "get". It requests
   `web.manual,web.mem,web.never,bad%20key` and checks the exact object, with
   `null` for `web.never`.
3. "/api/meta/:keys answers each key's ts, seen and value" is covered by T6,
   step "meta and history". It checks that the fields are exactly `seen`, `ts`
   and `value`, that `seen >= ts`, and that a key never written is `null`.
4. "/api/history/:key the samples newest first" is covered by T6, step "meta and
   history". It checks the order `['2', '1']`.
5. "With limit (500 by default, at most 5000) and since" is covered by two T6
   steps:
   - "meta and history" checks that `limit=1` is honoured and that `since`
     filters the samples.
   - "history limits" writes 5001 samples, then checks 500 samples with no
     limit, exactly 5000 with `limit=6000`, and the newest sample first.
6. "/api/keys every key the stores hold" is covered by three T6 steps together:
   - "keys" calls `/api/keys` over HTTP and finds both a database key and a
     memory key.
   - "keys of every store" checks the database key, the memory key and that the
     list is sorted, through `store.keys()`.
   - "keys of every project" loads two projects with separate databases
     (`one.sqlite` and `two.sqlite`). It writes a declared key into one and an
     undeclared key into the other, and checks that `store.keys()` lists both.
     Reading the files directly confirms each key sits in its own database.

The route in `server.js` is just `res.json(store.keys())`, so the store-level
merge across databases, combined with the HTTP check in "keys", covers what the
endpoint answers.

These are optional ways to make the coverage tighter; they are not gaps:

- One test could combine two databases and a memory key, and check the sorted
  result over HTTP.
- The test behind "keys of every store" is named for "every configured database"
  but only configures one.
- R9's own Coverage and Status sections still report the old gap and are now out
  of date.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
