import { ExportPayload }
  from './export-import.js';

export type SharePayloadMinifyLoader =
  | 'js'
  | 'jsx'
  | 'ts'
  | 'tsx'
  | 'css';

export type SharePayloadTransformer = (
  source: string,
  loader: SharePayloadMinifyLoader
) => Promise<string>;

export async function minifySharePayload(
    payload: ExportPayload,
    transform: SharePayloadTransformer
  ): Promise<ExportPayload>
{
  const files =
    { ...payload.files };

  for (
    const [fileName, content] of Object.entries(
      payload.files
    )
  ) {
    const loader =
      resolveLoaderFromFileName(fileName);

    if (loader !== null) {
      files[fileName] = await transform(
        content,
        loader
      );

      continue;
    }

    if (isHtmlFile(fileName)) {
      files[fileName] = compactHtml(content);
    }
  }

  return {
    ...payload,
    files
  };
}

function resolveLoaderFromFileName(
    fileName: string
  ): SharePayloadMinifyLoader | null
{
  const lower =
    fileName.toLowerCase();

  if (lower.endsWith('.css')) {
    return 'css';
  }

  if (lower.endsWith('.ts')) {
    return 'ts';
  }

  if (lower.endsWith('.tsx')) {
    return 'tsx';
  }

  if (lower.endsWith('.jsx')) {
    return 'jsx';
  }

  if (
    lower.endsWith('.js')
    || lower.endsWith('.mjs')
    || lower.endsWith('.cjs')
  ) {
    return 'js';
  }

  return null;
}

function isHtmlFile(
    fileName: string
  ): boolean
{
  const lower =
    fileName.toLowerCase();

  return lower.endsWith('.html')
    || lower.endsWith('.htm');
}

function compactHtml(
    html: string
  ): string
{
  const preservedBlocks: string[] = [];

  const withPlaceholders =
    html.replace(
      /<(pre|textarea|script|style)\b[\s\S]*?<\/\1>/gi,
      (block: string) =>
    {
      const index =
        preservedBlocks.push(block) - 1;

      return `__ASLJS_HTML_BLOCK_${index}__`;
    });

  const compacted =
    withPlaceholders
    .replace(
      /<!--([\s\S]*?)-->/g,
      ''
    )
    .replace(
      />\s+</g,
      '><'
    )
    .replace(
      /\s{2,}/g,
      ' '
    )
    .trim();

  return compacted.replace(
    /__ASLJS_HTML_BLOCK_(\d+)__/g,
    (_token: string, indexText: string) =>
      preservedBlocks[
        Number.parseInt(
          indexText,
          10
        )
      ] ?? ''
  );
}
