import { watch,
         FSWatcher }
  from 'node:fs';
import { Logger }
  from 'asljs-logging';
import { toPosixPath }
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
              error instanceof Error
                ? error.message
                : String(error)}`);
        }

        if (!closed) {
          options.onApplied?.(
            full
              ? [ ]
              : paths);
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
            typeof fileName === 'string'
              ? toPosixPath(fileName)
              : '';

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
        error instanceof Error
          ? error.message
          : String(error)}`);
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
