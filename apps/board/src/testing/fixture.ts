import { TmpDir }
  from 'asljs-tmpdir';
import fs
  from 'node:fs/promises';

/**
 * A board with idea 19 developed into a plan with two tasks, the first done,
 * and idea 20 that is only an idea, with an answered and an open question.
 */
export async function writeFixture(
    dir: TmpDir
  ): Promise<void>
{
  await dir.writeText(
    'board/Ideas/I19 Track how fresh articles are.md',
    `# I19 Track how fresh articles are

Nothing says when an article was last checked.
`);

  await dir.writeText(
    'board/Plans/P19 Track how fresh articles are.md',
    `# P19 Track how fresh articles are

## Goal

Every article that changes has a review date.

## Steps

1. Choose the articles.
2. Add a review date.
`);

  await dir.writeText(
    'board/Tasks/T19-1 Choose the articles.md',
    '# T19-1 Choose the articles\n\nList the articles that change.\n');

  await dir.writeText(
    'board/Tasks/T19-2 Add a review date.md',
    '# T19-2 Add a review date\n\nAdd `Reviewed:` to each chosen article.\n');

  await dir.writeText(
    'board/Results/R19-1 Choose the articles.md',
    '# R19-1 Choose the articles\n\n- Status: DONE\n- Task: [T19-1 Choose the articles][T19-1]\n- Date: 2026-01-01T00:00:00.000Z\n\nChose 3 articles.\n\n[T19-1]: <../Tasks/T19-1 Choose the articles.md>\n');

  await dir.writeText(
    'board/Ideas/I20 Restrict kids internet access.md',
    `# I20 Restrict kids internet access

Limit the hours.

## Open questions

- Which devices?
  - Answer: the tablets
- Which hours?
`);
}

/**
 * Writes a fake AI agent and returns its command line: it saves each prompt
 * to `prompts/<n>.txt` in its folder, and its arguments to
 * `prompts/<n>.args.json`, and answers with the first response
 * whose key the prompt contains, or `{"result":"OK"}`.
 */
export async function writeAgent(
    dir: TmpDir,
    responses: Readonly<Record<string, string>>
  ): Promise<string>
{
  await dir.writeText(
    'agent/agent.cjs',
    `const fs = require('node:fs');
const path = require('node:path');
const responses = ${JSON.stringify(responses)};
let prompt = '';
process.stdin.on('data', chunk => prompt += chunk);
process.stdin.on('end', () => {
  const folder = path.join(__dirname, 'prompts');
  fs.mkdirSync(folder, { recursive: true });
  const count = fs.readdirSync(folder).filter(name => !name.endsWith('.args.json')).length;
  fs.writeFileSync(path.join(folder, (count + 1) + '.txt'), prompt);
  fs.writeFileSync(path.join(folder, (count + 1) + '.args.json'), JSON.stringify(process.argv.slice(2)));
  const key = Object.keys(responses).find(key => prompt.includes(key));
  process.stdout.write(key === undefined ? '{"result":"OK"}\\n' : responses[key]);
});
`);

  return `node "${dir.resolve('agent/agent.cjs')}"`;
}

/**
 * Writes the fake agent of `writeAgent` as a `claude` command in `bin/` and
 * returns that folder, to put first on `PATH`.
 */
export async function installAgent(
    dir: TmpDir,
    responses: Readonly<Record<string, string>>
  ): Promise<string>
{
  await writeAgent(
    dir,
    responses);

  const agent =
    dir.resolve('agent/agent.cjs');

  await dir.writeText(
    'bin/claude.cmd',
    `@node "${agent}" %*\r\n`);

  await dir.writeText(
    'bin/claude',
    `#!/bin/sh\nexec node "${agent}" "$@"\n`);

  await fs.chmod(
    dir.resolve('bin/claude'),
    0o755);

  return dir.resolve('bin');
}
