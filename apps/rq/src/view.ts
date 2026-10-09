import { escapeHtml,
         page,
         serverUrl,
         startServer }
  from 'asljs-mdcli';
import { Server }
  from 'node:http';
import { display,
         loadGraph,
         RqGraph }
  from './graph.js';
import { getLogger,
         Io }
  from './io.js';
import { getAppearance,
         toMermaid }
  from './mermaid.js';
import { resolveTarget }
  from './scope.js';
import { getStatuses,
         NodeStatus }
  from './status.js';

export {
  DEFAULT_PORT
} from 'asljs-mdcli';

export interface ViewOptions
{
  /**
   * The requirement file or folder to view, relative to the working
   * directory.
   */
  target: string;

  /**
   * The port to listen on, exactly; 0 picks a free one. When absent, the
   * first free port from `DEFAULT_PORT` on.
   */
  port?: number;

  host?: string;
}

const MERMAID_MODULE =
  'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const STYLE =
  `.neutral { color: #757575; }
.green { color: #2e7d32; }
.red { color: #c62828; }
.amber { color: #b26a00; }`;

/**
 * Starts a web server for a requirement file or folder. `/` shows the graph,
 * whose nodes open the documents; a `.md` file of the folder is shown
 * rendered and any other file as it is. The graph is reloaded on every
 * request for `/`.
 */
export async function execView(
    io: Io,
    options: ViewOptions
  ): Promise<Server>
{
  const target =
    await resolveTarget(
      io.cwd,
      options.target);

  const folder =
    (await loadGraph(target)).folder;

  const server =
    await startServer(
      { folder,
        index:
          async () =>
          {
        const graph =
          await loadGraph(target);

        return renderIndex(
          graph,
          getStatuses(graph));
      },
        home: 'Requirements',
        style: STYLE,
        port: options.port,
        host: options.host,
        logger:
          getLogger(
            io,
            'rq.view') });

  io.stdout.write(
    `Serving ${folder} at ${serverUrl(server)}\n`);

  return server;
}

function renderIndex(
    graph: RqGraph,
    statuses: ReadonlyMap<string, NodeStatus>
  ): string
{
  const href =
    (
        file: string
      ): string | null =>
    {
    const relative =
      display(
        graph,
        file);

    return relative.startsWith('../')
      ? null
      : `/${encodeURI(relative)}`;
  };

  const title =
    (graph.roots.length === 1
    ? graph.nodes.get(graph.roots[0])?.title
    : null)
    ?? 'Requirements';

  const items =
    [ ...graph.nodes.entries() ]
    .map(
      (
          [file, node]
        ) =>
      {
        const link =
          href(file);

        const label =
          escapeHtml(
            node.title
            ?? display(
              graph,
              file));

        const { status } = statuses.get(file)!;

        const { colour } =
          getAppearance(
            node,
            statuses.get(file));

        const coverage =
          node.kind === 'requirement'
          ? `, ${node.status.coverage?.status ?? 'NOT CHECKED'}`
          : '';

        return `<li>${
          link === null
            ? label
            : `<a href="${escapeHtml(link)}">${label}</a>`
        } <span class="${colour}">(${node.kind}, ${status}${coverage})</span></li>`;
      });

  const problems =
    graph.errors.length === 0
    ? ''
    : `<h2>Problems</h2>
<ul>
${
      graph.errors
        .map(
          error => `<li>${escapeHtml(error)}</li>`)
        .join('\n')
    }
</ul>
`;

  return page(
    title,
    `<h1>${escapeHtml(title)}</h1>
<pre class="mermaid">
${
      escapeHtml(
        toMermaid(
          graph,
          href,
          statuses))
    }
</pre>
${problems}<h2>Documents</h2>
<ul>
${items.join('\n')}
</ul>
<script type="module">
import mermaid from '${MERMAID_MODULE}';
mermaid.initialize({ startOnLoad: true, securityLevel: 'loose' });
</script>`,
    STYLE);
}
