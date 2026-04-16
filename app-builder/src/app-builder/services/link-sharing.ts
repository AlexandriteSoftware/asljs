export type TextCompressionCodec =
  { compress: (text: string) => Promise<Uint8Array>;
    decompress: (bytes: Uint8Array) => Promise<string>; };

export type LinkSharingServiceOptions =
  { codec: TextCompressionCodec;
    baseUrl: string;
    hashPrefix: string;
    maxUrlLength: number;
    timeoutMs?: number; };

export type ShareLinkResult =
  { url: string;
    exceedsMaxUrlLength: boolean; };

export type LinkSharingService =
  { createShareUrl: (payload: unknown) => Promise<ShareLinkResult>;
    parsePayloadFromToken: <TPayload>(token: string) => Promise<TPayload>;
    readTokenFromHash: (hash: string) => string | null; };

const DEFAULT_TIMEOUT_MS =
  6000;

export function createLinkSharingService(
    options: LinkSharingServiceOptions
  ): LinkSharingService
{
  const timeoutMs =
    Number.isFinite(options.timeoutMs)
      ? Math.max(1, Math.floor(options.timeoutMs as number))
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

    const token =
      encodeURIComponent(bytesToBase64(compressed));

    const url =
      `${options.baseUrl}${options.hashPrefix}${token}`;

    return {
      url,
      exceedsMaxUrlLength: url.length > options.maxUrlLength,
    };
  }

  async function parsePayloadFromToken<TPayload>(
      token: string
    ): Promise<TPayload>
  {
    const base64 =
      decodeURIComponent(token);

    const compressed =
      base64ToBytes(base64);

    const decompressed =
      await withTimeout(
        options.codec.decompress(compressed),
        timeoutMs,
        'Link decompression timed out.');

    return JSON.parse(decompressed) as TPayload;
  }

  function readTokenFromHash(hash: string): string | null {
    if (!hash.startsWith(options.hashPrefix)) {
      return null;
    }

    return hash.slice(options.hashPrefix.length);
  }

  return {
    createShareUrl,
    parsePayloadFromToken,
    readTokenFromHash,
  };
}

export function createBrowserTextCompressionCodec(): TextCompressionCodec {
  return {
    compress: compressTextInBrowser,
    decompress: decompressTextInBrowser,
  };
}

async function compressTextInBrowser(text: string): Promise<Uint8Array> {
  const CompressionCtor =
    (window as { CompressionStream?: new (format: string) => {
      writable: WritableStream<Uint8Array>;
      readable: ReadableStream<Uint8Array>;
    } }).CompressionStream;

  if (CompressionCtor === undefined) {
    throw new Error(
      'Link sharing is not supported in this browser. Use Download export instead.');
  }

  const stream =
    new CompressionCtor('gzip');

  const writer =
    stream.writable.getWriter();

  await writer.write(new TextEncoder().encode(text));
  await writer.close();

  return new Uint8Array(
    await new Response(stream.readable).arrayBuffer());
}

async function decompressTextInBrowser(bytes: Uint8Array): Promise<string> {
  const DecompressionCtor =
    (window as { DecompressionStream?: new (format: string) => {
      writable: WritableStream<Uint8Array>;
      readable: ReadableStream<Uint8Array>;
    } }).DecompressionStream;

  if (DecompressionCtor === undefined) {
    throw new Error('Cannot import from shared link in this browser.');
  }

  const stream =
    new DecompressionCtor('gzip');

  const writer =
    stream.writable.getWriter();

  await writer.write(bytes);
  await writer.close();

  return new TextDecoder().decode(
    await new Response(stream.readable).arrayBuffer());
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

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
    new Promise<T>((_, reject) => {
      timeoutId = globalThis.setTimeout(
        () => reject(new Error(timeoutMessage)),
        timeoutMs);
    });

  try {
    return await Promise.race([ promise, timeoutPromise ]);
  } finally {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
  }
}
