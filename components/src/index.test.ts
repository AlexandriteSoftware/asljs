import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  AiChatModelDefinition,
  AllComponentModelDefinitions,
  AssistedInput,
  AssistedInputModelDefinition,
  AiChat,
  Button,
  ButtonModelDefinition,
  bindComponentPreviewModel,
  createComponentPreviewModel,
  createBootstrapTheme,
    createAiChatModel,
  FileView,
  FileViewModelDefinition,
  Keyboard,
  KeyboardModelDefinition,
  Letterpad,
  LetterpadModelDefinition,
    List,
  ListModelDefinition,
  Numpad,
  NumpadModelDefinition,
  Properties,
  PropertiesModelDefinition,
  Select,
  SelectModelDefinition,
  TextInput,
  TextInputModelDefinition,
    ThemeProvider,
  ThemeProviderModelDefinition,
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
      typeof Properties,
      'function');

    assert.equal(
      typeof createBootstrapTheme,
      'function');

    assert.equal(
      typeof createComponentPreviewModel,
      'function');

    assert.equal(
      typeof bindComponentPreviewModel,
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

    assert.equal(
      AiChatModelDefinition.properties.length > 0,
      true);

    assert.equal(
      AssistedInputModelDefinition.properties.length > 0,
      true);

    assert.equal(
      ButtonModelDefinition.properties.length > 0,
      true);

    assert.equal(
      FileViewModelDefinition.properties.length > 0,
      true);

    assert.equal(
      KeyboardModelDefinition.properties.length > 0,
      true);

    assert.equal(
      LetterpadModelDefinition.properties.length > 0,
      true);

    assert.equal(
      ListModelDefinition.properties.length > 0,
      true);

    assert.equal(
      NumpadModelDefinition.properties.length > 0,
      true);

    assert.equal(
      PropertiesModelDefinition.properties.length > 0,
      true);

    assert.equal(
      SelectModelDefinition.properties.length > 0,
      true);

    assert.equal(
      TextInputModelDefinition.properties.length > 0,
      true);

    assert.equal(
      ThemeProviderModelDefinition.properties.length > 0,
      true);

    assert.equal(
      AllComponentModelDefinitions.length >= 12,
      true);
  });
