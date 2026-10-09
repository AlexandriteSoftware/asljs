# Development

How `rq` works inside, why it is built that way, and how it got here. The
user-facing behavior is in [docs][DC]; these pages are for changing `rq`.

- [Model][model] - why the graph is shaped as it is.
- [Links][links] - how links are read, resolved and written.
- [Results and status][results] - how results are recorded, kept and turned into
  statuses.
- [Steps][steps] - how the steps of a test are read and run.
- [AI agents][agents] - how an AI agent is chosen and asked.
- [Post-processing][post] - how the markdown `rq` writes is handed to the
  project's tools.
- [History][history] - how `rq` got to its current shape.

The requirements of `rq` itself, and the tests that check them, are in [rq][RQ]:
run `node ../../bin/rq.js test .` and `node ../../bin/rq.js coverage .` in
`dev/rq` after `npm -w asljs-rq run build` and `npm -w asljs-rq run build:dist`.

[model]: Model.md
[links]: Links.md
[results]: <Results and status.md>
[steps]: Steps.md
[agents]: <AI agents.md>
[post]: Post-processing.md
[history]: History.md
[DC]: ../docs/Requirements.md
[RQ]: <rq/R1 rq.md>
