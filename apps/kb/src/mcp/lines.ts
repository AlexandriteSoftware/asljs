import { Readable }
  from 'node:stream';

/**
 * Call back once per complete line of a stream.
 *
 * A chunk can end mid-line, so the partial line is held until the rest of it
 * arrives. Both ends of the protocol read this way.
 */
export function readLines(
    input: Readable,
    onLine: (line: string) => void
  ): void
{
  let buffer = '';

  input.setEncoding('utf8');

  input.on(
    'data',
    (
        chunk: string
      ) =>
    {
      buffer += chunk;

      const lines =
        buffer.split('\n');

      buffer =
        lines.pop() ?? '';

      for (const line of lines) {
        onLine(line);
      }
    });
}
