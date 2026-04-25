import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    List,
    ThemeProvider,
    getDefaultTheme,
    setDefaultTheme,
  } from './index.js';

test(
  'index: exports component package root API',
  () => {
    assert.equal(
      typeof List,
      'function');

    assert.equal(
      typeof ThemeProvider,
      'function');

    assert.equal(
      typeof getDefaultTheme,
      'function');

    assert.equal(
      typeof setDefaultTheme,
      'function');
  });
