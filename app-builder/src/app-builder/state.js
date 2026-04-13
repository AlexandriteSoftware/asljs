/**
 * Application state for ASLJS App Builder.
 *
 * Uses asljs-observable to make state reactive so the UI can
 * subscribe to changes and re-render automatically.
 */

import { observable } from 'asljs-observable';

/**
 * @typedef {import('./types.js').AppRecord} AppRecord
 * @typedef {import('./types.js').FileRecord} FileRecord
 */

/**
 * Central reactive state for the app builder.
 *
 * Subscribe to changes:
 *   state.on('apps', (newVal) => renderList(newVal));
 *   state.on('currentAppId', (id) => updateWorkspace(id));
 */
export const state = observable(
  { /** @type {AppRecord[]} */
    apps: [],

    /** @type {string | null} */
    currentAppId: null,

    /** @type {FileRecord[]} */
    files: [],

    /** @type {string | null} */
    activeFileName: null,

    /** Whether an AI generation is in progress */
    generating: false,

    /** Last error message (null = none) */
    error: null,
  });
