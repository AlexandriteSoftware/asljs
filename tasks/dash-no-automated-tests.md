# No automated tests

Package: `dash`. Moved from the root `TODO.md`, and rewritten for the code as it
now stands.

The package moved into the repository without any, and `CONVENTIONS.md` expects
a test file next to every file with runtime behaviour. There is still no test
file in `dash/`.

The cheapest first slice is the pure logic, which is now spread wider than when
this was first written:

- `samples.js` — `parsePolicy` and `parseAmount`, both exported. Unchanged since
  the item was written.
- `cron.js` — `parse`, `matches`, `next` and `previous`, all exported. `next`
  and `previous` are worth the most: they drive the card countdown, and their
  day and hour skipping has boundary cases that `matches` does not.
- `config.js` — the validation and the key routing: a duplicate key across two
  configs, a counter with a schedule but no command, a malformed file among good
  ones, and `projectOf` falling back to the first project.
- `store.js` — the trimming rules. These now route through
  `config.projectOf(key).db` rather than `DASH_DB`, so a store test has to load
  a config naming a temporary database. `asljs-tmpdir` is already a repository
  dev dependency and fits.

The `/api/next` state machine in `server.js` is the other untested surface worth
naming: it decides `wait`, `due` and `stale` from a schedule and a sample's
`seen`, and it was verified by hand against a running server, not by a test.
