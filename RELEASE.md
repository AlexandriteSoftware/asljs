# Release

Each package is released separately. To release a package, `cd` into the package
directory and run the following commands (replace `server` with the desired
package name):

```pwsh
npm -w server test          # Ensure all tests pass
npm -w server version patch # or 'minor' or 'major'
npm -w server publish       # Publish to npm registry
```
