import LZString
  from 'lz-string';

export type TextCompressionCodec =
  { compress: (text: string) => Promise<string>;
    decompress: (value: string) => Promise<string>; };

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

    const url =
      `${options.baseUrl}${options.hashPrefix}${compressed}`;

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
    const decompressed =
      await withTimeout(
        options.codec.decompress(token),
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

async function compressTextInBrowser(text: string): Promise<string> {
  const startedAt = performance.now();
  console.info('[share-service] browser-compress-start', {
    textLength: text.length,
  });

  const output =
    LZString.compressToEncodedURIComponent(text);

  console.info('[share-service] browser-compress-done', {
    elapsedMs: Math.round(performance.now() - startedAt),
    outputLength: output.length,
  });

  return output;
}

async function decompressTextInBrowser(value: string): Promise<string> {
  const decompressed =
    LZString.decompressFromEncodedURIComponent(value);

  if (decompressed === null) {
    throw new Error('Invalid compressed share token.');
  }

  return decompressed;
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
