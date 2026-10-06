import globals
  from 'globals';
import baseConfig
  from '../../eslint.config.js';

// The library runs in the browser; only the data-bind-compile bin runs in Node.
export default [
  ...baseConfig,
  {
    files: ['bin/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
