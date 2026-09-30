// Card placement on a virtual screen. See docs/concept.md, "Layout".
//
// The virtual screen is an array of rows; each row is an array of cells, '@' where occupied.
// Rows are created on demand, so the grid is as tall as the cards need.

export const DEFAULT_SIZE = 6;

const OCCUPIED = '@';

const rowFor = (screen, y, cols) =>
{
  while (screen.length <= y) {
    screen.push(new Array(cols).fill(null));
  }
  return screen[y];
};

/** True when every cell of the width x height rectangle at (x, y) is free. */
const fits = (screen, x, y, width, height, cols) =>
{
  if (x < 0 || y < 0 || x + width > cols) {
    return false;
  }

  for (let row = y; row < y + height; row += 1) {
    const cells = rowFor(screen, row, cols);
    for (let col = x; col < x + width; col += 1) {
      if (cells[col] === OCCUPIED) {
        return false;
      }
    }
  }

  return true;
};

const occupy = (screen, x, y, width, height, cols) =>
{
  for (let row = y; row < y + height; row += 1) {
    const cells = rowFor(screen, row, cols);
    for (let col = x; col < x + width; col += 1) {
      cells[col] = OCCUPIED;
    }
  }
};

/**
 * Scan for the first free rectangle, horizontally line by line.
 * `fixedX` pins the column; `fromY` is where the scan starts.
 */
const scan = (screen, { width, height, cols, fixedX = null, fromY = 0 }) =>
{
  const lastX = cols - width;

  for (let y = fromY; y < fromY + screen.length + height + 1; y += 1) {
    if (fixedX !== null) {
      if (fits(screen, fixedX, y, width, height, cols)) {
        return { left: fixedX, top: y };
      }
      continue;
    }

    for (let x = 0; x <= lastX; x += 1) {
      if (fits(screen, x, y, width, height, cols)) {
        return { left: x, top: y };
      }
    }
  }

  // Unreachable in practice: the scan always runs past the tail of the screen.
  return { left: 0, top: screen.length };
};

const isNumber = value => typeof value === 'number' && Number.isFinite(value);

/**
 * Place cards and return a new array of { card, left, top, width, height }.
 *
 * Pass 1 places anchored cards (both top and left) exactly as written.
 * Pass 2 flows the rest in list order, each into the first gap that fits.
 */
export const layout = (cards, cols) =>
{
  const columns = Math.max(1, Math.floor(cols) || 1);
  const screen = [];

  const prepared = cards.map(card =>
  {
    const width = Math.min(
      Math.max(
        1,
        isNumber(card.width)
          ? card.width
          : DEFAULT_SIZE
      ),
      columns
    );
    const height = Math.max(
      1,
      isNumber(card.height)
        ? card.height
        : DEFAULT_SIZE
    );
    const left = isNumber(card.left)
      ? Math.max(0, card.left)
      : null;
    const top = isNumber(card.top)
      ? Math.max(0, card.top)
      : null;
    return {
      card,
      width,
      height,
      left,
      top,
      anchored: left !== null && top !== null
    };
  });

  const placements = new Map();

  for (const item of prepared) {
    if (!item.anchored) {
      continue;
    }
    const left = Math.min(item.left, columns - item.width);
    occupy(screen, left, item.top, item.width, item.height, columns);
    placements.set(item, { left, top: item.top });
  }

  for (const item of prepared) {
    if (item.anchored) {
      continue;
    }

    const spot = scan(screen, {
      width: item.width,
      height: item.height,
      cols: columns,
      fixedX: item.left === null
        ? null
        : Math.min(item.left, columns - item.width),
      fromY: item.top ?? 0
    });

    occupy(screen, spot.left, spot.top, item.width, item.height, columns);
    placements.set(item, spot);
  }

  return prepared.map(item => ({
    card: item.card,
    left: placements.get(item).left,
    top: placements.get(item).top,
    width: item.width,
    height: item.height
  }));
};

/** Rows used by a set of placements — the height the grid needs. */
export const layoutRows = placed =>
  placed.reduce((max, item) => Math.max(max, item.top + item.height), 0);
