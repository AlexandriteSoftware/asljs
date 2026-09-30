import test,
       { after }
  from 'node:test';
import assert
  from 'node:assert/strict';
import { tmpDirFactory }
  from './testing/tmpDir.js';
import { NullLoggerProvider,
         createRuleValidationContext }
  from 'asljs-part';
import { validate }
  from './Package README_RL2.js';

const loggerProvider =
  new NullLoggerProvider();

after(
  () => {
    loggerProvider.dispose();
  });

const tmpDir =
  tmpDirFactory(
    loggerProvider);

/** Write a README, then validate it as the rule sees it. */
async function validateReadme(
    workspace,
    lines
  )
{
  // The artefact is only found through a definition, so the workspace carries
  // one whose location is the README under test.
  await workspace.writeText(
    'Package README.md',
    [ '# Package README',
      '',
      'The landing page of a workspace package.',
      '',
      '## Location',
      '',
      '- Pattern: `/README.md`',
      '' ].join('\n'));

  await workspace.writeText(
    'README.md',
    lines.join('\n'));

  const context =
    createRuleValidationContext(
      loggerProvider,
      workspace.path,
      workspace.path);

  const artefact =
    await context.artefacts.tryGetArtefact('README.md');

  if (!artefact) {
    throw new Error(
      'README.md artefact not found.');
  }

  return validate(
    artefact,
    context);
}

const sectioned =
  headings =>
    [ '# package',
      '',
      ...headings.flatMap(
        heading =>
          [ `## ${heading}`,
            '',
            'Body.',
            '' ]) ];

test(
  'Package README_RL2: passes when headings are in the agreed order',
  async () => {
    await using workspace =
      tmpDir();

    await validateReadme(
      workspace,
      sectioned(
        [ 'Overview',
          'Scope',
          'Installation',
          'Usage',
          'Further reading',
          'Related packages',
          'License' ]));
  });

test(
  'Package README_RL2: passes when headings are absent but ordered',
  async () => {
    await using workspace =
      tmpDir();

    await validateReadme(
      workspace,
      sectioned(
        [ 'Overview',
          'Usage',
          'License' ]));
  });

test(
  'Package README_RL2: rejects headings in the wrong order',
  async () => {
    await using workspace =
      tmpDir();

    await assert.rejects(
      validateReadme(
        workspace,
        sectioned(
          [ 'Installation',
            'Overview' ])),
      /out of order/);
  });

test(
  'Package README_RL2: rejects a repeated heading',
  async () => {
    await using workspace =
      tmpDir();

    await assert.rejects(
      validateReadme(
        workspace,
        sectioned(
          [ 'Usage',
            'Usage' ])),
      /more than once/);
  });

test(
  'Package README_RL2: ignores headings outside the agreed set',
  async () => {
    await using workspace =
      tmpDir();

    await validateReadme(
      workspace,
      sectioned(
        [ 'Overview',
          'API Reference',
          'License' ]));
  });
