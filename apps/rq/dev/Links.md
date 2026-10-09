# Links

How links are read, resolved and written.

- `## Implementation` edges include reference links whose definition is
  elsewhere in the document (`RqDocument.implementation`); `links` holds every
  local `.md` link, for rewriting.
- A target is resolved relative to the document; a `#` fragment is dropped and
  percent-encoding is decoded (`splitLocalUrl`). `rq` writes targets in angle
  brackets when they have spaces or parentheses (`formatUrl`).
- The scope, and the search for ids and names (`resolveTarget`), skip folders
  whose name starts with `.` - so `.rq` - and `node_modules`.
