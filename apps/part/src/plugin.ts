import { type Location }
  from 'asljs-locator';
import { type Logger }
  from 'asljs-logging';
import { type ArtefactDataProvidingFunction }
  from './artefact-data-providing-function.js';
import { type ArtefactFiles }
  from './location.js';
import { type ArtefactDefinitionProperty }
  from './model/artefact-definition-property.js';
import { type ArtefactDefinition }
  from './model/artefact-definition.js';
import { type MarkdownDocumentProvider }
  from './providers/markdown-document-provider.js';
import { type RuleValidationFunction }
  from './rule-validation-function.js';

/**
 * Passed to a plugin factory once, when the plugin is loaded.
 */
export interface PluginContext
{
  logger: Logger;

  /**
   * Absolute path of the project root.
   */
  projectPath: string;

  /**
   * Absolute path of the plugin's folder: the library folder, or the folder
   * of the plugin file or package entry.
   */
  folder: string;

  markdownDocuments: MarkdownDocumentProvider;

  files: ArtefactFiles;

  /**
   * Definitions documented in the `*.md` files of a folder and its
   * subfolders. A relative folder is resolved from `folder`; the default is
   * `folder` itself.
   */
  readDefinitions(
    folder?: string
  ): Promise<ArtefactDefinition[]>;
}

/**
 * An artefact found by a plugin locator. The provider adds the definitions
 * the artefact matches.
 */
export interface LocatedArtefact
{
  /**
   * URI string with a scheme, e.g. `git:tag/v1.0.0`.
   */
  location: string;

  name: string;
}

/**
 * Returns all artefacts of one definition.
 */
export type ArtefactLocatingFunction =
  (
  ) =>
    Promise<LocatedArtefact[]>;

/**
 * Rule of a plugin-provided definition.
 */
export interface PluginArtefactDefinitionRule
{
  /**
   * Uppercase letters followed by digits, e.g. `RL1`.
   */
  id: string;

  /**
   * Rule title. Defaults to the id.
   */
  heading?: string;

  /**
   * Rule text.
   */
  content: string;
}

/**
 * Definition provided by a plugin. Definitions read with `readDefinitions`
 * fit this shape and keep their `path` and `locations`.
 */
export interface PluginArtefactDefinition
{
  name: string;
  description: string;
  rules?: PluginArtefactDefinitionRule[];
  properties?: ArtefactDefinitionProperty[];

  /**
   * Definition document path; relative location patterns resolve from its
   * folder.
   */
  path?: string;

  /**
   * Filesystem locations, as in a definition document's `Location` section.
   */
  locations?: Location[];
}

/**
 * What a plugin contributes. Every member except `name` is optional. Keys of
 * `locate`, `data` and `rules` are definition names; keys inside a `rules`
 * entry are rule ids.
 */
export interface Plugin
{
  name: string;

  /**
   * Changing the version invalidates the check results cached for rules this
   * plugin implements.
   */
  version?: string;

  definitions?: () => Promise<PluginArtefactDefinition[]>;
  locate?: Record<string, ArtefactLocatingFunction>;
  data?: Record<string, ArtefactDataProvidingFunction>;
  rules?: Record<string, Record<string, RuleValidationFunction>>;
}

/**
 * Default export of a plugin module.
 */
export type PluginFactory =
  (
    context: PluginContext
  ) =>
    Plugin | Promise<Plugin>;
