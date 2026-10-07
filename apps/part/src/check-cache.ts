import { Logger }
  from 'asljs-logging';
import { createHash }
  from 'node:crypto';
import { mkdir,
         readFile,
         writeFile }
  from 'node:fs/promises';
import path
  from 'node:path';

/**
 * Path of the cache file, relative to the project root.
 */
export const CHECK_CACHE_PATH =
  '.part/check-cache.json';

/**
 * A cached rule result for one artefact.
 */
export interface CheckCacheEntry
{
  /**
   * When the rule started running, as an ISO date.
   */
  checkedAt: string;

  /**
   * Hash of the rule content, see `hashRuleContent`.
   */
  ruleHash: string;

  /**
   * `code` for a plugin implementation, `ai` for an AI agent.
   */
  mode: 'code' | 'ai';

  /**
   * Name and version of the plugin implementing the rule; empty for `ai`.
   */
  plugin: string;
  version: string;

  result: 'Ok' | 'Fail';
  message: string;
}

interface CheckCacheFile
{
  version: 1;

  /**
   * Keyed by artefact location, then rule name.
   */
  entries: Record<string, Record<string, CheckCacheEntry>>;
}

/**
 * Check results of earlier runs, stored in `.part/check-cache.json` under the
 * project root.
 */
export class CheckCache
{
  private constructor(
    private readonly logger: Logger,
    private readonly filePath: string,
    private readonly entries: Map<string, Map<string, CheckCacheEntry>>
  )
  {
  }

  /**
   * Loads the cache of the project. A missing or unreadable file gives an
   * empty cache.
   */
  static async load(
    logger: Logger,
    projectPath: string
  ): Promise<CheckCache>
  {
    const filePath =
      path.join(
        projectPath,
        CHECK_CACHE_PATH);

    const entries = new Map<string, Map<string, CheckCacheEntry>>();

    try {
      const content: CheckCacheFile =
        JSON.parse(
          await readFile(
            filePath,
            'utf8'));

      for (
        const [location, rules] of Object.entries(
          content.entries
            ?? {})
      ) {
        entries.set(
          location,
          new Map(
            Object.entries(rules)));
      }
    } catch (error) {
      logger.trace(
        'CheckCache.load() { starting empty: %s }',
        error);
    }

    return new CheckCache(
      logger,
      filePath,
      entries);
  }

  get(
    location: string,
    ruleName: string
  ): CheckCacheEntry | undefined
  {
    return this.entries
      .get(location)
      ?.get(ruleName);
  }

  set(
    location: string,
    ruleName: string,
    entry: CheckCacheEntry
  ): void
  {
    let rules =
      this.entries.get(
        location);

    if (!rules) {
      rules = new Map();

      this.entries.set(
        location,
        rules);
    }

    rules.set(
      ruleName,
      entry);
  }

  /**
   * Writes the cache, dropping entries for which `keep` returns false, e.g.
   * artefacts or rules that no longer exist.
   */
  async save(
    keep: (location: string, ruleName: string) => boolean
  ): Promise<void>
  {
    const content: CheckCacheFile =
      { version: 1,
        entries: {} };

    const locations =
      [ ...this.entries.keys() ].sort();

    for (const location of locations) {
      const rules: Record<string, CheckCacheEntry> = {};

      const ruleNames =
        [ ...this.entries.get(location)!.keys() ].sort();

      for (const ruleName of ruleNames) {
        if (
          keep(
            location,
            ruleName)
        ) {
          rules[ruleName] =
            this.entries.get(location)!.get(ruleName)!;
        }
      }

      if (Object.keys(rules).length > 0) {
        content.entries[location] = rules;
      }
    }

    await mkdir(
      path.dirname(
        this.filePath),
      { recursive: true });

    await writeFile(
      this.filePath,
      `${
        JSON.stringify(
          content,
          null,
          2)
      }\n`,
      'utf8');

    this.logger.trace(
      'CheckCache.save() { %s }',
      this.filePath);
  }
}

export function hashRuleContent(
    content: string
  ): string
{
  return createHash('sha256')
    .update(content)
    .digest('hex');
}
