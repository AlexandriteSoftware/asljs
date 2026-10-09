# R5 Sample policy

Every key is bounded by a policy "<store>, <retention>, <count>, <quota>": store
memory, kept only in the server's process, or database; retention counted from
seen, with s, m and h; count with k, M and G; quota of the values in UTF-8
bytes, with Kb, Mb and Gb. Suffixes are case-insensitive, a field may be a
product such as 90*24h, and every field must be greater than zero. A counter's
policy overrides its project's, which defaults to "database, 90*24h, 100k,
100Mb". The oldest sample goes first whichever limit bites, but the quota never
evicts the newest sample. Limits apply on every read and write, and a sweep
applies them to every key, so a key nobody writes still ages out.

## Implementation

- [T3 Sample policy][T3]

[T3]: <tests/T3 Sample policy.md>

## Coverage

R5 is fully covered by T3. The three gaps that the old Coverage section of R5
lists have all been closed since it was written, so that section and its Status
line are out of date.

- **The four-field form "<store>, <retention>, <count>, <quota>".** T3's
  "policy" step parses it. The "bad policy" step rejects a policy without four
  fields.
- **The two stores, memory and database.** The "policy" step parses both, and
  the "bad policy" step rejects an unknown store. The count, retention, quota
  and sweep steps run in both stores.
- **Memory is kept only in the server's process.** The new "on write and memory"
  step covers this. It puts samples under a memory policy, closes the store,
  reads the SQLite file directly, and finds no rows for that key.
- **Retention is counted from seen.** The "retention" step covers this.
- **Retention suffixes s, m and h.** The "policy" step uses 30s, 24h and 1m. The
  "amounts" step uses 24h and 2 * 1.5m.
- **Count suffixes k, M and G.** The "policy" step uses 2k and 1G. It now also
  checks that "memory, 1h, 2M, 1Kb" has count 2000000, which closes the earlier
  gap for M.
- **Quota suffixes Kb, Mb and Gb.** The "policy" step uses 2*512Kb, 10Mb and
  1gb.
- **Quota is counted in UTF-8 bytes.** The "quota" step covers this.
- **Suffixes ignore case.** The "amounts" step uses 24H. The "policy" step uses
  1gb and Database.
- **A field can be a product.** The "amounts" step uses 90*24h and 2 * 1.5m. The
  "policy" step uses 2*512Kb.
- **Every field must be greater than zero.** The "bad amounts" step rejects 0
  and -1h. The "bad policy" step rejects a zero limit.
- **A counter's policy overrides its project's.** The "policy per counter" step
  covers this.
- __The project default is "database, 90*24h, 100k, 100Mb".__ The "default
  policy" step checks what the constant parses to. The "project default" step
  checks that a project with no policy gets it.
- **The oldest sample goes first whichever limit bites.** The "count", "quota"
  and "retention" steps cover this.
- **The quota never evicts the newest sample.** The "quota" step covers this.
- **Limits apply on read.** The "retention" step trims through history and get
  without writing anything first.
- **Limits apply on write.** The new "on write and memory" step covers this. It
  puts three samples under a count of 2, closes the store without reading, and
  finds only the newest two rows in the SQLite file.
- **A sweep applies the limits to every key, so a key nobody writes still ages
  out.** The "sweep" and "moved to memory" steps cover this.

One limit on that coverage: the write test checks trimming on write only in the
database store. In the memory store, trimming on write cannot be seen apart from
trimming on read, so I count the statement as covered.

Next step: the Coverage section and the "Coverage: INCOMPLETE" line in R5's
Status are stale and should be regenerated. They still report the three gaps
that T3's new step and the new M assertion now cover.

Verdict: fully covered.

## Status

- Result: PASS
- Coverage: COMPLETE
