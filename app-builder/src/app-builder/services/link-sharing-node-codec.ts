import { transform }
  from 'esbuild';
import { runInNewContext }
  from 'node:vm';
import { gunzipSync,
         gzipSync }
  from 'node:zlib';
import { TextCompressionCodec }
  from './link-sharing.js';

export function createNodeEsbuildGzipBase64UrlCodec(
  ): TextCompressionCodec
{
  return {
    compress: compressTextInNode,
    decompress: decompressTextInNode
  };
}

async function compressTextInNode(
    text: string
  ): Promise<string>
{
  const source =
    `export default ${text};`;

  const result =
    await transform(
      source,
      {
      loader: 'js',
      format: 'esm',
      target: 'es2020',
      minify: true
    });

  const compressed =
    gzipSync(
      Buffer.from(
        result.code,
        'utf8'));

  return compressed.toString('base64url');
}

async function decompressTextInNode(
    value: string
  ): Promise<string>
{
  const compiledSource =
    gunzipSync(
      Buffer.from(
        value,
        'base64url')).toString(
          'utf8');

  const expression =
    extractDefaultExportExpression(compiledSource);

  const payload =
    runInNewContext(
      `(${expression})`,
      Object.create(null),
      {
      timeout: 100
    }) as unknown;

  return JSON.stringify(payload);
}

function extractDefaultExportExpression(
    compiledSource: string
  ): string
{
  const directMatch =
    compiledSource.match(
      /^\s*export\s+default\s+([\s\S]*?);?\s*$/);

  if (directMatch !== null && directMatch[1] !== undefined) {
    return directMatch[1];
  }

  const aliasedMatch =
    compiledSource.match(
      /^\s*(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]*?);\s*export\s*\{\s*\1\s+as\s+default\s*\};?\s*$/);

  if (aliasedMatch !== null && aliasedMatch[2] !== undefined) {
    return aliasedMatch[2];
  }

  throw new Error('Invalid compressed share token.');
}
