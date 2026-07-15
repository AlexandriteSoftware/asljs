export type TextCompressionCodec = {
  compress: (text: string) => Promise<string>;
  decompress: (value: string) => Promise<string>;
};

export type LinkSharingServiceOptions = {
  codec: TextCompressionCodec;
  baseUrl: string;
  hashPrefix: string;
  maxUrlLength: number;
  timeoutMs?: number;
};

export type ShareLinkResult = { url: string; exceedsMaxUrlLength: boolean; };

export type LinkSharingService = {
  createShareUrl: (payload: unknown) => Promise<ShareLinkResult>;
  parsePayloadFromToken: <TPayload>(token: string) => Promise<TPayload>;
  readTokenFromHash: (hash: string) => string | null;
};

const DEFAULT_TIMEOUT_MS = 6000;

export function createLinkSharingService(
  options: LinkSharingServiceOptions
): LinkSharingService
{
  const timeoutMs =
    Number.isFinite(
      options.timeoutMs
    )
    ? Math.max(
      1,
      Math.floor(
        options.timeoutMs as number
      )
    )
    : DEFAULT_TIMEOUT_MS;

  async function createShareUrl(
    payload: unknown
  ): Promise<ShareLinkResult>
  {
    const serialized =
      JSON.stringify(payload);

    const compressed =
      await withTimeout(
        options.codec.compress(serialized),
        timeoutMs,
        'Link compression timed out. Use Download export instead.');

    const url =
      `${options.baseUrl}${options.hashPrefix}${compressed}`;

    return {
      url,
      exceedsMaxUrlLength: url.length > options.maxUrlLength
    };
  }

  async function parsePayloadFromToken<TPayload>(
    token: string
  ): Promise<TPayload>
  {
    const decompressed =
      await withTimeout(
        options.codec.decompress(token),
        timeoutMs,
        'Link decompression timed out.');

    return JSON.parse(decompressed) as TPayload;
  }

  function readTokenFromHash(hash: string): string | null
  {
    if (
      !hash.startsWith(
        options.hashPrefix
      )
    ) {
      return null;
    }

    return hash.slice(
      options.hashPrefix.length
    );
  }

  return {
    createShareUrl,
    parsePayloadFromToken,
    readTokenFromHash
  };
}

export function createBrowserTextCompressionCodec(): TextCompressionCodec
{
  return {
    compress: compressTextInBrowser,
    decompress: decompressTextInBrowser
  };
}

async function compressTextInBrowser(text: string): Promise<string>
{
  const inputBytes =
    new TextEncoder().encode(text);

  const gzipBytes =
    await compressBytesInBrowser(
      inputBytes,
      'gzip');

  const output =
    encodeBase64Url(gzipBytes);

  return output;
}

async function decompressTextInBrowser(value: string): Promise<string>
{
  const compressedBytes =
    decodeBase64Url(value);

  const outputBytes =
    await decompressBytesInBrowser(
      compressedBytes,
      'gzip');

  return new TextDecoder().decode(outputBytes);
}

async function compressBytesInBrowser(
  input: Uint8Array,
  format: CompressionFormat
): Promise<Uint8Array>
{
  const stream =
    new Blob([toBlobPart(input)])
    .stream()
    .pipeThrough(
      new CompressionStream(format)
    );

  return readAllBytes(stream);
}

async function decompressBytesInBrowser(
  input: Uint8Array,
  format: CompressionFormat
): Promise<Uint8Array>
{
  const stream =
    new Blob([toBlobPart(input)])
    .stream()
    .pipeThrough(
      new DecompressionStream(format)
    );

  return readAllBytes(stream);
}

function toBlobPart(input: Uint8Array): BlobPart
{
  const copy =
    new Uint8Array(input.byteLength);

  copy.set(input);

  return copy;
}

async function readAllBytes(
  stream: ReadableStream<Uint8Array>
): Promise<Uint8Array>
{
  const reader =
    stream.getReader();

  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { value, done } =
      await reader.read();

    if (done) {
      break;
    }

    if (value === undefined) {
      continue;
    }

    chunks.push(value);
    totalLength += value.length;
  }

  const merged =
    new Uint8Array(totalLength);

  let offset = 0;

  for (const chunk of chunks) {
    merged.set(
      chunk,
      offset
    );

    offset += chunk.length;
  }

  return merged;
}

function encodeBase64Url(bytes: Uint8Array): string
{
  const segmentLength = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += segmentLength) {
    const segment =
      bytes.subarray(
        index,
        index + segmentLength);

    binary += String.fromCharCode(
      ...segment
    );
  }

  return btoa(binary)
    .replace(
      /\+/g,
      '-'
    )
    .replace(
      /\//g,
      '_'
    )
    .replace(
      /=+$/g,
      ''
    );
}

function decodeBase64Url(value: string): Uint8Array
{
  const normalized =
    value
    .replace(
      /-/g,
      '+'
    )
    .replace(
      /_/g,
      '/'
    );

  const padLength =
    normalized.length % 4;

  const padded =
    padLength === 0
    ? normalized
    : `${normalized}${
      '='.repeat(
        4 - padLength
      )
    }`;

  let binary = '';

  try {
    binary = atob(padded);
  } catch {
    throw new Error('Invalid compressed share token.');
  }

  const bytes =
    new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T>
{
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise =
    new Promise<T>((_, reject) =>
  {
    timeoutId = globalThis.setTimeout(
      () =>
      {
        reject(
          new Error(timeoutMessage)
        );
      },
      timeoutMs
    );
  });

  try {
    return await Promise.race(
      [promise, timeoutPromise]
    );
  } finally {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
  }
}
