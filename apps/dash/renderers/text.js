import {
  clear,
  el,
  empty,
  field
} from './util.js';

/**
 * Preformatted text, scrollable. For command output.
 * params: field, wrap, tail (keep only the last N lines)
 */
export default (node, value, params = {}) =>
{
  const raw = field(value, params.field);
  if (raw === undefined || raw === null || raw === '') {
    return empty(node);
  }

  let text = typeof raw === 'string'
    ? raw
    : JSON.stringify(raw, null, 2);
  if (Number.isFinite(params.tail)) {
    text = text.split('\n').slice(-params.tail).join('\n');
  }

  clear(node);
  const pre = el('pre', 'mono', text.replace(/\s+$/, ''));
  pre.style.whiteSpace = params.wrap
    ? 'pre-wrap'
    : 'pre';
  node.append(pre);
};
