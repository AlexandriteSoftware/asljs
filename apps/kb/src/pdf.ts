import { page,
         runProgram }
  from 'asljs-mdcli';
import { existsSync }
  from 'node:fs';
import fs
  from 'node:fs/promises';
import os
  from 'node:os';
import path
  from 'node:path';
import { pathToFileURL }
  from 'node:url';
import { Environment }
  from './environment.js';
import { resolveLibraryPath,
         toLibraryPath }
  from './library.js';
import { renderDocument }
  from './render.js';

/**
 * The environment variable naming the browser that prints PDF files.
 */
export const BROWSER_VARIABLE = 'KB_BROWSER';

/**
 * Style for printing: no page width limit, and code that wraps.
 */
export const PRINT_STYLE =
  `@page { margin: 2cm; }
body { max-width: none; margin: 0; padding: 0; }
pre { white-space: pre-wrap; }
table { border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 0.25rem 0.5rem; }
.missing-link { color: #b00; }`;

export interface PdfOptions
{
  /**
   * Library-relative path of the PDF file. Defaults to the document's path
   * with `.pdf` for its extension.
   */
  output?: string;

  /**
   * Replace the PDF file when it already exists.
   */
  overwrite?: boolean;
}

export interface PdfResult
{
  /**
   * Library-relative path of the document.
   */
  path: string;

  /**
   * Library-relative path of the PDF file written.
   */
  output: string;
}

/**
 * Print a markdown document of the library to a PDF file of the library, as
 * `renderDocument` renders it. Its relative links and images resolve from the
 * document's folder.
 */
export async function writePdf(
    environment: Environment,
    documentPath: string,
    options: PdfOptions = {}
  ): Promise<PdfResult>
{
  const root = environment.library;

  const rendered =
    await renderDocument(
      root,
      documentPath);

  const output =
    options.output
    ?? rendered.path.replace(
      /\.md$/i,
      '.pdf');

  const absolute =
    resolveLibraryPath(
      root,
      output);

  if (
    !options.overwrite
    && existsSync(absolute)
  ) {
    throw new Error(
      `Already exists: ${
        toLibraryPath(
          root,
          absolute)
      }`);
  }

  const folder =
    path.dirname(
      resolveLibraryPath(
        root,
        rendered.path));

  const html =
    page(
      rendered.title,
      rendered.html,
      PRINT_STYLE)
    .replace(
      '<head>',
      `<head>\n<base href="${pathToFileURL(folder).href}/">`);

  await fs.mkdir(
    path.dirname(absolute),
    { recursive: true });

  await environment.resolve(printToPdf)(
    html,
    absolute);

  return { path: rendered.path,
           output:
             toLibraryPath(
               root,
               absolute) };
}

/**
 * Print an HTML page to a PDF file with a headless Chrome or Edge, the one
 * `findBrowser` finds.
 */
export async function printToPdf(
    html: string,
    output: string
  ): Promise<void>
{
  const browser =
    findBrowser(process.env);

  if (browser === null) {
    throw new Error(
      `No Chrome or Edge found to print the PDF; set ${BROWSER_VARIABLE} to its executable.`);
  }

  const work =
    await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        'asljs-kb-pdf-'));

  try {
    const source =
      path.join(
        work,
        'document.html');

    await fs.writeFile(
      source,
      html,
      'utf8');

    await fs.rm(
      output,
      { force: true });

    const run =
      await runProgram(
        browser,
        pdfArguments(
          source,
          output,
          path.join(
            work,
            'profile')),
        work);

    if (!existsSync(output)) {
      throw new Error(
        `${
          path.basename(browser)
        } did not write the PDF (exit code ${run.code}): ${
          (run.stderr || run.stdout).trim()
        }`);
    }
  } finally {
    await fs.rm(
      work,
      { recursive: true,
        force: true });
  }
}

/**
 * The arguments that make a Chromium browser print `source` to `output`
 * without a window, headers or footers, with a profile of its own so that a
 * browser already running is not used.
 */
export function pdfArguments(
    source: string,
    output: string,
    profile: string
  ): string[]
{
  return [ '--headless=new',
           '--disable-gpu',
           '--no-first-run',
           '--no-pdf-header-footer',
           `--user-data-dir=${profile}`,
           `--print-to-pdf=${output}`,
           pathToFileURL(source).href ];
}

/**
 * The executable of `KB_BROWSER`, else of the first Chrome, Chromium or Edge
 * installed in the usual place for the platform or found on `PATH`; `null`
 * when there is none.
 */
export function findBrowser(
    env: Record<string, string | undefined>,
    platform: NodeJS.Platform = process.platform,
    exists: (file: string) => boolean = existsSync
  ): string | null
{
  const override =
    env[BROWSER_VARIABLE]?.trim();

  if (
    override !== undefined
    && override !== ''
  ) {
    return override;
  }

  return browserCandidates(
    env,
    platform)
    .find(exists)
    ?? null;
}

function browserCandidates(
    env: Record<string, string | undefined>,
    platform: NodeJS.Platform
  ): string[]
{
  if (platform === 'win32') {
    const roots =
      [ env.PROGRAMFILES,
        env['PROGRAMFILES(X86)'],
        env.LOCALAPPDATA ]
      .filter(
        (root): root is string => root !== undefined && root !== '');

    return [ ...roots.map(
      root =>
          path.win32.join(
            root,
            'Google\\Chrome\\Application\\chrome.exe')),
             ...roots.map(
               root =>
          path.win32.join(
            root,
            'Microsoft\\Edge\\Application\\msedge.exe')) ];
  }

  if (platform === 'darwin') {
    return [ '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
             '/Applications/Chromium.app/Contents/MacOS/Chromium',
             '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' ];
  }

  const folders =
    (env.PATH ?? '')
    .split(path.delimiter)
    .filter(
      folder => folder !== '');

  return [ 'google-chrome',
           'google-chrome-stable',
           'chromium',
           'chromium-browser',
           'microsoft-edge' ]
    .flatMap(
      name =>
        folders.map(
          folder =>
            path.join(
              folder,
              name)));
}
