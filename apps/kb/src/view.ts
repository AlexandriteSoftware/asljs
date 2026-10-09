import { escapeHtml,
         page,
         startServer }
  from 'asljs-mdcli';
import { Server }
  from 'node:http';
import path
  from 'node:path';
import { Environment }
  from './environment.js';
import { listEntries }
  from './files.js';
import { messageOf }
  from './formatting.js';
import { renderDocument }
  from './render.js';
import { searchLibrary,
         SearchMatch }
  from './search.js';

/**
 * How many matches a search page shows.
 */
const MAX_RESULTS = 200;

const STYLE =
  `form.search { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin: 1rem 0; }
form.search input[type=search] { flex: 1; min-width: 12rem; padding: 0.4rem; }
ul.matches { list-style: none; padding: 0; }
ul.matches li { margin: 0.25rem 0 0.25rem 1rem; }
.line { color: #666; font-variant-numeric: tabular-nums; }
.missing-link { color: #b00; }
.note { color: #666; }`;

export interface ViewOptions
{
  /**
   * The port to listen on, exactly; 0 picks a free one. When absent, the
   * first free port from 3000 on.
   */
  port?: number;

  host?: string;
}

/**
 * Serve the library in a browser: `/` lists its markdown documents with a
 * search form, `/search` searches the text of every readable document, and a
 * markdown document is shown rendered as `renderDocument` renders it. Other
 * files are served as they are; dot files and folders and `node_modules` are
 * not served. The library is read directly, on every request.
 */
export async function startView(
    environment: Environment,
    options: ViewOptions = {}
  ): Promise<Server>
{
  const root = environment.library;

  return startServer(
    { folder: root,
      home: 'Library',
      style: STYLE,
      port: options.port,
      host: options.host,
      index:
        async () => await renderIndex(root),
      pages:
        { '/search':
            async url =>
          await renderSearch(
            environment,
            url) },
      render:
        async (
        _file,
        relative
      ) =>
        (await renderDocument(
          root,
          relative)).html,
      allow: isServed,
      logger:
        environment.loggerProvider.getLogger('kb.view') });
}

/**
 * Whether a library path may be served: not in or of a dot folder, a dot
 * file, or `node_modules`.
 */
export function isServed(
    relative: string
  ): boolean
{
  return !relative
    .split('/')
    .some(
      segment =>
        segment.startsWith('.')
        || segment === 'node_modules');
}

async function renderIndex(
    root: string
  ): Promise<string>
{
  const documents =
    (await listEntries(
      root,
      { pattern: '**/*.md',
        kind: 'file' }))
    .map(
      entry => entry.path)
    .sort();

  const folders = new Map<string, string[]>();

  for (const document of documents) {
    const folder =
      path.posix.dirname(document);

    folders.set(
      folder,
      [ ...folders.get(folder) ?? [ ],
        document ]);
  }

  const sections =
    [ ...folders ]
    .map(
      ([folder, paths]) =>
        `<h2>${
          escapeHtml(
            folder === '.'
              ? 'Library'
              : folder)
        }</h2>
<ul>
${
          paths
            .map(
              document =>
                `<li>${
                  link(
                    document,
                    path.posix.basename(
                      document,
                      '.md'))
                }</li>`)
            .join('\n')
        }
</ul>`)
    .join('\n');

  return page(
    'Library',
    `<h1>Library</h1>
${
      searchForm(
        '',
        false,
        false)
    }
<p class="note">${documents.length} documents</p>
${sections}`,
    STYLE);
}

async function renderSearch(
    environment: Environment,
    url: URL
  ): Promise<string>
{
  const query =
    url.searchParams.get('q') ?? '';

  const regex =
    url.searchParams.has('regex');

  const matchCase =
    url.searchParams.has('case');

  const form =
    searchForm(
      query,
      regex,
      matchCase);

  if (query.trim() === '') {
    return page(
      'Search',
      `<p><a href="/">Library</a></p>
<h1>Search</h1>
${form}`,
      STYLE);
  }

  let results: string;

  try {
    const report =
      await searchLibrary(
        environment.library,
        environment.readers,
        { query,
          regex,
          ignoreCase: !matchCase,
          maxResults: MAX_RESULTS });

    results =
      `<p class="note">${
      report.matches.length === 0
        ? 'No matches'
        : `${report.matches.length} matches`
    } in ${report.searchedFiles} documents${
      report.truncated
        ? `; only the first ${MAX_RESULTS} are shown`
        : ''
    }${
      report.skippedFiles.length === 0
        ? ''
        : `; ${report.skippedFiles.length} could not be read`
    }.</p>
${renderMatches(report.matches)}`;
  } catch (error) {
    results =
      `<p class="missing-link">${
      escapeHtml(
        messageOf(error))
    }</p>`;
  }

  return page(
    `Search: ${query}`,
    `<p><a href="/">Library</a></p>
<h1>Search</h1>
${form}
${results}`,
    STYLE);
}

function renderMatches(
    matches: SearchMatch[]
  ): string
{
  const byPath = new Map<string, SearchMatch[]>();

  for (const match of matches) {
    byPath.set(
      match.path,
      [ ...byPath.get(match.path) ?? [ ],
        match ]);
  }

  return [ ...byPath ]
    .map(
      ([document, found]) =>
        `<h2>${
          link(
            document,
            document)
        }</h2>
<ul class="matches">
${
          found
            .map(
              match =>
                `<li><span class="line">${match.line}</span> ${
                  escapeHtml(match.text)
                }</li>`)
            .join('\n')
        }
</ul>`)
    .join('\n');
}

function searchForm(
    query: string,
    regex: boolean,
    matchCase: boolean
  ): string
{
  return `<form class="search" action="/search">
<input type="search" name="q" value="${
    escapeHtml(query)
  }" placeholder="Search the library" autofocus>
<label><input type="checkbox" name="regex"${
    regex
      ? ' checked'
      : ''
  }> Regular expression</label>
<label><input type="checkbox" name="case"${
    matchCase
      ? ' checked'
      : ''
  }> Match case</label>
<button>Search</button>
</form>`;
}

function link(
    document: string,
    text: string
  ): string
{
  return `<a href="/${
    document
      .split('/')
      .map(
        segment => encodeURIComponent(segment))
      .join('/')
  }">${escapeHtml(text)}</a>`;
}
