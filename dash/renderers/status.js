import {
  clear,
  el,
  field
} from './util.js';

/** ok | warn | error, from a `status` field or a bare string. */
export const statusOf = value =>
{
  const raw = typeof value === 'string'
    ? value
    : field(value, 'status');
  const text = String(raw ?? '').trim().toLowerCase();

  if (
    ['error', 'fail', 'failed', 'down', 'critical', 'offline'].includes(text)
  ) {
    return 'error';
  }
  if (['warn', 'warning', 'degraded', 'stale', 'late'].includes(text)) {
    return 'warn';
  }
  if (['ok', 'up', 'online', 'pass', 'healthy', 'good'].includes(text)) {
    return 'ok';
  }
  return null;
};

/**
 * Status word plus message, coloured by state.
 * params: labels (map of state -> display word)
 */
export default (node, value, params = {}) =>
{
  const state = statusOf(value) ?? 'unknown';
  const labels = params.labels || {};
  const word = labels[state]
    || (typeof value === 'string'
      ? value
      : field(value, 'status'))
    || state;
  const message = field(value, 'message');

  clear(node);
  node.append(el('p', `status status-${state}`, word));
  if (message) {
    node.append(el('p', 'note', message));
  }
};
