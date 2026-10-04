import {
  clear,
  el,
  empty
} from './util.js';

const count = (label, value) =>
{
  const row = el('li');
  row.append(el('span', 'row-label', label));
  row.append(el('span', 'row-meta', value));
  return row;
};

/** origin/main · ahead 1, behind 2 — or what is missing instead. */
const syncText = value =>
{
  if (!value.upstream) {
    return 'no upstream';
  }

  const parts = [];
  if (value.ahead > 0) {
    parts.push(`ahead ${value.ahead}`);
  }
  if (value.behind > 0) {
    parts.push(`behind ${value.behind}`);
  }
  if (parts.length === 0) {
    parts.push(
      value.pushed
        ? 'pushed'
        : 'in sync'
    );
  }

  return `${value.upstream} · ${parts.join(', ')}`;
};

const syncState = value =>
{
  if (!value.upstream || value.behind > 0) {
    return 'warn';
  }
  return value.ahead > 0
    ? 'warn'
    : 'ok';
};

/**
 * A git working folder: branch and commit, how it stands against its remote, and
 * what is uncommitted. Reads the value the `git` agent produces.
 * params: empty (the message shown when the key has no value)
 */
export default (node, value, params = {}) =>
{
  if (value === null || value === undefined || value === '') {
    return empty(node, params.empty || 'no status');
  }
  if (typeof value !== 'object') {
    return empty(node, String(value));
  }

  clear(node);

  const head = el('p', 'git-head');
  head.append(el('span', 'git-ref', value.branch || '(unknown)'));
  if (value.commit) {
    // The trailing + is git's own "dirty" marker, as in `git describe --dirty`.
    head.append(el(
      'span',
      'git-sha',
      value.dirty
        ? `${value.commit}+`
        : value.commit
    ));
  }
  node.append(head);

  node.append(el('p', `note status-${syncState(value)}`, syncText(value)));

  const rows = el('ul', 'rows');
  if (value.staged > 0) {
    rows.append(count('staged', value.staged));
  }
  if (value.changed > 0) {
    rows.append(count('not staged', value.changed));
  }
  if (value.untracked > 0) {
    rows.append(count('untracked', value.untracked));
  }
  if (value.conflicted > 0) {
    rows.append(count('conflicted', value.conflicted));
  }

  if (rows.childElementCount > 0) {
    node.append(rows);
  } else {
    node.append(el('p', 'note status-ok', 'clean'));
  }
};
