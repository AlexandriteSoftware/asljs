# eslint-import-style-rule

## Tests

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
import{readFile}from'node:fs/promises';
import{writeFile}from'node:fs/promises';
// ---
import { readFile }
  from 'node:fs/promises';
import { writeFile }
  from 'node:fs/promises';
```
