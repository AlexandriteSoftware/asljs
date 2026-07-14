# Starcase Code Formatting Style

for TypeScript, JavaScript, and other languages

## Overview

When writing and maintaining code there are many factors to consider.
The prioritisation of these factors is often a matter of personal or team
preference. The following style guide emerged from thousands of hours writing
and maintaining code with the following priorities in mind:

- Code readability is the most important factor. Everything else is secondary
  to readability. If the code is easy to read, it is easy to understand, spot
  errors, and change it.
- Code maintenance is the second most important factor. Compare code, review
  changes, and make changes should be as easy as possible.

According to the research and experience, the most important readability
metrics are:

- number of identifiers per line
- average line length
- average number of operations per line (e.g., parentheses, operators)

While maintaining code, the most common operation is to compare two versions of
a file. The code with good readability metrics also reduces the amount of noise
in diffs.

Applying these principles to the code makes it look like a staircase, hence
the name of this style guide.

```typescript
function getIndentation(
    sourceCode: SourceCode,
    node: AST.Token
  ): string
{
  const nodeLocation =
    node.loc;

  if (
    nodeLocation === undefined
    || nodeLocation === null
  ) {
    return '';
  }

  const line =
    sourceCode.lines[nodeLocation.start.line - 1];

  const match =
    /^[ \t]*/.exec(line);

  return match?.[0] ?? '';
}
```

## Definitions

### Simple Expression

Expression is simple if:

- it is a literal (e.g., regex, number, string, boolean, null, undefined)
  that is not a template literal and less than 15 characters long
- it is an identifier that is less than 15 characters long
- it is an array with no or one item, of total length less than 15 characters
- it is an object with no or one property, of total length less than 15
  characters
- it is a new expression with no arguments, of total length less than 15
  characters

Examples:

- `'abc'`
- `123`
- `true`
- `null`
- `undefined`
- `[ 1 ]`
- `{ a: 1 }`
- `new Map()`

## Rules

### Indentation

Indentation is 2 spaces per level. Tabs are not allowed.

However, when a line is broken into multiple lines, the second and subsequent
lines are aligned with the first line.

```js
if (
  !(node instanceof AST.CallExpression
    || node instanceof AST.NewExpression)
) {
  return true;
}
```

### Assignments

When assigning a value to a variable, the statement is on the next line,
indented one level from the variable declaration, unless the statement is
simple.

```js
const code =
  getCode(
    declaration);

const output = [ ];

const map = new Map();

const layout =
  new Layout({ });
```

### For

In for loops, the initialization, condition, and increment expressions are on
separate lines, indented one level from the for statement.

```js
for (
  let index = 0;
  index < node.arguments.length;
  index++
) {
  ...
}
```

### If

When if's condition is not simple, it is on the next line, indented one
level from the if statement.

```js
if (ok) {
  return true;
}

if (
  nodeLocation === undefined
  || nodeLocation === null
) {
  return '';
}
```

### Expression

In expressions, operators of the same precedence can be on the same line.
Lower precedence operators break the line and are aligned with the first line.

```js
const isDefined =
  nodeLocation !== undefined
  && nodeLocation !== null;

const length =
  Math.sqrt(
    x * x
    + y * y);
```

### Calls

When calling a function, the simple single argument can be on the same line.
In all other cases, the arguments are on separate lines, indented one level from
the function call.

```js
just(
  like,
  this);
```

### Call Chains

When resolving a chain of functions, the first and the second items are on
the same line. The third and subsequent function calls are on separate lines.

```js
const result =
  this.road
    .goes
    .ever
    .on();
```

### Spacing

Multiline statements are separated by a single empty line.

No empty lines before first or after last statement in a block.

```js
if (success) {
  record(
    this.data);

  print(
    'Success!');
}
```
