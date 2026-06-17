import path
  from 'node:path';
import { ArtefactProvider }
  from '../providers/artefact-provider.js';
import { DefinitionProvider }
  from '../providers/definition-provider.js';
import { RuleRunner }
  from '../rule-runner.js';

export async function execInventory(
  environment)
{
  const rootDirectory =
    environment.project;

  const definitionsProvider =
    new DefinitionProvider(
      environment.logger,
      environment.definitions);

  const artefacts =
    new ArtefactProvider(
      environment.logger,
      rootDirectory,
      definitionsProvider);

  const items =
    await collectInventoryItems(
      environment.logger,
      rootDirectory,
      await definitionsProvider.getDefinitions(),
      artefacts);

  const table =
    formatInventoryTable(items);

  environment.stdout.write(
    `${table}\n`);
}

export async function generateInventoryTable(
  rootDirectory,
  options = {})
{
  return execInventory(
    rootDirectory,
    options);
}

async function collectInventoryItems(
  logger,
  rootDirectory,
  definitions,
  artefacts)
{
  const artefactIndex =
    new Map();

  for (const definition of definitions) {
    const definitionArtefacts =
      await artefacts.getArtefacts(definition);

    for (const artefact of definitionArtefacts) {
      const definitionPath =
        path.resolve(
          definition.path);

      if (artefact.path === definitionPath) {
        continue;
      }

      const existingEntry =
        artefactIndex.get(
          artefact.relativePath) ?? {
          file: artefact.relativePath,
          definitions: [],
          rulesOk: true,
        };

      const artifactResult =
        await inspectArtifact(
          logger,
          rootDirectory,
          definition,
          artefact);

      existingEntry.definitions.push(
        {
          name: definition.name,
          orderKey: toPosixPath(
            path.relative(
              rootDirectory,
              definition.path)),
        });

      existingEntry.rulesOk = existingEntry.rulesOk && artifactResult.rulesOk;

      artefactIndex.set(
        artefact.relativePath,
        existingEntry);
    }
  }

  const items =
    Array.from(
      artefactIndex.values(),
      (entry) => ({
        file: entry.file,
        definitions: entry.definitions
          .sort(
            (left, right) => left.orderKey.localeCompare(
              right.orderKey) || left.name.localeCompare(
                right.name))
          .map(
            (definition) => definition.name)
          .join(','),
        rules: entry.rulesOk
          ? 'Ok'
          : 'Fail',
      }));

  items.sort(
    (left, right) => left.file.localeCompare(
      right.file));

  return items;
}

async function inspectArtifact(
  logger,
  rootDirectory,
  definition,
  artefact)
{
  const ruleRunner =
    new RuleRunner(
      logger);

  const ruleResults =
    await ruleRunner.runRules(
      definition,
      artefact);

  return {
    file: artefact.relativePath,
    definition: definition.name,
    rulesOk: ruleResults.every(
      (result) => result.result === 'Ok'),
  };
}

function formatInventoryTable(
  items)
{
  const rows =
    items.map(
      (item) => [item.file, item.definitions, item.rules]);

  const headers =
    ['Location', 'Definitions', 'Rules'];

  const widths =
    headers.map(
      (header, index) => {
        const cellWidths =
          rows.map(
            (row) => row[index].length);

        return Math.max(
          header.length,
          ...cellWidths,
          3);
      });

  const lines =
    [];

  lines.push(
    formatRow(
      headers,
      widths));

  lines.push(
    formatRow(
      widths.map(
        (width) => '-'.repeat(width)),
      widths));

  for (const row of rows) {
    lines.push(
      formatRow(
        row,
        widths));
  }

  return lines.join('\n');
}

function toPosixPath(
  value)
{
  return value.replaceAll(
    '\\',
    '/');
}
