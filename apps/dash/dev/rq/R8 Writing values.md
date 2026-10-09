# R8 Writing values

PUT /api/put/:key stores the request body as text, whatever its content type,
and echoes it; POST on the same path and /api/set/:key are aliases. The response
header X-Dash-Changed says whether a sample was added. A key outside the key
pattern is answered with 400.

## Implementation

- [T5 Writing values][T5]

[T5]: <tests/T5 Writing values.md>

## Coverage

R8 has four statements. All are covered by the two steps of T5, both in
`src/server.test.js`.

- **PUT stores the body as text whatever its content type, and echoes it.**
  Covered by T5 step "put". It sends `{"a":1}` with `Content-Type:
  application/json` and gets status 200 and the same text back. A later
  `/api/get` returns that text unchanged, so the JSON body was stored as text
  and not parsed. The alias calls send a body with no explicit content type
  (fetch's default text type), and they are handled the same way.
- **POST on the same path and /api/set/:key are aliases.** Covered by T5 step
  "put". It repeats the same body through POST `/api/put`, PUT `/api/set` and
  POST `/api/set`. Each answers `X-Dash-Changed: false`, which shows all three
  reach the same store as the first PUT and compare against its sample.
  - This step only checks the header on the aliases, not their echoed body.
  - It never makes an alias write a new value.
  - To make the alias check stronger, assert that each alias echoes the body,
    and have one alias write a different value that answers `true` and is then
    read back.
- **X-Dash-Changed says whether a sample was added.** Covered by T5 step "put".
  The first write answers `true`, and repeating the same value answers `false`.
- **A key outside the key pattern is answered with 400.** Covered by T5 step
  "invalid key". A PUT to `bad key` answers 400 with `invalid key`.

Every statement of R8 is covered by T5. The only weakness is the alias check
above, and it does not leave any statement uncovered.

## Status

- Result: PASS
- Coverage: COMPLETE
