// Runs the TypeScript compiler over generated modules, which is what makes a
// template's bindings type errors. The files are virtual but placed inside the
// package, so `asljs-data-binding` and the DOM types resolve as in a build.
import assert
  from 'node:assert/strict';
import path
  from 'node:path';
import { test }
  from 'node:test';
import { fileURLToPath }
  from 'node:url';
import ts
  from 'typescript';
import { compileTemplate }
  from './compile-template.js';

const TEST_SUITE =
  'compile-template-typecheck';

const PACKAGE_DIR =
  fileURLToPath(
    new URL(
      '..',
      import.meta.url));

const VIRTUAL_DIR =
  path.join(
    PACKAGE_DIR,
    'typecheck-virtual');

const MODEL =
  `
    export interface User { name: string; }

    export interface Card {
      title: string;
      hidden: boolean;
      inputId: string;
      count: number;
      user: User | null;
      tags: string[];
      save: () => void;
    }

    export interface AppPipes {
      shout: (value: unknown) => unknown;
    }
  `;

/**
 * Type-checks the given files, the templates compiled to `<name>.tpl.ts`, and
 * returns each error as `<file>:<line>: <message> | <generated line>`.
 */
function typecheck(
    templates: Record<string, string>,
    sources: Record<string, string> = {}
  ): string[]
{
  const files = new Map<string, string>();

  files.set(
    virtualPath('card.ts'),
    MODEL);

  for (const [name, source] of Object.entries(sources)) {
    files.set(
      virtualPath(name),
      source);
  }

  for (const [name, source] of Object.entries(templates)) {
    files.set(
      virtualPath(`${name}.tpl.ts`),
      compileTemplate(
        source,
        { fileName: `${name}.tpl.html` }));
  }

  const options: ts.CompilerOptions =
    { strict: true,
      noEmit: true,
      skipLibCheck: true,
      target:
        ts.ScriptTarget.ESNext,
      module:
        ts.ModuleKind.NodeNext,
      moduleResolution:
        ts.ModuleResolutionKind.NodeNext,
      lib:
        [ 'lib.esnext.d.ts',
          'lib.dom.d.ts' ],
      types: [ ],
      paths:
        { 'asljs-data-binding':
            [ path.join(
              PACKAGE_DIR,
              'src',
              'index.ts') ] } };

  const host =
    ts.createCompilerHost(options);

  const fileExists = host.fileExists;

  const readFile = host.readFile;

  host.fileExists =
    fileName =>
    files.has(
      normalise(fileName))
    || fileExists(fileName);

  host.readFile =
    fileName =>
    files.get(
      normalise(fileName))
      ?? readFile(fileName);

  const directoryExists =
    host.directoryExists;

  // Module resolution looks for the directory before the file in it.
  host.directoryExists =
    directoryName =>
    normalise(directoryName) === normalise(VIRTUAL_DIR)
    || (directoryExists?.(directoryName) ?? true);

  const program =
    ts.createProgram(
      [ ...files.keys() ],
      options,
      host);

  return ts.getPreEmitDiagnostics(program)
    .map(
      (
          diagnostic
        ) =>
      {
        const message =
          ts.flattenDiagnosticMessageText(
            diagnostic.messageText,
            '\n');

        if (
          diagnostic.file === undefined
          || diagnostic.start === undefined
        ) {
          return message;
        }

        const { line } =
          diagnostic.file.getLineAndCharacterOfPosition(
            diagnostic.start);

        const text =
          diagnostic.file.text.split('\n')[line].trim();

        return `${
          path.basename(
            diagnostic.file.fileName)
        }:${line + 1}: ${message} | ${text}`;
      });
}

function virtualPath(
    name: string
  ): string
{
  return normalise(
    path.join(
      VIRTUAL_DIR,
      name));
}

function normalise(
    fileName: string
  ): string
{
  return path.resolve(fileName).replace(
    /\\/g,
    '/');
}

function template(
    ...body: string[]
  ): string
{
  return [ '<template data-bind-model="./card.js#Card">',
           ...body,
           '</template>' ]
    .join('\n');
}

test(
  `${TEST_SUITE}: a template that matches its model and elements has no errors`,
  () =>
  {
    assert.deepEqual(
      typecheck(
        { card:
            template(
              '<label data-bind-text="title"',
              '       data-bind-prop-hidden="hidden"',
              '       data-bind-for="inputId"',
              '       data-bind-class-on="hidden"></label>',
              '<input data-bind-prop-value-as-number="count">',
              '<div data-bind-context="user">',
              '  <span data-bind-text="name | upper"></span>',
              '</div>',
              '<b data-bind-text="tags.0"></b>',
              '<button data-bind-on-click="save"></button>') }),
      [ ]);
  });

test(
  `${TEST_SUITE}: reports a property the element does not have, at the template line`,
  () =>
  {
    const errors =
      typecheck(
        { card:
            template(
              '<label data-bind-prop-for="inputId"></label>') });

    assert.equal(
      errors.length,
      1);

    assert.match(
      errors[0],
      /Property 'for' does not exist on type 'HTMLLabelElement'/);

    assert.match(
      errors[0],
      /card\.tpl\.html:2:8 data-bind-prop-for$/);
  });

test(
  `${TEST_SUITE}: reports a path the model does not have`,
  () =>
  {
    const errors =
      typecheck(
        { card:
            template(
              '<b data-bind-text="titel"></b>',
              '<div data-bind-context="user"><i data-bind-text="nmae"></i></div>') });

    assert.equal(
      errors.length,
      2);

    assert.match(
      errors[0],
      /Property 'titel' does not exist on type 'Card'/);

    assert.match(
      errors[1],
      /Property 'nmae' does not exist on type 'User'/);
  });

test(
  `${TEST_SUITE}: reports a value of the wrong type for its target`,
  () =>
  {
    const errors =
      typecheck(
        { card:
            template(
              '<p data-bind-prop-hidden="title"></p>',
              '<a data-bind-href="user"></a>',
              '<button data-bind-on-click="title"></button>') });

    assert.equal(
      errors.length,
      3,
      errors.join('\n'));

    assert.match(
      errors[0],
      /data-bind-prop-hidden$/);

    assert.match(
      errors[1],
      /data-bind-href$/);

    assert.match(
      errors[2],
      /data-bind-on-click$/);
  });

test(
  `${TEST_SUITE}: reports an unknown pipe, and accepts the declared custom ones`,
  () =>
  {
    const errors =
      typecheck(
        { card:
            template(
              '<b data-bind-text="title | shout"></b>'),
          custom:
            [ '<template data-bind-model="./card.js#Card" data-bind-pipes="./card.js#AppPipes">',
              '<b data-bind-text="title | shout | upper"></b>',
              '</template>' ].join('\n') });

    assert.equal(
      errors.length,
      1,
      errors.join('\n'));

    assert.match(
      errors[0],
      /^card\.tpl\.ts:.*"shout"/);
  });

test(
  `${TEST_SUITE}: bindTemplate takes only the template's model`,
  () =>
  {
    const errors =
      typecheck(
        { card:
            template(
              '<b data-bind-text="title"></b>') },
        { 'use.ts':
            `
              import { bindTemplate, createTemplate } from './card.tpl.js';

              const root = createTemplate().content;

              bindTemplate(root, { title: 'x' });
            ` });

    assert.equal(
      errors.length,
      1,
      errors.join('\n'));

    assert.match(
      errors[0],
      /^use\.ts:/);
  });
