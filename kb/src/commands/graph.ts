import { Environment }
  from '../environment.js';
import { createLinkGraph }
  from '../graph.js';
import { resolveOutputFormat,
         writeJson,
         writeLines }
  from '../output.js';

export interface GraphCommandOptions
{
  path?: string;
  pattern?: string;
  hidden?: boolean;
  format?: string;
}

/**
 * Report the article and link collections.
 *
 * A one-shot command has no index to reuse, so it builds one, unless the host
 * already keeps one current.
 */
export async function execGraph(
    environment: Environment,
    options: GraphCommandOptions = {}
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const graph =
    environment.graph
    ?? await createLinkGraph(
      environment.library,
      { pattern: options.pattern,
        hidden: options.hidden === true });

  if (
    options.path === undefined
    || options.path === ''
  ) {
    const stats =
      graph.stats();

    if (format === 'json') {
      writeJson(
        environment,
        stats);

      return;
    }

    writeLines(
      environment,
      [ `articles: ${stats.articles}`,
        `links: ${stats.links}`,
        `external: ${stats.external}` ]);

    return;
  }

  const article =
    graph.article(options.path) ?? null;

  const outgoing =
    graph.outgoing(options.path);

  const incoming =
    graph.incoming(options.path);

  if (format === 'json') {
    writeJson(
      environment,
      { article,
        outgoing,
        incoming });

    return;
  }

  writeLines(
    environment,
    [ `path: ${options.path}`,
      `title: ${article?.title ?? ''}`,
      `outgoing: ${outgoing.length}`,
      ...outgoing.map(
        link =>
        `  -> ${link.target} (line ${link.line})`),
      `incoming: ${incoming.length}`,
      ...incoming.map(
        link =>
        `  <- ${link.from}:${link.line}:${link.column} ${link.target}`) ]);
}
