// Shared helpers for renderers. Renderers must escape anything they did not create;
// building nodes with `el()` and textContent does that by construction.

export const el = (tag, className, text) =>
{
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined && text !== null) {
    node.textContent = String(text);
  }
  return node;
};

export const clear = node =>
{
  node.replaceChildren();
};

/** Pull a field out of a value that may be a scalar, an object, or nested. */
export const field = (value, name) =>
{
  if (name === undefined || name === null || name === '') {
    return value;
  }
  return String(name).split('.').reduce(
    (current, part) => (current === undefined || current === null
      ? undefined
      : current[part]),
    value
  );
};

export const asNumber = value =>
{
  const number = typeof value === 'number'
    ? value
    : Number.parseFloat(value);
  return Number.isFinite(number)
    ? number
    : null;
};

export const formatNumber = (number, precision) =>
{
  if (Number.isFinite(precision)) {
    return number.toFixed(precision);
  }
  return Number.isInteger(number)
    ? String(number)
    : String(Math.round(number * 100) / 100);
};

export const formatTime = ts =>
  new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const empty = (node, message = 'no data') =>
{
  clear(node);
  node.append(el('p', 'empty', message));
};
