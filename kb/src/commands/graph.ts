import { Article,
         GraphLink,
         GraphStats }
  from '../graph.js';
import { resolveOutputFormat,
         writeResult }
  from '../output.js';
import { CommandContext }
  from './context.js';

export interface GraphCommandOptions
{
  path?: string;
  format?: string;
}

interface ArticleReport
{
  article: Article | null;
  outgoing: GraphLink[];
  incoming: GraphLink[];
}

/**
 * Report the article and link collections, or describe one article.
 */
export async function execGraph(
    context: CommandContext,
    options: GraphCommandOptions = {}
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const result =
    await context.client.call(
      'kb_graph',
      { path: options.path });

  if (
    options.path === undefined
    || options.path === ''
  ) {
    const stats =
      result as GraphStats;

    writeResult(
      context.environment,
      format,
      stats,
      describeStats(stats));

    return;
  }

  const report =
    result as ArticleReport;

  writeResult(
    context.environment,
    format,
    report,
    describeArticle(
      options.path,
      report));
}

function describeStats(
    stats: GraphStats
  ): string[]
{
  return [ `articles: ${stats.articles}`,
           `links: ${stats.links}`,
           `external: ${stats.external}` ];
}

function describeArticle(
    documentPath: string,
    report: ArticleReport
  ): string[]
{
  const lines =
    [ `path: ${documentPath}`,
      `title: ${report.article?.title ?? ''}`,
      `outgoing: ${report.outgoing.length}` ];

  for (const link of report.outgoing) {
    lines.push(
      `  -> ${link.target} (line ${link.line})`);
  }

  lines.push(
    `incoming: ${report.incoming.length}`);

  for (const link of report.incoming) {
    lines.push(
      `  <- ${link.from}:${link.line}:${link.column} ${link.target}`);
  }

  return lines;
}
