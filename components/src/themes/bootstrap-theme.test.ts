import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    createBootstrapTheme,
  } from './bootstrap-theme.js';

test(
  'bootstrap-theme: returns bootstrap button icon defaults and text input template',
  () => {
    const theme =
      createBootstrapTheme();

    assert.equal(
      theme.button?.className,
      'btn btn-primary');
    assert.equal(
      theme.button?.addIcon,
      '<i class="bi bi-plus"></i>');
    assert.equal(
      theme.button?.deleteIcon,
      '<i class="bi bi-trash"></i>');
    assert.match(
      theme.textInput?.template as string,
      /form-control/);
    assert.match(
      theme.textInput?.template as string,
      /form-label/);
    assert.match(
      theme.list?.container as string,
      /list-group/);
  });