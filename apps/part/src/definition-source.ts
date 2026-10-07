import { minimatch }
  from 'minimatch';

/**
 * A definition source with its definition filter, as written in
 * `--definitions`: `<source>[;<include>[;<exclude>]]`, where `<include>` and
 * `<exclude>` are comma-separated name patterns.
 */
export interface DefinitionSourceSpec
{
  /**
   * Path or package specifier.
   */
  source: string;

  /**
   * Name patterns of the definitions to keep; empty keeps all.
   */
  include: string[];

  /**
   * Name patterns of the definitions to drop.
   */
  exclude: string[];
}

export function parseDefinitionSource(
    value: string
  ): DefinitionSourceSpec
{
  const [source = '', include = '', exclude = ''] =
    value.split(';');

  return { source:
             source.trim(),
           include:
             splitPatterns(include),
           exclude:
             splitPatterns(exclude) };
}

/**
 * Whether the filter keeps a definition. Patterns are globs matched against
 * the whole name, ignoring case: `*` matches any characters, `?` one.
 */
export function isDefinitionIncluded(
    spec: DefinitionSourceSpec,
    name: string
  ): boolean
{
  const matches =
    (
    pattern: string
  ): boolean =>
    minimatch(
      name,
      pattern,
      { nocase: true,
        dot: true });

  return (spec.include.length === 0
    || spec.include.some(matches))
    && !spec.exclude.some(matches);
}

function splitPatterns(
    value: string
  ): string[]
{
  return value
    .split(',')
    .map(
      pattern => pattern.trim())
    .filter(
      pattern => pattern !== '');
}
