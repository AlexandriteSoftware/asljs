# rq view

Starts a web server for a requirement file or folder, and runs until stopped.

```text
rq view <path> [--port <port>]
```

The server serves the folder: `<path>` when it is a folder, the file's folder
otherwise. It listens on `127.0.0.1`.

- `/` - the index: the graph as a Mermaid diagram, its structure errors, and the
  list of documents with the status of each evidence. Clicking a node opens its
  document. The graph is read again on every request, so a reload shows the
  current files.
- `/<file>.md` - the document rendered as HTML. Its links to other `.md` files
  open them rendered.
- any other file of the folder is served as it is, e.g. an image a document
  shows.

Nodes outside the folder are drawn but do not open. The diagram is drawn by
Mermaid, loaded from `cdn.jsdelivr.net`; without it the index still lists the
documents.

## Options

- `--port <port>` - the port; 3000 by default, and 0 picks a free one. The
  address is printed when the server starts.
