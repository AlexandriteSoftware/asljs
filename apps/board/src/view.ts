import { escapeHtml,
         page,
         serverUrl,
         startServer }
  from 'asljs-mdcli';
import { Server }
  from 'node:http';
import { getLogger,
         Io }
  from './io.js';
import { FOLDERS,
         ITEM_KINDS,
         loadBoard }
  from './items.js';
import { Card,
         toCards }
  from './list.js';

export interface ViewOptions
{
  /**
   * The port to listen on, exactly; 0 picks a free one. When absent, the
   * first free port from 3000 on.
   */
  port?: number;

  host?: string;
}

const STYLE =
  `body { max-width: none; }
.board { display: grid; grid-template-columns: repeat(4, minmax(12rem, 1fr)); gap: 1rem; align-items: start; }
.column { background: #f4f4f4; border-radius: 6px; padding: 0.5rem; }
.column h2 { font-size: 1rem; margin: 0.25rem 0.25rem 0.75rem; }
.card { display: block; background: #fff; border: 1px solid #ddd; border-left: 4px solid #9e9e9e; border-radius: 4px; padding: 0.5rem; margin-bottom: 0.5rem; color: inherit; text-decoration: none; }
.card:hover { border-color: #888; }
.card .id { font-weight: 600; }
.card .meta { font-size: 0.8rem; color: #666; margin-top: 0.25rem; }
.status-DONE, .status-PLANNED, .status-TASKS { border-left-color: #2e7d32; }
.status-FAILED { border-left-color: #c62828; }
.status-BLOCKED, .questions { border-left-color: #ef8f00; }
.problems { color: #c62828; }`;

/**
 * Starts a web server for the board folder. `/` shows the board, a column
 * each for Ideas, Plans, Tasks and Results, whose cards open the documents;
 * a `.md` file is shown rendered. The board is read again on every request
 * for `/`.
 */
export async function execView(
    io: Io,
    options: ViewOptions
  ): Promise<Server>
{
  const server =
    await startServer(
      { folder: io.cwd,
        index:
          async () =>
        renderBoard(
          await loadBoard(io.cwd)),
        home: 'Board',
        style: STYLE,
        port: options.port,
        host: options.host,
        logger:
          getLogger(
            io,
            'board.view') });

  io.stdout.write(
    `Serving ${io.cwd} at ${serverUrl(server)}\n`);

  return server;
}

function renderBoard(
    board: Awaited<ReturnType<typeof loadBoard>>
  ): string
{
  const columns =
    toCards(board);

  const problems =
    board.problems.length === 0
    ? ''
    : `<ul class="problems">
${
      board.problems
        .map(
          problem => `<li>${escapeHtml(problem)}</li>`)
        .join('\n')
    }
</ul>
`;

  return page(
    'Board',
    `<h1>Board</h1>
${problems}<div class="board">
${
      ITEM_KINDS
        .map(
          kind =>
            `<section class="column">
<h2>${FOLDERS[kind]} (${columns[kind].length})</h2>
${
              columns[kind]
                .map(renderCard)
                .join('\n')
            }
</section>`)
        .join('\n')
    }
</div>`,
    STYLE);
}

function renderCard(
    card: Card
  ): string
{
  const questions =
    card.openQuestions === 0
    ? ''
    : ` - ${card.openQuestions} open questions`;

  return `<a class="card status-${escapeHtml(card.status)}${
    card.openQuestions === 0
      ? ''
      : ' questions'
  }" href="/${encodeURI(card.path)}"><span class="id">${
    escapeHtml(card.id)
  }</span> ${escapeHtml(card.subject)}<div class="meta">${
    escapeHtml(card.status)
  }${escapeHtml(questions)}</div></a>`;
}
