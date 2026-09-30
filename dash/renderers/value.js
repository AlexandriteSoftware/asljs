import {
  asNumber,
  clear,
  el,
  empty,
  field,
  formatNumber
} from './util.js';

/**
 * One big number or word.
 * params: field, unit, precision, prefix
 */
export default (node, value, params = {}) =>
{
  const raw = field(value, params.field);
  if (raw === undefined || raw === null || raw === '') {
    return empty(node);
  }

  const number = asNumber(raw);
  const text = number === null
    ? String(raw)
    : formatNumber(number, params.precision);

  clear(node);
  const line = el('p', 'hero');
  if (params.prefix) {
    line.append(el('span', 'affix', params.prefix));
  }
  line.append(el('span', 'hero-number', text));
  if (params.unit) {
    line.append(el('span', 'affix', params.unit));
  }
  node.append(line);
};
