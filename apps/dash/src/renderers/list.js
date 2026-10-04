import {
  clear,
  el,
  empty,
  field
} from './util.js';

/**
 * Rows from a JSON array.
 * params: field, fields (label field + trailing fields), limit, empty
 */
export default (node, value, params = {}) =>
{
  const rows = field(value, params.field);
  if (!Array.isArray(rows) || rows.length === 0) {
    return empty(node, params.empty || 'nothing');
  }

  const [labelField = 'label', ...rest] = params.fields || ['label'];
  const limit = Number.isFinite(params.limit)
    ? params.limit
    : rows.length;

  clear(node);
  const list = el('ul', 'rows');

  for (const row of rows.slice(0, limit)) {
    const item = el('li');
    const label = typeof row === 'object' && row !== null
      ? field(row, labelField)
      : row;
    item.append(el('span', 'row-label', label ?? ''));

    for (const name of rest) {
      const cell = field(row, name);
      if (cell !== undefined && cell !== null && cell !== '') {
        item.append(el('span', 'row-meta', cell));
      }
    }

    list.append(item);
  }

  node.append(list);

  if (rows.length > limit) {
    node.append(el('p', 'note', `+${rows.length - limit} more`));
  }
};
