import globals from 'globals';
import config from '../../eslint.config.js';

// Split by runtime: the server, the runner and the store are Node; the page,
// the layout and the renderers are served to the browser as-is.
export default [
  ...config,
  {
    files: [
      'src/cron.js',
      'src/server.js',
      'src/runner.js',
      'src/store.js',
      'src/samples.js',
      'src/config.js'
    ],
    languageOptions: { globals: globals.node }
  },
  {
    files: ['src/dash.js', 'src/layout.js', 'src/renderers/*.js'],
    languageOptions: { globals: globals.browser }
  },
  // The tests run in Node, the page's included, against a jsdom document.
  {
    files: ['src/**/*.test.js', 'src/testing/*.js', 'agents/*.test.js'],
    languageOptions: { globals: globals.node }
  }
];
