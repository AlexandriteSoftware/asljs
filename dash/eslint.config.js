import globals from 'globals';
import config from '../eslint.config.js';

// Split by runtime: the server, the runner and the store are Node; the page,
// the layout and the renderers are served to the browser as-is.
export default [
  ...config,
  {
    files: ['server.js', 'runner.js', 'store.js', 'samples.js'],
    languageOptions: { globals: globals.node }
  },
  {
    files: ['dash.js', 'layout.js', 'renderers/*.js'],
    languageOptions: { globals: globals.browser }
  }
];
