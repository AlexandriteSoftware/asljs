import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  AssistedInput,
  AiChat,
  Button,
  createBootstrapTheme,
    createAiChatModel,
  FileView,
  Keyboard,
  Letterpad,
    List,
  Numpad,
  Select,
  TextInput,
    ThemeProvider,
  createImageFileHandler,
  createPdfFileHandler,
  createTextEditorFileHandler,
  createTextFileHandler,
    getDefaultTheme,
    setDefaultTheme,
  } from './index.js';

test(
  'index: exports component package root API',
  () => {
    assert.equal(
      typeof Button,
      'function');

    assert.equal(
      typeof createBootstrapTheme,
      'function');

    assert.equal(
      typeof AssistedInput,
      'function');

    assert.equal(
      typeof Numpad,
      'function');

    assert.equal(
      typeof Keyboard,
      'function');

    assert.equal(
      typeof Letterpad,
      'function');

    assert.equal(
      typeof List,
      'function');

    assert.equal(
      typeof TextInput,
      'function');

    assert.equal(
      typeof Select,
      'function');

    assert.equal(
      typeof AiChat,
      'function');

    assert.equal(
      typeof createAiChatModel,
      'function');

    assert.equal(
      typeof FileView,
      'function');

    assert.equal(
      typeof createPdfFileHandler,
      'function');

    assert.equal(
      typeof createImageFileHandler,
      'function');

    assert.equal(
      typeof createTextFileHandler,
      'function');

    assert.equal(
      typeof createTextEditorFileHandler,
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
