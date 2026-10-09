// A browser document for the tests of the page's modules, which run in Node.
// The renderers reach `document` as a global, as they do in the page.

import {
  TmpGlobals
} from 'asljs-testing';
import {
  JSDOM
} from 'jsdom';

/**
 * Defines `document` on `globalThis` until the returned object is disposed, and
 * gives a fresh card body to render into.
 *
 *     using dom = useDom();
 *     render(dom.body(), value, params);
 */
export const useDom = () =>
{
  const window = new JSDOM('<!doctype html><html><body></body></html>').window;
  const globals = new TmpGlobals({ document: window.document });

  return {
    document: window.document,
    body: () =>
    {
      const node = window.document.createElement('div');
      window.document.body.append(node);
      return node;
    },
    [Symbol.dispose]: () =>
    {
      globals.restore();
      window.close();
    }
  };
};
