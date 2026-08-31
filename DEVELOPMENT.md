# Development

This file is the practical day-to-day workflow guide for working in `asljs`.

Use it for local setup, package-local validation, app-builder work,
documentation updates, generated output, and common repository tasks.

## Repo Setup

Install dependencies from the repository root:

```pwsh
npm ci
```

The repo is an npm workspace monorepo. Published libraries are validated and
released independently.

## Workspaces

Use the workspace map from `README.md`.

Prefer package-local commands from the repository root.

General pattern:

```pwsh
npm -w <workspace-name> run <script>
```

Examples:

```pwsh
npm -w asljs-eventful run test
npm -w asljs-observable run typecheck
npm -w asljs-components run lint
npm -w asljs-dali run build
npm -w asljs-part run test
```

Typical order for a library package:

1. `npm -w <package> run test`
2. `npm -w <package> run typecheck`
3. `npm -w <package> run lint`
4. `npm -w <package> run build` when emitted output matters

Publishable library packages expose a common script shape:

- `clean`
- `build`
- `build:test`
- `test`
- `test:watch`
- `typecheck`
- `lint`
- `lint:fix`
- `coverage`

Example:

```pwsh
$env:FOLDER = 'eventful'

npm -w $env:FOLDER run test
npm -w $env:FOLDER run typecheck
npm -w $env:FOLDER run lint
npm -w $env:FOLDER run build
```

### App Builder Commands

`app-builder` is a private browser app, not a publishable library.

Common commands:

```pwsh
npm -w asljs-app-builder run dev
npm -w asljs-app-builder run test
npm -w asljs-app-builder run typecheck
npm -w asljs-app-builder run build
```

Use `dev` while iterating on UI behavior. Use `build` when validating emitted
demo output or deployment behavior.

## Documentation Update Rules

Keep human-facing docs and AI-facing docs separate.

- `README.md` is for human usage, examples, and public behavior.
- `AGENTS.md` is for AI-facing constraints, package boundaries, and validation
  guidance.
- `DEVELOPMENT.md` is for contributor workflow.
- `RELEASE.md` is about publishing packages.

Use these rules when deciding which of `README.md`, `AGENTS.md`, and tests must
change together:

- If public behavior or a package-root API changed, then update tests.
- If public behavior changed in a way users need to understand, then update
  `README.md`.
- If public behavior changed in a way AI needs to preserve, validate, or avoid
  breaking, then update `AGENTS.md`.
- If the change is an internal refactor only, then update tests when behavior
  risk exists.
- If the change is an internal refactor only, then usually do not update
  `README.md` or `AGENTS.md`.
- If build, release, or deployment behavior changed and executable behavior was
  affected, then update tests where that behavior is checked.
- If build, release, or deployment behavior changed for human workflow, then
  update the relevant workflow docs.
- If build, release, or deployment behavior changed in a way AI needs to know
  for validation or execution, then update `AGENTS.md`.
- If only generated output changed, then do not update source docs or tests just
  for the generated diff.

When behavior changes:

- Update tests for the affected package.
- Update package `README.md` if user-facing behavior, examples, or usage
  guidance changed.
- Update package `AGENTS.md` if AI-facing constraints, preserved contracts, or
  validation guidance changed.
- Update workflow docs when build, release, or deployment behavior changes.

If a generated file changes because source behavior changed, update the source
tests and source docs based on the underlying behavior change rather than on the
generated diff itself.

Internal refactors do not require README updates unless public behavior or usage
expectations changed.

## Generated Files And Publish Output

Important generated or published folders:

- workspace `build/` folders are build output, for testing and validation
- workspace `dist/` folders are distributable output

`app-builder` builds into `app-builder/dist/`. The deployment workflow then
force-pushes the contents of that folder to the `pages` branch root.

Useful commands:

```pwsh
npm -w asljs-components run clean
npm -w asljs-components run build
npm -w asljs-app-builder run build
```

Do not hand-edit files under `build/` or `dist/` unless the task is explicitly
about generated output.

## How To Squash And Commit Changes

To squash all local commits into a single commit and push to the remote
repository, use the following commands:

```pwsh
$env:BRANCH = "main"  # or your target branch name
git checkout $env:BRANCH
git fetch origin
git reset --soft origin/$env:BRANCH
git commit -m "... commit message ..."
git push
```

## How to get all changes in subfolder since a specific tag

```pwsh
# Show all commits that changed a subfolder since a tag:
git log <tag>..HEAD -- path/to/subfolder

# Show changed files
git diff --name-status <tag>..HEAD -- path/to/subfolder

# Show the complete patch between the tag and HEAD for a subfolder
git diff <tag>..HEAD -- path/to/subfolder

# Show the complete patch between the tag and working folder for a subfolder
git diff <tag> -- path/to/subfolder

# Compact commit history
git log --oneline <tag>..HEAD -- path/to/subfolder

# Include changes from commits reachable from either side
git diff <tag>...HEAD -- path/to/subfolder
```
