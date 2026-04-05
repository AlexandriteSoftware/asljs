# Release

Each package is released separately. To release a package, `cd` into the package
directory and run the following commands (replace `eventful` with the desired
package name):

```pwsh
npm -w eventful test          # Ensure all tests pass
npm -w eventful version patch # or 'minor' or 'major'
npm -w eventful publish       # Publish to npm registry
```
