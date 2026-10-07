import { Logger }
  from 'asljs-logging';
import { minimatch }
  from 'minimatch';
import path
  from 'node:path';
import { getArtefactPropertyValues,
         getPropertyValue,
         isArtefactPropertyType,
         resolveReferencedLocation }
  from '../artefact-property-values.js';
import { toPosixPath }
  from '../formatting.js';
import { displayLocation,
         FILE_SCHEME,
         hasScheme }
  from '../location.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { Artefact }
  from '../model/artefact.js';
import { DiagramDirection,
         DiagramDocument,
         DiagramEdgeProperty,
         DiagramEdgeStyle }
  from '../model/diagram-document.js';
import { ArtefactDataProvider }
  from '../providers/artefact-data-provider.js';
import { ArtefactDefinitionProvider }
  from '../providers/artefact-definition-provider.js';
import { ArtefactProvider }
  from '../providers/artefact-provider.js';

export interface DiagramNode
{
  location: string;
  label: string;

  /**
   * The group the node is drawn in, or `null` for none.
   */
  group: string | null;
}

export interface DiagramEdge
{
  from: string;
  to: string;
  style: DiagramEdgeStyle;
  label: string | null;
}

/**
 * The structure a diagram document describes, ready to be written as
 * Mermaid. Nodes are sorted by location; edges by source, target and the
 * order of `## Edges`.
 */
export interface Diagram
{
  direction: DiagramDirection;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface DiagramBuilderProviders
{
  projectPath: string;
  artefactDefinitionProvider: ArtefactDefinitionProvider;
  artefactProvider: ArtefactProvider;
  artefactDataProvider: ArtefactDataProvider;
}

interface Candidate
{
  artefact: Artefact;

