# cog-with-env-helper-not-shared

`withEnv`, which sets environment variables for one test and restores them, is
private to cog.

Package: `cog`.

`apps/cog/src/testing/test-helpers.ts` has `withEnv(updates, action)`. It is
under `src/testing`, so it is not published. Tests elsewhere that read
configuration from the environment save and restore `process.env` by hand
(EdGames' `server/src/config.unit.test.ts`), and the configuration tests
proposed in [logging-test-logger-provider][TLP] need the same thing.

Decide where a shared test helper lives. If no package fits, leave it in cog
and close this task; a second copy is cheaper than a package for one function.

## Where

- `apps/cog/src/testing/test-helpers.ts`

[TLP]: logging-test-logger-provider.md
