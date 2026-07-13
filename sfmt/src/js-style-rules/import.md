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

```js
import { readFile }
  from 'node:fs/promises';
// ---
import { readFile }
  from 'node:fs/promises';
```

```js
import{readFile}from'node:fs/promises';
// ---
import { readFile }
  from 'node:fs/promises';
```

```js
import{readFile,writeFile}from'node:fs/promises';
// ---
import { readFile,
         writeFile }
  from 'node:fs/promises';
```

```js
import{readFile as rf}from'node:fs/promises';
// ---
import { readFile as rf }
  from 'node:fs/promises';
```

```js
import path from'node:path';
// ---
import path
  from 'node:path';
```

```js
import * as fs from'node:fs';
// ---
import * as fs
  from 'node:fs';
```

```js
import{readFile}from'node:fs/promises';
// ---
import { readFile }
  from 'node:fs/promises';
```

```js
import{readFile as rf}from'node:fs/promises';
// ---
import { readFile as rf }
  from 'node:fs/promises';
```

```js
import path,{readFile}from'node:fs/promises';
// ---
import path,
       { readFile }
  from 'node:fs/promises';
```

```js
import path,* as fs from'node:fs';
// ---
import path,
       * as fs
  from 'node:fs';
```

```js
import{}from'./empty.js';
// ---
import { }
  from './empty.js';
```

```js
import from 'node:fs/promises';
// ---
import from 'node:fs/promises';
```

```js
import{readFile}from'node:fs/promises';
import{writeFile}from'node:fs/promises';
// ---
import { readFile }
  from 'node:fs/promises';
import { writeFile }
  from 'node:fs/promises';
```
