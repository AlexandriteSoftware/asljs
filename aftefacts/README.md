# asljs-artefacts

The artefact definitions of this repository and the `part` plugin that checks
them. Private; not published.

## Overview

Each `*.md` file in this folder whose level 1 heading matches its file name is
an artefact definition: what a kind of file is, where it lives, and the rules it
follows. `src/plugin.ts` reads these documents and implements the rules that can
be checked in code. The remaining rules can be checked with an AI agent.

## Usage

From the repository root:

```pwsh
npm -w asljs-artefacts run build:dist
npx part check --definitions aftefacts --definitions "asljs-part;Article,Unit Test File"
```

`Article` and `Unit Test File`, which the rules here also apply to, are built
into `asljs-part`.

Bump `version` in `src/plugin.ts` when a rule implementation changes, so cached
check results of its rules are discarded.
