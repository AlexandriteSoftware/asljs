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

## Versions

| Library    | Released   | Next  |
|------------|------------|-------|
| eventful   | [0.1.6][1] | 0.2.0 |
| machine    |     [-][2] | 0.1.1 |
| money      | [0.9.2][3] | 0.2.0 |
| observable | [0.1.4][4] | 0.2.0 |
| server     |     [-][5] | 0.1.0 |

[1]: https://www.npmjs.com/package/asljs-eventful
[2]: https://www.npmjs.com/package/asljs-machine
[3]: https://www.npmjs.com/package/asljs-money
[4]: https://www.npmjs.com/package/asljs-observable
[5]: https://www.npmjs.com/package/asljs-server
