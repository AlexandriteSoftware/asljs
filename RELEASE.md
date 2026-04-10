# Release

Each package is released separately, from the repository root.

Release prerequisites:

- Ensure all package tests pass (`npm -w <pkg> test`)
- Ensure the repository is clean (`git status`)

## Example: package release

Make sure that **release prerequisites** are met (see above).

```pwsh
# 1) Set release variables
$env:FOLDER = 'eventful' # 'observable', 'data-binding', 'money'

# 2) Bump and get package version (replace 'patch' with 'minor' or 'major')
npm -w $env:FOLDER version patch --no-git-tag-version
$env:PACKAGE = (Get-Content "$env:FOLDER/package.json" -Raw | ConvertFrom-Json).name
$env:VERSION = (Get-Content "$env:FOLDER/package.json" -Raw | ConvertFrom-Json).version
$env:PACKAGE_VERSION = "${env:PACKAGE}@${env:VERSION}"

# 3) Commit version changes
git add $env:FOLDER/package.json $env:FOLDER/package-lock.json package-lock.json
git commit -m "release $env:PACKAGE_VERSION"

# 4) Push commit first
git push

# 5) Publish package
#
# npm publish hooks and actions:
#
# 1. prepublishOnly (hook)
#      node ../toolkit.js ensure-clean-working-folder
# 2. prepack (hook)
#      node ../toolkit.js clean-dist
#      npx tsc -p tsconfig.build.json
# 3. prepare (hook)
# 4. pack (action)
# 5. postpack (hook)
# 6. publish (action)
# 7. postpublish (hook)
#      node ../toolkit.js tag-commit-with-release-id
#
# Reference: https://docs.npmjs.com/cli/v11/using-npm/scripts
#
npm -w $env:FOLDER publish

# 6) Push that tag to origin
git push origin "$env:PACKAGE_VERSION"
```
