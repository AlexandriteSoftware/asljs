import DOMPurify,
       { type DOMPurify as Purifier,
         type WindowLike }
  from 'dompurify';

// A purifier parses with the window it was created for, so there is one per
// window: the page's in a browser, a JSDOM window in tests.
const purifiers =
  new WeakMap<object, Purifier>();

/**
 * Sanitizes `markup` with DOMPurify in the current window (`globalThis.window`):
 * scripts, event-handler attributes, `javascript:` URLs and other active
 * content are removed, and the remaining markup is returned as a string.
 *
 * Throws when there is no window, or when DOMPurify cannot sanitize in it,
 * rather than returning the markup unchanged: an unsupported DOMPurify
 * instance returns its input as it is.
 */
export function sanitizeHtml(
    markup: string
  ): string
{
  return purifierFor(
    currentWindow())
    .sanitize(markup);
}

function currentWindow(
  ): WindowLike
{
  const window =
    (globalThis as { window?: WindowLike; }).window;

  if (window === undefined) {
    throw new Error(
      'safeHtml needs a DOM window to sanitize HTML');
  }

  return window;
}

function purifierFor(
    window: WindowLike
  ): Purifier
{
  const cached =
    purifiers.get(window);

  if (cached !== undefined) {
    return cached;
  }

  const purifier =
    DOMPurify(window);

  if (!purifier.isSupported) {
    throw new Error(
      'safeHtml cannot sanitize HTML: DOMPurify does not support this window');
  }

  purifiers.set(
    window,
    purifier);

  return purifier;
}
