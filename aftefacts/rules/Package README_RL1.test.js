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
  from './Package README_RL1.js';

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
      [ workspace.path ]);

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

test(
  'Package README_RL1: passes when every heading is in the agreed set',
  async () => {
    await using workspace =
      tmpDir();

    await validateReadme(
      workspace,
      [ '# package',
        '',
        '## Overview',
        '',
        'Body.',
        '',
        '## Installation',
        '',
        'Body.',
        '',
        '## License',
        '',
        'MIT.',
        '' ]);
  });

test(
  'Package README_RL1: passes when a section is left out',
  async () => {
    await using workspace =
      tmpDir();

    await validateReadme(
      workspace,
      [ '# package',
        '',
        '## Usage',
        '',
        'Body.',
        '' ]);
  });

test(
  'Package README_RL1: rejects a heading outside the agreed set',
  async () => {
    await using workspace =
      tmpDir();

    await assert.rejects(
      validateReadme(
        workspace,
        [ '# package',
          '',
          '## Overview',
          '',
          'Body.',
          '',
          '## API Reference',
          '',
          'Body.',
          '' ]),
      /API Reference/);
  });

test(
  'Package README_RL1: heading matching is case sensitive',
  async () => {
    await using workspace =
      tmpDir();

    await assert.rejects(
      validateReadme(
        workspace,
        [ '# package',
          '',
          '## Related Packages',
          '',
          'Body.',
          '' ]),
      /Related Packages/);
  });

test(
  'Package README_RL1: level 3 headings are not constrained',
  async () => {
    await using workspace =
      tmpDir();

    await validateReadme(
      workspace,
      [ '# package',
        '',
        '## Usage',
        '',
        '### Anything at all',
        '',
        'Body.',
        '' ]);
  });
