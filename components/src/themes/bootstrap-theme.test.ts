import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
    createBootstrapTheme,
  } from './bootstrap-theme.js';
import {
    getComponentVariantList,
  } from './theme.js';

test(
  'bootstrap-theme: returns bootstrap button icon defaults and text input templates',
  () => {
    const theme =
      createBootstrapTheme();

    assert.equal(
      theme.button?.className,
      'btn btn-primary');
    assert.equal(
      theme.button?.variants?.add?.icon,
      '<i class="bi bi-plus"></i>');
    assert.equal(
      theme.button?.variants?.delete?.icon,
      '<i class="bi bi-trash"></i>');
    assert.equal(
      theme.button?.variants?.settings?.icon,
      '<i class="bi bi-gear"></i>');
    assert.equal(
      theme.button?.variants?.add?.text,
      'Add');
    assert.match(
      theme.textInput?.template as string,
      /form-label/);
    assert.match(
      theme.textInput?.template as string,
      /data-role="control-host"/);
    assert.match(
      theme.textInput?.template as string,
      /invalid-feedback/);
    assert.match(
      theme.textInput?.input as string,
      /form-control/);
    assert.match(
      theme.textInput?.textarea as string,
      /form-control/);
    assert.doesNotMatch(
      theme.textInput?.input as string,
      /invalid-feedback/);
    assert.doesNotMatch(
      theme.textInput?.textarea as string,
      /invalid-feedback/);
    assert.match(
      theme.select?.template as string,
      /invalid-feedback/);
    assert.doesNotMatch(
      theme.select?.select as string,
      /invalid-feedback/);
    assert.match(
      theme.list?.container as string,
      /list-group/);
    assert.deepEqual(
      getComponentVariantList(
        'button',
        theme),
      [ 'add',
        'delete',
        'settings' ]);
  });
