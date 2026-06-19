# DEVELOPMENT

PART artefacts are managed using PART itself. This is the perfect example of how
to use PART and experience first-hand the benefits of having a clear definition
of what an artefact is, where it is stored, and what rules and conventions apply
to it.

## Releasing

For `asljs-part`, the package is intentionally source-published JavaScript, so
`typecheck`, `clean`, and `build` are lightweight package-local scripts that
preserve the shared release workflow contract without introducing a TypeScript
or transpilation step.

## Testing

Run all tests:

```pwsh
npm run test
node --test
```

Run tests that match a pattern:

```pwsh
npm run test -- --test-name-pattern="Article_RL2"
node --test --test-name-pattern="Article_RL2"
```


