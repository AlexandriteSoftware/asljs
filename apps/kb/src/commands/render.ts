import { resolveOutputFormat,
         writeJson }
  from '../output.js';
import { RenderedDocument }
  from '../render.js';
import { CommandContext }
  from './context.js';

export interface RenderCommandOptions
{
  path: string;
  format?: string;
}

/**
 * Print a markdown document rendered as HTML: the body, or with `json` its
 * path, title and HTML.
 */
export async function execRender(
    context: CommandContext,
    options: RenderCommandOptions
  ): Promise<void>
{
  const format =
    resolveOutputFormat(options.format);

  const rendered =
    await context.client.call(
      'kb_render',
      { path: options.path }) as RenderedDocument;

  if (format === 'json') {
    writeJson(
      context.environment,
      rendered);

    return;
  }

  context.environment.stdout.write(
    rendered.html.endsWith('\n')
      ? rendered.html
      : `${rendered.html}\n`);
}
