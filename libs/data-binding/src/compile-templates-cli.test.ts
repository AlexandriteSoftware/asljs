import { TmpDir }
  from 'asljs-tmpdir';
import assert
  from 'node:assert/strict';
import fs
  from 'node:fs/promises';
import { test }
  from 'node:test';
import { GENERATED_HEADER }
  from './compile-template.js';
import { runCompileTemplatesCli }
  from './compile-templates-cli.js';

const TEST_SUITE =
  'compile-templates-cli';

const TEMPLATE =
  '<template data-bind-model="./card.js#Card"><b data-bind-text="name"></b></template>';

async function run(
    cwd: string,
    ...args: string[]
  ): Promise<{ code: number; stdout: string; stderr: string; }>
{
  let stdout = '';
  let stderr = '';

  const code =
    await runCompileTemplatesCli(
      args,
      { cwd,
        stdout:
          text => stdout += text,
        stderr:
          text => stderr += text });

  return { code,
           stdout,
           stderr };
}

test(
  `${TEST_SUITE}: compiles every template under src, skipping build output`,
  async () =>
  {
    await using workspace =
      new TmpDir();

    await workspace.writeText(
      'src/card.tpl.html',
      TEMPLATE);

    await workspace.writeText(
      'src/nested/row.tpl.html',
      TEMPLATE);

    await workspace.writeText(
      'src/node_modules/skipped.tpl.html',
      TEMPLATE);

    const result =
      await run(workspace.path);

    assert.equal(
      result.code,
      0,
      result.stderr);

    assert.equal(
      result.stdout,
      'src/card.tpl.ts\nsrc/nested/row.tpl.ts\n');

    assert.ok(
      (await workspace.readText('src/card.tpl.ts')).startsWith(
        GENERATED_HEADER));

    await assert.rejects(
      workspace.readText(
        'src/node_modules/skipped.tpl.ts'));
  });

test(
  `${TEST_SUITE}: writes a module only when its content changes`,
  async () =>
  {
    await using workspace =
      new TmpDir();

    await workspace.writeText(
      'src/card.tpl.html',
      TEMPLATE);

    await run(workspace.path);

    const second =
      await run(workspace.path);

    assert.equal(
      second.stdout,
      '');
  });

test(
  `${TEST_SUITE}: reports a template error and exits 1, compiling the rest`,
  async () =>
  {
    await using workspace =
      new TmpDir();

    await workspace.writeText(
      'src/bad.tpl.html',
      '<template data-bind-model="./card.js#Card">\n  <b data-bind-text="a..b"></b>\n</template>');

    await workspace.writeText(
      'src/good.tpl.html',
      TEMPLATE);

    const result =
      await run(workspace.path);

    assert.equal(
      result.code,
      1);

    assert.match(
      result.stderr,
      /^src\/bad\.tpl\.html:2:6: Expect path segments to be non-empty/);

    assert.ok(
      await workspace.readText('src/good.tpl.ts'));
  });

test(
  `${TEST_SUITE}: removes a generated module whose template is gone, and keeps a hand-written one`,
  async () =>
  {
    await using workspace =
      new TmpDir();

    await workspace.writeText(
      'src/old.tpl.ts',
      `${GENERATED_HEADER} from old.tpl.html. Do not edit.\n`);

    await workspace.writeText(
      'src/own.tpl.ts',
      'export const own = 1;\n');

    const result =
      await run(workspace.path);

    assert.equal(
      result.stdout,
      'removed src/old.tpl.ts\n');

    await assert.rejects(
      fs.stat(
        workspace.resolve('src/old.tpl.ts')));

    assert.ok(
      await workspace.readText('src/own.tpl.ts'));
  });

test(
  `${TEST_SUITE}: takes files and directories, and rejects an unknown option`,
  async () =>
  {
    await using workspace =
      new TmpDir();

    await workspace.writeText(
      'templates/card.tpl.html',
      TEMPLATE);

    const result =
      await run(
        workspace.path,
        'templates/card.tpl.html');

    assert.equal(
      result.stdout,
      'templates/card.tpl.ts\n');

    const missing =
      await run(
        workspace.path,
        'nowhere');

    assert.equal(
      missing.code,
      1);

    const unknown =
      await run(
        workspace.path,
        '--fast');

    assert.equal(
      unknown.code,
      2);
  });
