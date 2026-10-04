# File

`asljs-file` (`FileView`) renders one file through an ordered list of display
handlers.

## Properties

- `provider` — `provider.loadFile(fileName)` returns normalized file data;
  `provider.saveText(...)` persists edits when text editing is used
- `handlers` — ordered from most specific to most general
- `fileName` — the file to show

The component asks the handlers in order whether they can display the file, and
the first match renders it. The component itself does not hard-code file types:
those decisions belong to the handlers, and providers abstract file lookup and
optional text persistence.

## Handlers

The package provides these handler factories:

- `createPdfFileHandler()`
- `createImageFileHandler()`
- `createTextFileHandler()`
- `createTextEditorFileHandler()`

If no handler matches, the component shows fallback "Preview unavailable"
content, and an Open link when blob or data-url content is available.

## Usage

```ts
import 'asljs-components';
import {
    createImageFileHandler,
    createPdfFileHandler,
    createTextFileHandler,
  } from 'asljs-components';

const fileView =
  document.createElement('asljs-file') as HTMLElement & {
    provider: {
      loadFile: (fileName: string) => Promise<unknown>;
    } | null;
    handlers: unknown[];
    fileName: string | null;
  };

fileView.provider =
  { loadFile: async (fileName: string) => {
      if (fileName === 'invoice.pdf') {
        return {
          name: 'invoice.pdf',
          blob: new Blob([ 'pdf' ], { type: 'application/pdf' }),
        };
      }

      return {
        name: fileName,
        text: 'No content',
      };
    } };

fileView.handlers =
  [ createPdfFileHandler(),
    createImageFileHandler(),
    createTextFileHandler() ];

fileView.fileName = 'invoice.pdf';
```
