# sfmt

> Part of [Alexandrite Software Library][1] - a set of high-quality,
performant JavaScript libraries for everyday use.

Below are some examples of how the code is formatted with this tool. For more
details, see the [FORMATTING.md][2] file. The source code of this project is
formatted with the tool itself, therefore for complete example of the formatting
rules, see [the source code of this project][3].

[1]: https://github.com/AlexandriteSoftware/asljs
[2]: FORMATTING.md
[3]: https://github.com/AlexandriteSoftware/asljs/blob/main/sfmt/src

## Highlights

### Import

- one declaration per line
- aligned with first declaration
- from is on a new line, indented

```ts
import { format,
         rules }
  from 'sfmt';
```

### Assignments

- newline after `=` if the value is complex
- applied to assignment, new varaible declaration

```ts
let code =
  getCode(
    declaration);
```

### Function

- parameters - double-indented
- closing parenthesis - on a new line, indented
- return type - after the closing parenthesis
- body opening brace - on a new line, aligned with `function`

```ts
function getIndentation(
    sourceCode: SourceCode,
    node: AST.Token
  ): string
{
  ...
}
```

### If

- criteria - indented (if complex)

```ts
if (
  nodeLocation === undefined
  || nodeLocation === null
) {
  return '';
}
```

### For

- each part of the for statement is on a new line, indented

```ts
for (
  let index = 0;
  index < node.arguments.length;
  index++
) {
  ...
}
```

### Objects and Arrays

- first property/array item - on the same line as opening brace
- subsequent properties/array items - on a new line, aligned with the first

```ts
{ first: 'a',
  second:
    { a: 1,
      b: 2 },
  third:
    [ 'one',
      'two' ] };
```
