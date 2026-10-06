# part-project-deps-diagram

Generate the workspace package dependency graph with `part` and replace the
hand-maintained `docs/Dependencies.md` graph with it.

Package: `part`.

## Context

Moved from `part/TODO.md`, where it read "Project deps as diagram".

Most of the pieces exist. `aftefacts/ASLJS Package.md` matches every published
package directory (`../{libs,apps}/*/`, excluding `apps/toolkit`) and declares
one property:

```markdown
### LocalDeps

- Type: Artefact[]
```

`aftefacts/parts/ASLJS Package.js` fills it from `package.json`:

```js
const repositoryRoot =
  path.resolve(artefact.path, '..');

const localDeps =
  Object.keys(dependencies)
    .filter(item => item.startsWith('asljs-'))
    .map(item => item.replace(/^asljs-/, ''))
    .map(item => path.resolve(repositoryRoot, item));
```

and `part inventory --format=diagram` draws an edge for each `Artefact[]` value
([UMB]). So this already renders:

```sh
npx part inventory --definitions aftefacts \
  --inventory-definitions="ASLJS Package" --format=diagram > deps.svg
```

Separately, `docs/Dependencies.md` holds a Mermaid `graph TD` of the packages,
written by hand.

## Problem

The generated graph is wrong and the hand-written one is stale.

- `repositoryRoot` is the package's parent, `libs` or `apps`, not the repository
  root. Every app's dependency resolves under `apps/`: `apps/part` gets
  `apps/locator` and `apps/logging`, which do not exist. The diagram drops a
  reference to a missing node without a word, so the rendered graph above has 12
  edges, all between libraries, and no app depends on anything.
- The name-to-directory mapping strips `asljs-` and assumes the rest is the
  directory name. That holds today but is not checked; the package's own `name`
  in each `package.json` is the actual key.
- Only `dependencies` is read. `asljs-testing` and `asljs-toolkit` appear only
  in `devDependencies`, so they have no incoming edges.
- `apps/toolkit` is private and so, correctly, not an `ASLJS Package`; but that
  leaves a correct reference to it with no node.
- `docs/Dependencies.md` lists 10 packages; the workspace in the root
  `package.json` has 18. `logging`, `testing`, `tmpdir`, `cog`, `dash`, `kb`,
  `sfmt` and `toolkit` are missing, and so is `locator --> logging`. Its edges
  run from the dependency to the dependent, the reverse of `part`'s.

## Options

### Data source

1. Fix `ASLJS Package.js`: read the workspace list from the root `package.json`,
   map each package's `name` to its directory, resolve `asljs-*` names through
   that map, and add a `LocalDevDeps` property for `devDependencies`.
   - Pro: a fix in this repository's definitions only; no `part` change.
   - Pro: uses the same model as every other artefact, so the graph also shows
     in `--format=json` and can be checked by rules.
   - Con: npm-workspace knowledge lives in one repository's definitions; another
     project has to copy it.
2. A built-in `part` command that reads npm workspaces directly.
   - Pro: works in any npm workspace without definitions.
   - Con: bypasses the definition model that every other `part` feature is built
     on, and ties `part` to npm.
3. Outside `part`: `npm query .workspace` or `npm ls --json --workspaces`, piped
   through a small script, or a monorepo tool's graph command.
   - Pro: npm resolves the graph itself.
   - Con: a second tool for something the definitions already almost do, and
     `npm ls` reports installed versions, not the declared graph.

### Keeping the document current

1. Regenerate `docs/Dependencies.md` with `--format=mermaid` ([UMB]) when
   packages change, by hand or from a `toolkit` command.
2. A rule on `ASLJS Package` or on the document that fails when the graph in
   `docs/Dependencies.md` differs from the generated one.
3. Delete the graph from `docs/Dependencies.md` and tell readers the command.

### Recommendation

Option 1 for the data, so the graph comes out of the existing model: `LocalDeps`
resolved through the workspace list, plus `LocalDevDeps`. Whether `apps/toolkit`
appears is a choice: it needs a definition of its own (a workspace package that
is not published), or its edges are left out on purpose. Then regenerate
`docs/Dependencies.md` with `--format=mermaid` and add the check in option 2 so
it cannot go stale again.

A reusable npm-workspaces package definition belongs in the presets task
([PRE]), not in `part`'s code.

## Points to settle

- Whether development dependencies are drawn, and if so as a distinct edge
  style. Mermaid draws `-.->` as a dotted edge, but `part`'s diagram has one
  edge kind today, so the property would need to say which style it uses
  ([STE]).
- Edge direction: dependent to dependency (what `part` draws) or the reverse
  (what `docs/Dependencies.md` draws).
- Whether to group nodes into `libs` and `apps` subgraphs ([STE]).

## Where

- `aftefacts/ASLJS Package.md` - the definition, `LocalDeps`, the `apps/toolkit`
  exclusion.
- `aftefacts/parts/ASLJS Package.js` - `getData`, with the wrong
  `repositoryRoot`.
- `package.json` - `workspaces`, the list of package directories.
- `docs/Dependencies.md` - the hand-written graph to replace.
- `apps/part/src/commands/inventory.ts` - `collectDiagramEdges`, which drops the
  unresolved references.

[UMB]: part-better-diagram-support.md
[STE]: part-entity-stereotypes.md
[PRE]: part-presets.md
