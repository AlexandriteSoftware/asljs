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
    const startedAt = performance.now();
    console.info('[share-service] create-url-start');

    const serialized =
      JSON.stringify(payload);

    console.info('[share-service] create-url-serialized', {
      serializedLength: serialized.length,
    });

    const compressed =
      await withTimeout(
        options.codec.compress(serialized),
        timeoutMs,
        'Link compression timed out. Use Download export instead.');

    console.info('[share-service] create-url-compressed', {
      compressedLength: compressed.length,
    });

    const token =
      encodeURIComponent(bytesToBase64(compressed));

    const url =
      `${options.baseUrl}${options.hashPrefix}${token}`;

    console.info('[share-service] create-url-done', {
      elapsedMs: Math.round(performance.now() - startedAt),
      urlLength: url.length,
    });

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
  const startedAt = performance.now();
  console.info('[share-service] browser-compress-start', {
    textLength: text.length,
  });

  const CompressionCtor =
    (window as { CompressionStream?: new (format: string) => {
      writable: WritableStream<Uint8Array>;
      readable: ReadableStream<Uint8Array>;
    } }).CompressionStream;

  if (CompressionCtor === undefined) {
    throw new Error(
      'Link sharing is not supported in this browser. Use Download export instead.');
  }

  // Pipe source bytes through CompressionStream to avoid writable deadlocks
  // observed on some browsers with manual writer.write()/close().
  const compressedStream =
    new Blob([ text ])
      .stream()
      .pipeThrough(new CompressionCtor('gzip'));

  console.info('[share-service] browser-compress-pipe-start');
  const output = new Uint8Array(
    await new Response(compressedStream).arrayBuffer());
  console.info('[share-service] browser-compress-pipe-done');

  console.info('[share-service] browser-compress-done', {
    elapsedMs: Math.round(performance.now() - startedAt),
    outputLength: output.length,
  });

  return output;
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

  const arrayBuffer =
    bytes.buffer instanceof ArrayBuffer
      ? bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      )
      : new Uint8Array(bytes).buffer;

  const decompressedStream =
    new Blob([ arrayBuffer ])
      .stream()
      .pipeThrough(new DecompressionCtor('gzip'));

  return await new Response(decompressedStream).text();
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
  const startedAt = performance.now();

  const timeoutPromise =
    new Promise<T>((_, reject) => {
      timeoutId = globalThis.setTimeout(
        () => {
          console.warn('[share-service] timeout', {
            timeoutMs,
            elapsedMs: Math.round(performance.now() - startedAt),
            timeoutMessage,
          });
          reject(new Error(timeoutMessage));
        },
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
