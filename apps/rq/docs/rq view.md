# rq view

Starts a web server for a requirement file or folder, and runs until stopped, by
SIGINT (Ctrl+C) or SIGTERM.

```text
rq view <path> [--port <port>] [--working-dir <folder>]
```

The server serves the folder: `<path>` when it is a folder, the file's folder
otherwise. It listens on `127.0.0.1`.

- `/` - the index: the graph as a left-to-right Mermaid diagram of the
  requirements and tests and their `## Implementation` links, its structure
  errors, and the list of nodes with their status and coverage. Other documents
  are not drawn. Each node's border shows its state:
  - colour, from the recorded result - neutral grey for one not run, green for
    one that passed, red for a failed test, amber for a requirement failing
    because of what it links to;
  - style, from `rq coverage` - solid for a test and for a requirement whose
    coverage is complete, dashed for one that is incomplete, dotted for one
    never checked.

  Clicking a node opens its document. All roots are in the one diagram; the page
  is titled with the root's heading when there is one root, `Requirements`
  otherwise. The graph is read again on every request, so a reload shows the
  current files.
- `/<file>.md` - the document rendered as HTML. Its links to other `.md` files
  open them rendered.
- any other file of the folder is served as it is, e.g. an image a document
  shows.

The server is for local use: it serves every file inside the folder, including
hidden ones, and renders the documents' HTML as it is.

Nodes outside the folder are drawn but do not open. The diagram is drawn by
Mermaid, loaded from `cdn.jsdelivr.net`; without it the index still lists the
documents.

## Options

- `--port <port>` - the port, exactly: one in use is an error, and 0 picks any
  free one. Without it, the first free port from 3000 on, up to 3099. The
  address is printed when the server starts.
- `--working-dir <folder>` - the working folder, whose `.rq` folder holds the
  results; see [Working folder][WF]. The results are read again on every request
  for `/`.

[RM]: Requirements.md
[WF]: Requirements.md#working-folder
