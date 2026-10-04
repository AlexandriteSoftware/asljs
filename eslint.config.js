import { eslintConfig }
  from 'asljs-sfmt';
import globals
  from 'globals';

export default [
  ...eslintConfig,
  // The artefact rule files run under node. Packages extending this
  // configuration declare their own globals, and this pattern matches nothing
  // inside them.
  {
    files: ['aftefacts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
