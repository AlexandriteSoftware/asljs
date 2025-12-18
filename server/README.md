# asljs-server

A lightweight development-time static files server with live-reload (SSE) and
a filesystem read/write API.

## CLI

After installing:

- `asljs-server`

Or without installing:

- `npx asljs-server`

### Examples

- Serve current folder on port 3000:
  - `asljs-server`

- Serve a specific folder:
  - `asljs-server ./public`
  - `asljs-server --root ./public`

- Change port/host:
  - `asljs-server --port 8080`
  - `asljs-server --host 0.0.0.0 --port 8080`

## JSON API

- `GET /api/json?file=name[.json]` returns the JSON file
- `PUT|POST /api/json?file=name[.json]` writes JSON (pretty-printed)

## Live reload

HTML pages get a small client injected that listens on:

- `GET /__events`
