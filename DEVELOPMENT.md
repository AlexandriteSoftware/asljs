# Development

Notes on developing.

## How to squash and commit changes

To squash all local commits into a single commit and push to the remote
repository, use the following commands:

```pwsh
$env:BRANCH="main"  # or your target branch name
git checkout $env:BRANCH
git fetch origin
git reset --soft origin/$env:BRANCH
git commit -m "... commit message ..."
git push
```
