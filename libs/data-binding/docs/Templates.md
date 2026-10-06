# Templates

## Purpose

How a binding template is written as a `*.tpl.html` file and compiled to a
TypeScript module, so the TypeScript compiler checks each binding against the
model type and the element it is on.

A template written in a string is bound at run time only. A misspelled path
reads `undefined`, and a property the element does not have becomes an expando,
so `<label data-bind-prop-for="inputId">` binds without an error and writes
`label.for`, which no label has. Compiled, the same binding is a type error:
`Property 'for' does not exist on type 'HTMLLabelElement'`.

## The template file

A `*.tpl.html` file holds one `<template>` element. Its `data-bind-model`
attribute names the model type as `<module>#<type>`, the module written as an
import from the generated module:

```html
<!-- src/card.tpl.html -->
<template data-bind-model="./card.js#CardModel">
  <article>
    <h2 data-bind-text="title"></h2>
    <label data-bind-prop-hidden="hideLabel"
           data-bind-for="inputId"></label>
    <section data-bind-context="author">
      <span data-bind-text="name | upper"></span>
    </section>
    <button data-bind-on-click="save"></button>
  </article>
</template>
```

`data-bind-pipes="<module>#<type>"` names the type of the custom pipes the
template uses, an object whose keys are the pipe names. Without it, a template
may use only the built-in pipes.

The markup inside `<template>` is bound exactly as markup in a string is: see
[Bindings][BND].

## The generated module

`data-bind-compile` writes `card.tpl.ts` next to `card.tpl.html`. It exports:

- `html` - the markup inside `<template>`, as a string;
- `createTemplate(doc = document)` - a new `HTMLTemplateElement` holding it;
- `bindTemplate(root, model, options?)` - `bindDataModel` with the model typed
  as `data-bind-model`. With `data-bind-pipes`, `options` is required and its
  `pipes` must have that type.

```ts
import { bindTemplate, createTemplate } from './card.tpl.js';

const fragment = createTemplate().content.cloneNode(true) as DocumentFragment;

const dispose = bindTemplate(fragment, model);
```

The module also holds a function that is never called, with one statement per
binding. Each statement ends with a comment that names the template line, column
and attribute, so an error the compiler reports in the generated module leads
back to the template:

```ts
void (model.hideLabel satisfies TemplateElement<"label">["hidden"] | null | undefined); // card.tpl.html:5:12 data-bind-prop-hidden
```

The generated modules are build output: the repository ignores `*.tpl.ts`, and
they are not edited.

## What is checked

The element type follows from the tag through `HTMLElementTagNameMap`. A tag
that is not declared there, such as a custom element without a declaration,
takes any property.

| Binding                                    | Check                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `data-bind-text`, `-html`, `-class-<name>` | the path exists on the model                                                                      |
| `data-bind-prop-<name>`                    | the element has the property, and the value is assignable to it or nullish                        |
| `data-bind-<attr>`                         | the value is a string, number, boolean or nullish                                                 |
| `data-bind-on-<event>`                     | the value is a function or nullish                                                                |
| `data-bind-context`                        | the path exists, and the descendants are checked against its value without `null` and `undefined` |
| a pipe                                     | the name is a built-in or a key of the `data-bind-pipes` type                                     |

Every segment of a path after the first is read with `?.`, because a path that
does not resolve is not an error at run time. A property the type does not have
is still one. A pipe returns `unknown`, so a binding with pipes checks its path
but not the type of its value.

Content of a nested `<template>` is not checked, because it is not bound.

The compiler itself rejects what can never bind: a file without exactly one
`<template>`, a missing or malformed `data-bind-model`, a malformed path such as
`user..name`, and a `data-bind-on…` name without the dash. It reports them as
`<file>:<line>:<column>: <reason>`.

## The command

```text
data-bind-compile [--watch] [path ...]
```

It compiles every `*.tpl.html` under the given files and directories, `src` by
default, skipping `node_modules`, `dist`, `build` and `.git`. It writes a module
only when its content changed, and removes a generated module whose template no
longer exists; a `.tpl.ts` file without the generated header is left alone. It
prints each file it writes or removes, reports template errors on stderr, and
exits with 1 when a template failed and 2 on a usage error. With `--watch` it
compiles again whenever a template changes.

The command writes TypeScript only; the package's own `tsc` does the checking.
It takes no logging arguments: what it prints is its output, not a log.

A package runs it before every `tsc`:

```json
{
  "scripts": {
    "build": "data-bind-compile && tsc -p tsconfig.build.json",
    "typecheck": "data-bind-compile && tsc -p tsconfig.build.json --noEmit"
  }
}
```

## Scope

Templates that arrive at run time are not checked: a `<template>` a page
provides, or a theme template written as a string. A theme can write its
templates as `*.tpl.html` files and use their `html` export, as the Bootstrap
theme of `asljs-components` does.

A model type with a type parameter, such as a list row whose item is the
caller's type, cannot be named in `data-bind-model`.

[BND]: Bindings.md
