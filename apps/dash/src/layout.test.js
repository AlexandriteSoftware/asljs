import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_SIZE,
  layout,
  layoutRows
} from './layout.js';

const boxes = placed =>
  placed.map(({ left, top, width, height }) => [left, top, width, height]);

test('layout gives a card without geometry the default size and flows cards in list order', () =>
{
  assert.equal(DEFAULT_SIZE, 6);

  assert.deepEqual(boxes(layout([{}, {}, {}], 12)), [
    [0, 0, 6, 6],
    [6, 0, 6, 6],
    [0, 6, 6, 6]
  ]);
});

test('layout places anchored cards first and flows the others around them', () =>
{
  const placed = layout([
    { width: 4, height: 2 },
    { left: 0, top: 0, width: 4, height: 2 },
    { width: 4, height: 2 }
  ], 8);

  assert.deepEqual(boxes(placed), [
    [4, 0, 4, 2],
    [0, 0, 4, 2],
    [0, 2, 4, 2]
  ]);
});

test('layout keeps the cards in the order given, with the card each placement is for', () =>
{
  const cards = [{ key: 'a' }, { key: 'b', left: 6, top: 0 }];

  assert.deepEqual(layout(cards, 12).map(item => item.card), cards);
});

test('layout pins the column of a card with left only, and starts the scan at the row of a card with top only', () =>
{
  const placed = layout([
    { left: 0, top: 0, width: 4, height: 4 },
    { left: 0, width: 4, height: 2 },
    { top: 1, width: 4, height: 2 }
  ], 12);

  assert.deepEqual(boxes(placed), [
    [0, 0, 4, 4],
    [0, 4, 4, 2],
    [4, 1, 4, 2]
  ]);
});

test('layout clamps a card wider than the screen, and an anchored card that would overflow', () =>
{
  assert.deepEqual(boxes(layout([{ width: 20, height: 1 }], 8)), [
    [0, 0, 8, 1]
  ]);
  assert.deepEqual(
    boxes(layout([{ left: 10, top: 2, width: 4, height: 1 }], 8)),
    [[4, 2, 4, 1]]
  );
  assert.deepEqual(boxes(layout([{}], 0)), [[0, 0, 1, 6]]);
});

test('layoutRows is the number of rows the placed cards use', () =>
{
  assert.equal(layoutRows([]), 0);
  assert.equal(
    layoutRows(layout([{ height: 2 }, { left: 0, top: 5, height: 3 }], 12)),
    8
  );
});
