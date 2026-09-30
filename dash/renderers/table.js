import {
  clear,
  el,
  empty,
  field
} from './util.js';

/**
 * A JSON array as columns.
 * params: field, columns (["name"] or [{ field, label }]), limit
 */
export default (node, value, params = {}) =>
{
  const rows = field(value, params.field);
  if (!Array.isArray(rows) || rows.length === 0) {
    return empty(node, params.empty || 'nothing');
  }

  const columns = (params.columns || Object.keys(rows[0] || {})).map(column =>
    typeof column === 'string'
      ? { field: column, label: column }
      : column
  );
  const limit = Number.isFinite(params.limit)
    ? params.limit
    : rows.length;

  clear(node);
  const table = el('table');
  const head = el('tr');
  for (const column of columns) {
    head.append(el('th', null, column.label ?? column.field));
  }
  const thead = el('thead');
  thead.append(head);
  table.append(thead);

  const body = el('tbody');
  for (const row of rows.slice(0, limit)) {
    const tr = el('tr');
    for (const column of columns) {
      const cell = field(row, column.field);
      tr.append(el('td', null, cell ?? ''));
    }
    body.append(tr);
  }
  table.append(body);

  node.append(table);
};
