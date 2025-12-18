# Release

Each package is released separately. To release a package, `cd` into the package
directory and run the following commands:

```pwsh
npm test                    # Ensure all tests pass
npm version patch           # or 'minor' or 'major'
npm publish --access public # Publish to npm registry
```
