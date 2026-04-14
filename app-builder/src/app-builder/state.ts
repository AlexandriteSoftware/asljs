import {
    observable,
  } from 'asljs-observable';
import {
    type AppRecord,
    type FileRecord,
  } from './types.js';

export type AppBuilderState =
  { apps: AppRecord[];
    currentAppId: string | null;
    files: FileRecord[];
    activeFileName: string | null;
    generating: boolean;
    error: string | null; };

export const state =
  observable<AppBuilderState>(
    { apps: [],
      currentAppId: null,
      files: [],
      activeFileName: null,
      generating: false,
      error: null });
