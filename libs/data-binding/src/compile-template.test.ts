import assert
  from 'node:assert/strict';
import { test }
  from 'node:test';
import { compileTemplate,
         GENERATED_HEADER,
         TemplateCompileError }
  from './compile-template.js';

const TEST_SUITE = 'compile-template';

const FILE_NAME = 'src/card.tpl.html';

function compile(
    source: string
  ): string
{
  return compileTemplate(
    source,
    { fileName: FILE_NAME });
}

test(
  `${TEST_SUITE}: exports the markup inside the template element`,
  () =>
  {
    const code =
      compile(
        '<template data-bind-model="./card.js#Card"><b data-bind-text="name"></b></template>');

    assert.ok(
      code.startsWith(GENERATED_HEADER));

    assert.ok(
      code.includes(
        'export const html =\n  "<b data-bind-text=\\"name\\"></b>";'));

    assert.ok(
      code.includes(
        'import type { Card as TemplateModel }\n  from "./card.js";'));
  });

test(
  `${TEST_SUITE}: emits one check per binding, naming its line and attribute`,
  () =>
  {
    const code =
      compile(
        [ '<template data-bind-model="./card.js#Card">',
          '  <label data-bind-text="title"',
          '         data-bind-prop-hidden="hidden"',
          '         data-bind-for="inputId"></label>',
          '  <button data-bind-on-click="actions.save"></button>',
          '</template>' ].join('\n'));

    for (
      const expected of [ 'void model.title; // card.tpl.html:2:10 data-bind-text',
                          'void (model.hidden satisfies TemplateElement<"label">["hidden"] | null | undefined); // card.tpl.html:3:10 data-bind-prop-hidden',
                          'void (model.inputId satisfies AttributeValue); // card.tpl.html:4:10 data-bind-for',
                          'void (model.actions?.save satisfies Action); // card.tpl.html:5:11 data-bind-on-click' ]
    ) {
      assert.ok(
        code.includes(expected),
        expected);
    }
  });

test(
  `${TEST_SUITE}: checks the descendants of a context against its value`,
  () =>
  {
    const code =
      compile(
        [ '<template data-bind-model="./card.js#Card">',
          '  <div data-bind-context="user" data-bind-text="title">',
          '    <span data-bind-text="name"></span>',
          '  </div>',
          '  <i data-bind-text="title"></i>',
          '</template>' ].join('\n'));

    const body =
      code.slice(
        code.indexOf('function check('));

    assert.ok(
      body.includes(
        'void model.title; // card.tpl.html:2:33 data-bind-text'));

    assert.ok(
      body.includes(
        'const context1 =\n    model.user; // card.tpl.html:2:8 data-bind-context'));

    assert.ok(
      body.includes(
        '    void context1.name; // card.tpl.html:3:11 data-bind-text'));

    assert.ok(
      body.includes(
        '  void model.title; // card.tpl.html:5:6 data-bind-text'));
  });

test(
  `${TEST_SUITE}: after a pipe checks the pipe name and only the path`,
  () =>
  {
    const code =
      compile(
        '<template data-bind-model="./card.js#Card"><p data-bind-prop-hidden="title | upper"></p></template>');

    assert.ok(
      code.includes(
        'void ("upper" satisfies PipeName);'));

    assert.ok(
      code.includes(
        'void model.title;'));

    assert.ok(
      !code.includes(
        'satisfies TemplateElement'));
  });

test(
  `${TEST_SUITE}: data-bind-pipes types the custom pipes bindTemplate requires`,
  () =>
  {
    const code =
      compile(
        '<template data-bind-model="./card.js#Card" data-bind-pipes="./pipes.js#AppPipes"><p data-bind-text="title | shout"></p></template>');

    assert.ok(
      code.includes(
        'import type { AppPipes as TemplatePipes }\n  from "./pipes.js";'));

    assert.ok(
      code.includes(
        'options: BindDataModelOptions & { pipes: TemplatePipes; }'));

    assert.ok(
      code.includes(
        '| (keyof TemplatePipes & string)'));
  });

test(
  `${TEST_SUITE}: leaves the content of a nested template unchecked`,
  () =>
  {
    const code =
      compile(
        '<template data-bind-model="./card.js#Card"><template><b data-bind-text="nope"></b></template></template>');

    assert.ok(
      !code.includes(
        'nope'.concat(';')));
  });

test(
  `${TEST_SUITE}: rejects a file without exactly one template`,
  () =>
  {
    assert.throws(
      () => compile('<div></div>'),
      /card\.tpl\.html:1:1: Expect exactly one <template> element, found 0\./);
  });

test(
  `${TEST_SUITE}: rejects a template without a model type`,
  () =>
  {
    for (
      const source of [ '<template></template>',
                        '<template data-bind-model="Card"></template>',
                        '<template data-bind-model="./card.js#"></template>' ]
    ) {
      assert.throws(
        () => compile(source),
        TemplateCompileError,
        source);
    }
  });

test(
  `${TEST_SUITE}: reports a malformed binding at its attribute`,
  () =>
  {
    assert.throws(
      () =>
        compile(
          [ '<template data-bind-model="./card.js#Card">',
            '  <b data-bind-text="user..name"></b>',
            '</template>' ].join('\n')),
      (error: unknown) =>
        error instanceof TemplateCompileError
        && error.line === 2
        && error.column === 6
        && /non-empty/.test(error.message));

    assert.throws(
      () =>
        compile(
          '<template data-bind-model="./card.js#Card"><b data-bind-onclick="save"></b></template>'),
      /'data-bind-onclick' is not a binding/);
  });