  /**
   * The node definitions the artefact matches, sorted by name.
   */
  definitions: ArtefactDefinition[];
}

/**
 * Builds the diagram a diagram document describes: the candidates of its
 * node definitions, narrowed to what the roots reach, and the edges of the
 * listed properties between them.
 */
export async function buildDiagram(
    logger: Logger,
    providers: DiagramBuilderProviders,
    document: DiagramDocument
  ): Promise<Diagram>
{
  const fail =
    (
        message: string
      ): never =>
    {
    throw new Error(
      `${document.path}: ${message}`);
  };

  const definitions: ArtefactDefinition[] = [ ];

  for (const name of document.nodes.definitions) {
    const definition =
      await providers.artefactDefinitionProvider
      .findDefinition(
        name);

    if (!definition) {
      fail(
        `"Definitions" names "${name}", which is not a loaded definition.`);
    }

    definitions.push(definition!);
  }

  validateEdgeProperties(
    document,
    definitions,
    fail);

  if (
    document.nodes.label
    !== null
    && !definitions.some(
      definition =>
        definition.properties.some(
          property => property.name === document.nodes.label))
  ) {
    fail(
      `"Label" names "${document.nodes.label}", which is not a property of the node definitions.`);
  }

  const candidates =
    await collectCandidates(
      providers.artefactProvider,
      document,
      definitions);

  const data = new Map<string, unknown>();

  const getData =
    async (
        candidate: Candidate,
        definition: ArtefactDefinition
      ): Promise<unknown> =>
    {
    const key =
      `${candidate.artefact.location}\n${definition.name}`;

    if (!data.has(key)) {
      data.set(
        key,
        await providers.artefactDataProvider.tryGetArtefactData(
          candidate.artefact,
          definition.name));
    }

    return data.get(key);
  };

  let knownLocations: Set<string> | null = null;

  const references =
    async (
        candidate: Candidate,
        edge: DiagramEdgeProperty
      ): Promise<string[]> =>
    {
    const targets: string[] = [ ];

    for (const definition of candidate.definitions) {
      if (
        !appliesTo(
          edge,
          definition)
      ) {
        continue;
      }

      const values =
        getArtefactPropertyValues(
          await getData(
            candidate,
            definition),
          edge.property);

      for (const value of values) {
        if (value.trim() === '') {
          continue;
        }

        const target =
          resolveReferencedLocation(
            providers.projectPath,
            candidate.artefact.location,
            value);

        if (target === null) {
          logger.warning(
            '%s: %s of %s refers to "%s", outside the project.',
            document.path,
            edge.property,
            displayLocation(
              candidate.artefact.location),
            value);

          continue;
        }

        if (!candidates.has(target)) {
          knownLocations ??= new Set(
            (await providers.artefactProvider.getArtefacts())
              .map(
                artefact => artefact.location));

          if (!knownLocations.has(target)) {
            logger.warning(
              '%s: %s of %s refers to %s, which is not an artefact.',
              document.path,
              edge.property,
              displayLocation(
                candidate.artefact.location),
              displayLocation(target));
          }

          continue;
        }

        if (!targets.includes(target)) {
          targets.push(target);
        }
      }
    }

    return targets;
  };

  const nodeLocations =
    document.root
    ? await walkFromRoots(
      document,
      candidates,
      references,
      fail)
    : new Set(
      candidates.keys());

  const locations =
    [ ...nodeLocations ].sort(
      (left, right) => left.localeCompare(right));

  const nodes: DiagramNode[] = [ ];

  for (const location of locations) {
    const candidate =
      candidates.get(location)!;

    nodes.push(
      { location,
        label:
          await getLabel(
            document,
            candidate,
            getData),
        group:
          document.layout.group === 'folder'
          ? getFolderGroup(location)
          : null });
  }

  const edges: DiagramEdge[] = [ ];

  for (const location of locations) {
    for (const edge of document.edges) {
      for (
        const target of await references(
          candidates.get(location)!,
          edge)
      ) {
        if (!nodeLocations.has(target)) {
          continue;
        }

        edges.push(
          { from:
              edge.direction === 'reverse'
              ? target
              : location,
            to:
              edge.direction === 'reverse'
              ? location
              : target,
            style: edge.style,
            label: edge.label });
      }
    }
  }

  return { direction:
             document.layout.direction,
           nodes,
           edges };
}

function validateEdgeProperties(
    document: DiagramDocument,
    definitions: ArtefactDefinition[],
    fail: (message: string) => never
  ): void
{
  for (const edge of document.edges) {
    if (
      edge.definition !== null
      && !definitions.some(
        definition => definition.name === edge.definition)
    ) {
      fail(
        `the edge property "${edge.name}" names "${edge.definition}", which is not a node definition.`);
    }

    const properties =
      definitions
      .filter(
        definition =>
          appliesTo(
            edge,
            definition))
      .flatMap(
        definition =>
          definition.properties.filter(
            property => property.name === edge.property));

    if (properties.length === 0) {
      fail(
        `the edge property "${edge.name}" is not a property of the node definitions.`);
    }

    for (const property of properties) {
      const type =
        property.isList
        ? `${property.type}[]`
        : property.type;

      if (!isArtefactPropertyType(type)) {
        fail(
          `the edge property "${edge.name}" is of type ${type}, not Artefact or Artefact[].`);
      }
    }
  }
}

/**
 * Whether an edge property applies to a definition: its definition is named
 * in the heading, or none is, and the definition has the property.
 */
function appliesTo(
    edge: DiagramEdgeProperty,
    definition: ArtefactDefinition
  ): boolean
{
  return (edge.definition === null
    || edge.definition === definition.name)
    && definition.properties.some(
      property => property.name === edge.property);
}

async function collectCandidates(
    artefactProvider: ArtefactProvider,
    document: DiagramDocument,
    definitions: ArtefactDefinition[]
  ): Promise<Map<string, Candidate>>
{
  const candidates = new Map<string, Candidate>();

  for (const artefact of await artefactProvider.getArtefacts(definitions)) {
    if (
      document.nodes.exclude.some(
        pattern =>
          matchesLocation(
            artefact.location,
            pattern))
    ) {
      continue;
    }

    candidates.set(
      artefact.location,
      { artefact,
        definitions:
          definitions
          .filter(
            definition => artefact.definitions.includes(definition.name))
          .sort(
            (left, right) => left.name.localeCompare(right.name)) });
  }

  return candidates;
}

/**
 * A pattern with a scheme matches the location, any other pattern the path
 * of a `file:` artefact relative to the project root.
 */
function matchesLocation(
    location: string,
    pattern: string
  ): boolean
{
  return minimatch(
    hasScheme(pattern)
      ? location
      : displayLocation(location),
    pattern);
}

/**
 * The roots and every candidate reachable from them along the followed
 * properties, up to the depth.
 */
async function walkFromRoots(
    document: DiagramDocument,
    candidates: Map<string, Candidate>,
    references: (
    candidate: Candidate,
    edge: DiagramEdgeProperty
  ) => Promise<string[]>,
    fail: (message: string) => never
  ): Promise<Set<string>>
{
  const root = document.root!;

  const follow =
    document.edges.filter(
      edge => root.follow.includes(edge.name));

  const reached = new Set<string>();

  let frontier: string[] = [ ];

  for (const item of root.artefacts) {
    const location =
      hasScheme(item)
      ? item
      : `${FILE_SCHEME}${toPosixPath(item)}`;

    if (!candidates.has(location)) {
      fail(
        `the root "${item}" is not an artefact of the node definitions.`);
    }

    reached.add(location);
    frontier.push(location);
  }

  for (
    let step = 0;
    frontier.length > 0
    && (root.depth === null
      || step < root.depth);
    step++
  ) {
    const next: string[] = [ ];

    for (const location of frontier) {
      for (const edge of follow) {
        for (
          const target of await references(
            candidates.get(location)!,
            edge)
        ) {
          if (!reached.has(target)) {
            reached.add(target);
            next.push(target);
          }
        }
      }
    }

    frontier = next;
  }

  return reached;
}

async function getLabel(
    document: DiagramDocument,
    candidate: Candidate,
    getData: (
    candidate: Candidate,
    definition: ArtefactDefinition
  ) => Promise<unknown>
  ): Promise<string>
{
  const label =
    document.nodes.label;

  if (label !== null) {
    for (const definition of candidate.definitions) {
      if (
        !definition.properties.some(
          property => property.name === label)
      ) {
        continue;
      }

      const value =
        getPropertyValue(
          await getData(
            candidate,
            definition),
          label);

      if (
        typeof value
        === 'string'
        && value.trim() !== ''
      ) {
        return value;
      }
    }
  }

  return displayLocation(
    candidate.artefact.location);
}

/**
 * The folder above the artefact's own folder, e.g. `libs` for
 * `libs/logging/package.json`; `null` for an artefact that is not a file or
 * has no such folder.
 */
function getFolderGroup(
    location: string
  ): string | null
{
  if (!location.startsWith(FILE_SCHEME)) {
    return null;
  }

  const folder =
    path.posix.dirname(
      path.posix.dirname(
        location.slice(FILE_SCHEME.length)));

  return folder === '.'
    ? null
    : folder;
}
