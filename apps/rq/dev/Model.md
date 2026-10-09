# Model

Why the graph is shaped as it is.

- The two relationships are deliberately asymmetric. Requirement to requirement
  is many to one, an aggregation: the requirements form a strict hierarchy, and
  a second parent is a structure error (`loadGraph`) that `rq link` refuses.
  Requirement to test is many to many: a test is a shared, flat check that any
  number of requirements may link to.
- Only a requirement's `## Implementation` list makes edges. Neither side links
  back: a requirement does not name its parent, and links in a test are
  references, so moving or renaming nodes only rewrites links, never structure
  held elsewhere.
- The file name is the kind (`getNodeKind`), so a document's role is visible
  without reading it, and ids (`getNodeId`) are stable across renames.
