import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    createBootstrapTheme,
  } from './bootstrap-theme.js';

test(
  'bootstrap-theme: returns bootstrap button icon defaults',
  () => {
    const theme =
      createBootstrapTheme();

    assert.deepEqual(
      theme,
      { button:
          { addIcon: '<i class="bi bi-plus"></i>',
            deleteIcon: '<i class="bi bi-trash"></i>' } });
  });