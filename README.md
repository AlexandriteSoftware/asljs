# asljs

Libraries, project tools, and productivity apps to enhance everyday development.
By Alexandrite Software Ltd. In JavaScript (with TypeScript).

Documentation site: [alexandritesoftware.github.io/asljs][SITE].

Applications:

- [app-builder][APPS] - builds this site from the repository's markdown files,
  and holds the sources of an AI-assisted app builder demo.
- [dash][DASH] - a personal performance dashboard fed by scheduled agents.

Tools:

- [board][BRD] - a planning board in markdown: develops ideas into plans and
  tasks, and carries the tasks out with an AI agent.
- [cog][COG] - AI agents context manager.
- [kb][KB] - knowledge base CLI and MCP server for markdown libraries.
- [part][PRT] - defines project artefacts in markdown and validates them with
  rules.
- [rq][RQ] - AI-assisted requirements management: runs the tests of requirements
  written in markdown, checks their coverage, and shows them as a graph.
- [artefacts][ART] - this repository's artefact definitions and the `part`
  plugin that checks them; private.
- [sfmt][SFMT] - code formatter for TypeScript.

Libraries:

- [components][CMP] - reusable web components.
- [data-binding][DBND] - declarative DOM bindings via `data-model`.
- [dali][DALI] - IndexedDB data layer with typed table abstractions.
- [eventful][EVT] - adds on/off/emit to any object.
- [locator][LOC] - locates files by glob patterns, exclusions and filters.
- [logging][LOG] - provides logging utilities.
- [machine][MCH] - provides a state-machine framework for organizing control
  flow.
- [mdcli][MDC] - building blocks for command-line tools that manage markdown
  documents with AI agents.
- [money][MNY] - provides utilities for handling monetary values.
- [observable][OBS] - makes any object emit events on property changes.
- [testing][TST] - test helpers: temporary environment variables and globals,
  waiting for a condition, and the test logger.
- [tmpdir][TDR] - provides temporary directory utilities for testing and
  development.

[CMP]: ./libs/components/README.md
[DBND]: ./libs/data-binding/README.md
[DALI]: ./libs/dali/README.md
[EVT]: ./libs/eventful/README.md
[LOC]: ./libs/locator/README.md
[LOG]: ./libs/logging/README.md
[MCH]: ./libs/machine/README.md
[MDC]: ./libs/mdcli/README.md
[MNY]: ./libs/money/README.md
[OBS]: ./libs/observable/README.md
[TST]: ./libs/testing/README.md
[TDR]: ./libs/tmpdir/README.md
[BRD]: ./apps/board/README.md
[COG]: ./apps/cog/README.md
[KB]: ./apps/kb/README.md
[ART]: ./aftefacts/README.md
[PRT]: ./apps/part/README.md
[RQ]: ./apps/rq/README.md
[SFMT]: ./apps/sfmt/README.md
[APPS]: ./apps/app-builder/README.md
[DASH]: ./apps/dash/README.md
[SITE]: https://alexandritesoftware.github.io/asljs/
