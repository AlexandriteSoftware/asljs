# Development

Notes on developing.

## How to squash and commit changes

To squash all local commits into a single commit and push to the remote
repository, use the following commands:

```bash
git checkout main
git fetch origin
git reset --soft origin/main
git commit -m "... commit message ..."
git push
```
