# Architecture

The monorepo is organized as small packages with explicit workspace boundaries.
Published libraries expose a single package-root entrypoint through
`package.json#exports`. Internal source files remain implementation details
unless a package README states otherwise.
