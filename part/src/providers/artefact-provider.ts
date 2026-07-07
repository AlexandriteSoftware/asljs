import path
  from 'node:path';
import { toPosixPath }
  from '../formatting.js';
import { FilesystemLocationResolver }
  from './filesystem-location-resolver.js';
import { getInstanceId }
  from './../framework.js';
import { Artefact }
  from '../artefact.js';
import { ArtefactDefinition }
  from '../artefact-definition.js';
import { DefinitionProvider }
  from './definition-provider.js';
import { Logger }
  from '../logging.js';

/**
 * Provides artefacts based on definitions. Caches artefacts in memory to avoid
 * redundant file system operations.
 */
export class ArtefactProvider
{
  private logger: Logger;
  private definitionsProvider: DefinitionProvider;
  private locationResolver: FilesystemLocationResolver;

  public rootPath: string;

  constructor(
    logger: Logger,
    rootPath: string,
    definitionsProvider: DefinitionProvider)
  {
    this.logger =
      logger.scope(
        { instanceId:
            getInstanceId(
              'ArtefactProvider') });

    this.rootPath = path.resolve(rootPath);
    this.definitionsProvider = definitionsProvider;

    this.locationResolver =
      new FilesystemLocationResolver(
        this.logger,
        this.rootPath);
  }

  async tryGetArtefact(
      artefactPath: string
    ): Promise<Artefact | null>
  {
    this.logger.trace(
      `tryGetArtefact(${artefactPath})`);

    const artefactFullPath =
      path.resolve(
        this.rootPath,
        artefactPath);

    if (!path.isAbsolute(artefactPath)) {
      this.logger.trace(
        `tryGetArtefact() { ${artefactPath} is resolved to ${artefactFullPath} }`);
    }

    const definitions =
      await this.getDefinitionsForArtefact(
        artefactFullPath);

    if (definitions.length === 0) {
      this.logger.trace(
        `tryGetArtefact() { ${artefactPath} is not matched by any artefact definition }`);

      return null;
    }

    return await this.buildArtefact(
      this.rootPath,
      definitions,
      artefactFullPath);
  }

  async getArtefacts(
      definitions?: ArtefactDefinition[]
    ): Promise<Artefact[]>
  {
    if (this.logger.level === 'trace') {
      let definitionsList;

      if (definitions) {
        definitionsList =
          definitions
            .map(
              definition => definition.name)
            .join(', ');
      } else {
        definitionsList = '';
      }

      this.logger.trace(
        `getArtefacts(${definitionsList})`);
    }

    if (definitions === null) {
      definitions =
        await this.definitionsProvider.getDefinitions();
    }

    const artefactPaths = new Set<string>();

    for (const definition of definitions || []) {
      const paths =
        await this.locationResolver
          .resolve(
            path.dirname(
              definition.path),
            definition.location);
      
      for (const artefactPath of paths) {
        artefactPaths.add(artefactPath);
      }
    }

    const artefacts = [];

    for (const artefactPath of artefactPaths) {
      const artefactDefinitions =
        await this.getDefinitionsForArtefact(
          artefactPath);

      artefacts.push(
        await this.buildArtefact(
          this.rootPath,
          artefactDefinitions,
          artefactPath));
    }

    artefacts.sort(
      (left, right) =>
        left.relativePath.localeCompare(
          right.relativePath));

    return artefacts;
  }

  async isArtefactOfDefinition(
      artefactPath: string,
      definition: ArtefactDefinition
    ): Promise<boolean>
  {
    const artafactFullPath =
      path.normalize(
        path.resolve(
          this.rootPath,
          artefactPath));

    const match =
      await this.locationResolver
        .check(
          artafactFullPath,
          path.dirname(
            definition.path),
          definition.location);
      
    return match;
  }

  async getDefinitionsForArtefact(
      artefactFilePath: string
    ): Promise<ArtefactDefinition[]>
  {
    const definitions =
      await this.definitionsProvider.getDefinitions();

    const matchingDefinitions = [];

    for (const definition of definitions) {
      if (
        await this.isArtefactOfDefinition(
          artefactFilePath,
          definition))
      {
        matchingDefinitions.push(definition);
      }
    }

    return matchingDefinitions;
  }

  async buildArtefact(
      projectDirectory: string,
      definitions: ArtefactDefinition[],
      artefactPath: string
    ): Promise<Artefact>
  {
    const artefact: Artefact =
      { path: artefactPath,
        relativePath:
          toPosixPath(
            path.relative(
              projectDirectory,
              artefactPath)),
        basePath:
          projectDirectory,
        name:
          path.basename(
            artefactPath,
            path.extname(artefactPath)),
        definitions:
          definitions
            .map(
              definition => definition.name) };

    return artefact;
  }
}
