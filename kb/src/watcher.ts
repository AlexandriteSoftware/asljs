import { watch,
         FSWatcher }
  from 'node:fs';
import { Logger }
  from 'asljs-logging';
import { messageOf,
         toPosixPath }
  from './formatting.js';
import { LinkGraph }
  from './graph.js';
import { isMarkdown }
  from './notes.js';

export interface WatchOptions
{
  /**
   * Milliseconds to wait for the change burst to settle before applying it.
   * Defaults to 100.
   */
  debounceMs?: number;

  logger?: Logger;

  /**
   * Called after a batch of changes has been applied. Provided for tests,
   * which cannot otherwise know when the graph has caught up.
   */
  onApplied?: (paths: string[]) => void;
}

export interface LibraryWatcher
{
  close: () => void;
}

const DEFAULT_DEBOUNCE_MS = 100;

/**
 * A rebuild covers everything, so it names no single path.
 */
function report(
    options: WatchOptions,
    rebuilt: boolean,
    paths: string[]
  ): void
{
  if (rebuilt) {
    options.onApplied?.([ ]);

    return;
  }

  options.onApplied?.(paths);
}

/**
 * Not every platform reports which file changed.
 */
function changedPath(
    fileName: string | Buffer | null
  ): string
{
  if (
    typeof fileName
    !== 'string'
  ) {
    return '';
  }

  return toPosixPath(fileName);
}

/**
 * Keep a link graph current by watching the library for changes.
 *
 * Changes are debounced, so that a burst collapses into one update. A change
 * naming a markdown file re-indexes that file; anything else, such as a
 * renamed folder or a platform that reports no file name, triggers a rebuild.
 *
 * Recursive watching is not available on every platform. When it cannot be
 * started, the error is logged and the graph simply stops following changes
 * rather than failing the caller.
 */
export function watchLibrary(
    root: string,
    graph: LinkGraph,
    options: WatchOptions = {}
  ): LibraryWatcher
{
  const debounceMs =
    options.debounceMs ?? DEFAULT_DEBOUNCE_MS;

  let watcher: FSWatcher | null = null;

  let timer: NodeJS.Timeout | null = null;

  let pending = new Set<string>();

  let rebuild = false;

  let closed = false;

  const apply =
    (): void =>
    {
      const paths =
        [ ...pending ];

      const full = rebuild;

      pending = new Set<string>();
      rebuild = false;
      timer = null;

      void (async (): Promise<void> =>
      {
        try {
          if (full) {
            await graph.rebuild();
          } else {
            for (const path of paths) {
              await graph.update(path);
            }
          }
        } catch (error) {
          options.logger?.warning(
            `Failed to apply library changes: ${
              messageOf(error)}`);
        }

        if (!closed) {
          report(
            options,
            full,
            paths);
        }
      })();
    };

  const schedule =
    (): void =>
    {
      if (timer) {
        clearTimeout(timer);
      }

      timer =
        setTimeout(
          apply,
          debounceMs);

      timer.unref?.();
    };

  try {
    watcher =
      watch(
        root,
        { recursive: true },
        (
            _,
            fileName
          ) =>
        {
          if (closed) {
            return;
          }

          const changed =
            changedPath(fileName);

          if (
            changed === ''
            || !isMarkdown(changed)
          ) {
            rebuild = true;
          } else {
            pending.add(changed);
          }

          schedule();
        });
  } catch (error) {
    options.logger?.warning(
      `Cannot watch the library for changes: ${
        messageOf(error)}`);
  }

  return { close:
             (): void =>
             {
      closed = true;

      if (timer) {
        clearTimeout(timer);

        timer = null;
      }

      watcher?.close();
    } };
}
