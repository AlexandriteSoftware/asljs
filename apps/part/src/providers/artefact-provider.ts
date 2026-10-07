import { LocationResolver }
  from 'asljs-locator';
import { Logger }
  from 'asljs-logging';
import path
  from 'node:path';
import { hasScheme,
         toFileLocation }
  from '../location.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { Artefact }
  from '../model/artefact.js';
import { LocatedArtefact }
  from '../plugin.js';
import { ArtefactDefinitionProvider }
  from './artefact-definition-provider.js';
import { DefinitionSourceProvider }
  from './definition-source-provider.js';

/**
 * Provides artefacts based on definitions. Locates the artefacts of every
 * definition once and caches the result, considering it immutable.
 */
export class ArtefactProvider
{
  private locationResolver: LocationResolver;
  private readonly projectRootPath: string;
  #index: Promise<Map<string, Artefact>> | null = null;

  constructor(
    private readonly logger: Logger,
    private readonly artefactDefinitionProvider: ArtefactDefinitionProvider,
    private readonly definitionSourceProvider: DefinitionSourceProvider,
    private readonly projectPath: string
  )
  {
    if (!path.isAbsolute(projectPath)) {
      throw new Error(
        `'projectPath' must be absolute: ${projectPath}`);
    }

    this.projectRootPath =
      path.normalize(
        path.resolve(
          projectPath));

    this.locationResolver =
      new LocationResolver(
        this.logger,
        this.projectRootPath);
  }

  /**
   * Finds the artefact at a location. A value without a scheme is a file path,
   * absolute or relative to the project root.
   */
  async tryGetArtefact(
    location: string
  ): Promise<Artefact | null>
  {
    this.logger.trace(
      'tryGetArtefact() { %s }',
      location);

    const index =
      await this.#getIndex();

    const artefact =
      index.get(
        this.#toLocation(
          location));

    if (!artefact) {
      this.logger.trace(
        'tryGetArtefact() { %s is not matched by any artefact definition }',
        location);

      return null;
    }

    return copyArtefact(artefact);
  }

  /**
   * Artefacts that match any of the given definitions, or all artefacts when
   * no definitions are given, sorted by location. Each artefact lists every
   * definition it matches.
   */
  async getArtefacts(
    definitions?: ArtefactDefinition[]
  ): Promise<Artefact[]>
  {
    this.logger.trace(
      'getArtefacts(%s)',
      definitions
        ?.map(
          definition => definition.name)
        .join(', ')
        ?? '');

    const index =
      await this.#getIndex();

    const names =
      definitions
      ? new Set(
        definitions.map(
          definition => definition.name))
      : null;

    return [ ...index.values() ]
      .filter(
        artefact =>
          !names
          || artefact.definitions.some(
            name => names.has(name)))
      .map(copyArtefact);
  }

  async isArtefactOfDefinition(
    location: string,
    definition: ArtefactDefinition
  ): Promise<boolean>
  {
    const artefact =
      await this.tryGetArtefact(
        location);

    return artefact !== null
      && artefact.definitions.includes(
        definition.name);
  }

  async getDefinitionsForArtefact(
    location: string
  ): Promise<ArtefactDefinition[]>
  {
    const artefact =
      await this.tryGetArtefact(
        location);

    if (!artefact) {
      return [ ];
    }

    const definitions =
      await this.artefactDefinitionProvider.getDefinitions();

    return definitions.filter(
      definition =>
        artefact.definitions.includes(
          definition.name));
  }

  #toLocation(
    value: string
  ): string
  {
    if (hasScheme(value)) {
      return value;
    }

    return toFileLocation(
      this.projectRootPath,
      path.resolve(
        this.projectRootPath,
        value));
  }

  #getIndex(): Promise<Map<string, Artefact>>
  {
    this.#index ??= this.#buildIndex();

    return this.#index;
  }

  async #buildIndex(): Promise<Map<string, Artefact>>
  {
    const definitions =
      await this.artefactDefinitionProvider.getDefinitions();

    const index = new Map<string, Artefact>();

    for (const definition of definitions) {
      const located =
        await this.#locate(
          definition);

      this.logger.trace(
        '#buildIndex() { %s: %d artefacts }',
        definition.name,
        located.length);

      for (const item of located) {
        const artefact =
          index.get(item.location)
          ?? { location: item.location,
               name: item.name,
               definitions: [ ] };

        if (!artefact.definitions.includes(definition.name)) {
          artefact.definitions.push(
            definition.name);
        }

        index.set(
          item.location,
          artefact);
      }
    }

    const sorted =
      [ ...index.values() ]
      .sort(
        (left, right) =>
          left.location.localeCompare(
            right.location));

    return new Map(
      sorted.map(
        artefact => [ artefact.location,
                      artefact ] as const));
  }

  /**
   * A plugin locator replaces the definition's `Location` section.
   */
  async #locate(
    definition: ArtefactDefinition
  ): Promise<LocatedArtefact[]>
  {
    const locator =
      await this.definitionSourceProvider.findLocator(
        definition.name);

    if (locator) {
      try {
        return await locator();
      } catch (error) {
        const message =
          error instanceof Error
          ? error.message
          : String(error);

        throw new Error(
          `Locator of definition "${definition.name}" failed: ${message}`);
      }
    }

    if (
      !definition.path
      || definition.locations.length === 0
    ) {
      return [ ];
    }

    const paths =
      await this.locationResolver
      .resolve(
        path.dirname(
          definition.path),
        definition.locations);

    const located: LocatedArtefact[] = [ ];

    for (const artefactPath of paths) {
      if (!this.isPathInsideProject(artefactPath)) {
        this.logger.trace(
          '#locate() { %s is outside project root and ignored }',
          artefactPath);

        continue;
      }

      located.push(
        { location:
            toFileLocation(
              this.projectRootPath,
              artefactPath),
          name:
            path.basename(
              artefactPath,
              path.extname(artefactPath)) });
    }

    return located;
  }

  private isPathInsideProject(
    candidatePath: string
  ): boolean
  {
    const normalisedCandidatePath =
      path.normalize(
        path.resolve(
          candidatePath));

    const relativePath =
      path.relative(
        this.projectRootPath,
        normalisedCandidatePath);

    if (relativePath === '') {
      return true;
    }

    if (path.isAbsolute(relativePath)) {
      return false;
    }

    return !relativePath.startsWith('..');
  }
}

function copyArtefact(
    artefact: Artefact
  ): Artefact
{
  return { ...artefact,
           definitions:
             [ ...artefact.definitions ] };
}
