import path
  from 'node:path';
import { toPosixPath }
  from '../formatting.js';
import { Logger }
  from '../logging/logging.js';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { Artefact }
  from '../model/artefact.js';
import { ArtefactDefinitionProvider }
  from './artefact-definition-provider.js';
import { FilesystemLocationResolver }
  from './filesystem-location-resolver.js';

/**
 * Provides artefacts based on definitions. Caches artefacts in memory to avoid
 * redundant file system operations.
 */
export class ArtefactProvider
{
  private locationResolver: FilesystemLocationResolver;
  private readonly projectRootPath: string;

  constructor(
    private readonly logger: Logger,
    private readonly artefactDefinitionProvider: ArtefactDefinitionProvider,
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
      new FilesystemLocationResolver(
        this.logger,
        this.projectRootPath);
  }

  async tryGetArtefact(
    artefactPath: string
  ): Promise<Artefact | null>
  {
    this.logger.trace(
      'tryGetArtefact() { %s }',
      artefactPath);

    const artefactFullPath =
      path.resolve(
        this.projectPath,
        artefactPath);

    if (!path.isAbsolute(artefactPath)) {
      this.logger.trace(
        'tryGetArtefact() { %s is resolved to %s }',
        artefactPath,
        artefactFullPath);
    }

    if (!this.isPathInsideProject(artefactFullPath)) {
      this.logger.trace(
        'tryGetArtefact() { %s is outside project root and ignored }',
        artefactFullPath);

      return null;
    }

    const definitions =
      await this.getDefinitionsForArtefact(
        artefactFullPath);

    if (definitions.length === 0) {
      this.logger.trace(
        'tryGetArtefact() { %s is not matched by any artefact definition }',
        artefactPath);

      return null;
    }

    return await this.buildArtefact(
      this.projectPath,
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
        'getArtefacts(%s)',
        definitionsList);
    }

    if (definitions === null) {
      definitions =
        await this.artefactDefinitionProvider.getDefinitions();
    }

    const artefactPaths = new Set<string>();

    for (const definition of definitions || [ ]) {
      const paths =
        await this.locationResolver
        .resolve(
          path.dirname(
            definition.path),
          definition.locations);

      for (const artefactPath of paths) {
        if (!this.isPathInsideProject(artefactPath)) {
          this.logger.trace(
            'getArtefacts() { %s is outside project root and ignored }',
            artefactPath);

          continue;
        }

        artefactPaths.add(artefactPath);
      }
    }

    const artefacts = [ ];

    for (const artefactPath of artefactPaths) {
      const artefactDefinitions =
        await this.getDefinitionsForArtefact(
          artefactPath);

      artefacts.push(
        await this.buildArtefact(
          this.projectPath,
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
    const artifactFullPath =
      path.normalize(
        path.resolve(
          this.projectPath,
          artefactPath));

    if (!this.isPathInsideProject(artifactFullPath)) {
      return false;
    }

    const match =
      await this.locationResolver
      .check(
        artifactFullPath,
        path.dirname(
          definition.path),
        definition.locations);

    return match;
  }

  async getDefinitionsForArtefact(
    artefactFilePath: string
  ): Promise<ArtefactDefinition[]>
  {
    const definitions =
      await this.artefactDefinitionProvider.getDefinitions();

    const matchingDefinitions = [ ];

    for (const definition of definitions) {
      if (
        await this.isArtefactOfDefinition(
          artefactFilePath,
          definition)
      ) {
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
        basePath: projectDirectory,
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
