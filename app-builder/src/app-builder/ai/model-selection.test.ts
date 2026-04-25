import test
  from 'node:test';
import assert
  from 'node:assert/strict';
import {
  dedupeModels,
  selectPreferredChatModel,
  selectPreferredCodeModel,
  shouldUseCodeGenerationModel,
} from './model-selection.js';

test(
  'selectPreferredChatModel prefers cheaper faster general-purpose variants',
  () => {
    const model = selectPreferredChatModel([
      { id: 'gpt-5.4' },
      { id: 'gpt-5-mini' },
      { id: 'gpt-5-nano' },
      { id: 'gpt-5.3-codex' },
    ]);

    assert.equal(model, 'gpt-5-mini');
  });

test(
  'selectPreferredCodeModel prefers the latest codex model and falls back to latest general model',
  () => {
    assert.equal(
      selectPreferredCodeModel([
        { id: 'gpt-5.3-codex' },
        { id: 'gpt-5.4' },
        { id: 'gpt-5.4-codex' },
      ]),
      'gpt-5.4-codex');

    assert.equal(
      selectPreferredCodeModel([
        { id: 'gpt-5.3' },
        { id: 'gpt-5.4' },
        { id: 'gpt-5-mini' },
      ]),
      'gpt-5.4');
  });

test(
  'shouldUseCodeGenerationModel recognizes implementation requests and build approval replies',
  () => {
    assert.equal(
      shouldUseCodeGenerationModel('Fix the broken submit button.', []),
      true);

    assert.equal(
      shouldUseCodeGenerationModel(
        'yes',
        [
          { role: 'assistant', text: 'Shall I build these changes?' },
        ]),
      true);

    assert.equal(
      shouldUseCodeGenerationModel('Make the plan clearer.', []),
      false);

    assert.equal(
      shouldUseCodeGenerationModel('What should the score screen show?', []),
      false);
  });

test(
  'dedupeModels removes duplicate ids case-insensitively',
  () => {
    assert.deepEqual(
      dedupeModels([
        { id: 'gpt-5.4' },
        { id: 'GPT-5.4' },
        { id: 'gpt-5.4-codex' },
      ]),
      [
        { id: 'gpt-5.4', created: 0 },
        { id: 'gpt-5.4-codex', created: 0 },
      ]);
  });