# import

This rule formats `ImportDeclaration` nodes.

`ImportDeclaration` has the following structure:

- `specifiers` (array of `ImportSpecifier`, `ImportDefaultSpecifier`,
  or `ImportNamespaceSpecifier`)
  - `ImportSpecifier` (for named imports, e.g., `{ readFile }`)
  - `ImportDefaultSpecifier` (for default imports, e.g., `fs`)
  - `ImportNamespaceSpecifier` (for namespace imports, e.g., `* as fs`)
- `source` (the module specifier, e.g., `'node:fs/promises'`)

## Tests

```ts
import { readFile }
  from 'node:fs/promises';
// ---
import { readFile }
  from 'node:fs/promises';
```

```ts
import{readFile}from'node:fs/promises';
// ---
import { readFile }
  from 'node:fs/promises';
```

```ts
import{readFile,writeFile}from'node:fs/promises';
// ---
import { readFile,
         writeFile }
  from 'node:fs/promises';
```

```ts
import{readFile as rf}from'node:fs/promises';
// ---
import { readFile as rf }
  from 'node:fs/promises';
```

```ts
import path from'node:path';
// ---
import path
  from 'node:path';
```

```ts
import * as fs from'node:fs';
// ---
import * as fs
  from 'node:fs';
```

```ts
import{readFile}from'node:fs/promises';
// ---
import { readFile }
  from 'node:fs/promises';
```

```ts
import{readFile as rf}from'node:fs/promises';
// ---
import { readFile as rf }
  from 'node:fs/promises';
```

```ts
import path,{readFile}from'node:fs/promises';
// ---
import path,
       { readFile }
  from 'node:fs/promises';
```

```ts
import path,* as fs from'node:fs';
// ---
import path,
       * as fs
  from 'node:fs';
```

```ts
import{}from'./empty.js';
// ---
import { }
  from './empty.js';
```

```ts
import{readFile}from'node:fs/promises';
import{writeFile}from'node:fs/promises';
// ---
import { readFile }
  from 'node:fs/promises';
import { writeFile }
  from 'node:fs/promises';
```

```ts
import type { writeFile } from'node:fs/promises';
// ---
import { type writeFile }
  from 'node:fs/promises';
```

```ts
import type { writeFile, readFile } from'node:fs/promises';
// ---
import { type writeFile,
         type readFile }
  from 'node:fs/promises';
```

```ts
import { type writeFile } from'node:fs/promises';
// ---
import { type writeFile }
  from 'node:fs/promises';
```
