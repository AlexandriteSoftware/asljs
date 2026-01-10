import type {
    IncomingMessage
  } from 'node:http';

export function safePath(
    value: string
  ) : string
{
  if (typeof value !== 'string') {
    throw new TypeError(
      'Value must be a string');
  }

  if (value === '') {
    return '';
  }

  const incorrectCharacterMatch =
    /[^a-zA-Z0-9._/-]/.exec(value);

  if (incorrectCharacterMatch !== null) {
    throw new Error(
      `Incorrect characters in path at position ${incorrectCharacterMatch.index}.`);
  }

  if (value.startsWith('/')) {
    throw new Error(
      'Path must be relative.');
  }

  const segments =
    value.split('/');

  for (const segment of segments) {
    if (!segment
      || segment === '.'
      || segment === '..')
    {
      throw new Error(
        'Path must not contain empty, "." or ".." segments.');
    }
  }

  return value;
}

/**
 * Reads the body of the given request up to the given size limit.
 */
export function readBody(
    request: IncomingMessage,
    limit: number
  ): Promise<string>
{
  return new Promise<string>(
    (resolve, reject) => {
      let size = 0;

      const chunks: Buffer[] = [];

      request.on(
        'data',
        chunk => {
          const buffer = Buffer.isBuffer(chunk)
            ? chunk
            : Buffer.from(chunk);

          size += buffer.length;

          if (size > limit) {
            reject(
              new Error(
                'Payload is too large'));

            request.destroy();

            return;
          }

          chunks.push(buffer);
        });

      request.on(
        'end',
        () =>
          resolve(
            Buffer.concat(chunks)
              .toString('utf8')));

      request.on(
        'error',
        reject);
    });
}
