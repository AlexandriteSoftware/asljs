import {
    test
  } from 'node:test';
import assert
  from 'node:assert/strict';
import {
    formatDate
  } from './date-formatting.js';

const CONTEXT_NAME =
  'date-formatting-test';

const date =
  new Date(2026, 0, 5, 8, 9, 4);

test(
  `${CONTEXT_NAME}: formats yyyy`,
  () => {
    assert.equal(
      formatDate(date, 'yyyy'),
      '2026');
  });

test(
  `${CONTEXT_NAME}: formats yy MM dd`,
  () => {
    assert.equal(formatDate(date, 'yy'), '26');
    assert.equal(formatDate(date, 'MM'), '01');
    assert.equal(formatDate(date, 'dd'), '05');
  });

test(
  `${CONTEXT_NAME}: formats hh mm ss`,
  () => {
    assert.equal(formatDate(date, 'hh'), '08');
    assert.equal(formatDate(date, 'mm'), '09');
    assert.equal(formatDate(date, 'ss'), '04');
  });

test(
  `${CONTEXT_NAME}: formats mixed tokens`,
  () => {
    assert.equal(
      formatDate(date, 'yyyy-MM-dd hh:mm:ss'),
      '2026-01-05 08:09:04');

    assert.equal(
      formatDate(date, 'yy/MM/dd'),
      '26/01/05');
  });

test(
  `${CONTEXT_NAME}: escapes literals with backslash`,
  () => {
    assert.equal(formatDate(date, 'yyyy\\y'), '2026y');
    assert.equal(formatDate(date, 'dd\\d'), '05d');
  });

test(
  `${CONTEXT_NAME}: handles unknown tokens as literals`,
  () => {
    assert.equal(
      formatDate(date, 'yyyy-XX'),
      '2026-XX');
  });

test(
  `${CONTEXT_NAME}: returns Date.toString when format is null`,
  () => {
    assert.equal(
      formatDate(date, null),
      date.toString());
  });
