import { Logger }
  from 'asljs-logging';
import { ArtefactDefinition }
  from '../model/artefact-definition.js';
import { DefinitionSourceProvider }
  from './definition-source-provider.js';
import { DefinitionFileParsingContext,
         MarkdownDefinitionReader }
  from './markdown-definition-reader.js';

export {
  DefinitionFileParsingContext
};

export interface ArtefactDefinitionProvider
{
  /**
   * Finds an artefact definition by name. Returns undefined if not found.
   */
  findDefinition(
    definitionName: string
  ): Promise<ArtefactDefinition | undefined>;

  /**
   * Gets an artefact definition by name. Throws an error if not found.
   */
  getDefinition(
    definitionName: string
  ): Promise<ArtefactDefinition>;

  /**
   * Gets all artefact definitions of all definition sources.
   */
  getDefinitions(): Promise<ArtefactDefinition[]>;

  /**
   * Loads an artefact definition from a file. The file must be a Markdown file
   * with the correct structure. Throws an error if the file cannot be parsed.
   * The file path must be absolute.
   */
  fromFile(
    filePath: string
  ): Promise<ArtefactDefinition>;

  /**
   * Tries to parse an artefact definition from a Markdown document. Returns
   * undefined if the document cannot be parsed. The context provides the path
   * to the definition file being parsed, which is used to resolve relative
   * paths in the artefact definition.
   */
  tryParse(
    content: string,
    context: DefinitionFileParsingContext
  ): ArtefactDefinition | undefined;
}

export class ArtefactDefinitionProviderImpl
  implements ArtefactDefinitionProvider
{
  constructor(
    private readonly logger: Logger,
    private readonly markdownDefinitionReader: MarkdownDefinitionReader,
    private readonly definitionSourceProvider: DefinitionSourceProvider
  )
  {
  }

  async findDefinition(
    definitionName: string
  ): Promise<ArtefactDefinition | undefined>
  {
    const definitions =
      await this.getDefinitions();

    const definition =
      definitions
      .find(
        item => item.name === definitionName);

    this.logger.trace(
      'findDefinition() { %s => %s }',
      definitionName,
      definition
        ? 'found'
        : 'not found');

    return definition;
  }

  async getDefinition(
    definitionName: string
  ): Promise<ArtefactDefinition>
  {
    const definition =
      await this.findDefinition(
        definitionName);

    if (!definition) {
      throw new Error(
        `Definition "${definitionName}" not found.`);
    }

    return definition;
  }

  getDefinitions(): Promise<ArtefactDefinition[]>
  {
    return this.definitionSourceProvider.getDefinitions();
  }

  fromFile(
    filePath: string
  ): Promise<ArtefactDefinition>
  {
    return this.markdownDefinitionReader.fromFile(
      filePath);
  }

  tryParse(
    content: string,
    context: DefinitionFileParsingContext
  ): ArtefactDefinition | undefined
  {
    return this.markdownDefinitionReader.tryParse(
      content,
      context);
  }
}
