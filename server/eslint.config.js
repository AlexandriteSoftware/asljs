import config from '../eslint.config.js';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...config,
  { languageOptions: { globals: { ...globals.node } } }
];