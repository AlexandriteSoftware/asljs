import { observable }
  from 'asljs-observable';
import { AppRecord,
         ChatMessage,
         FileRecord }
  from './types.js';

export type AppBuilderState =
  { apps: AppRecord[];
    currentAppId: string | null;
    files: FileRecord[];
    activeFileName: string | null;
    chatMessages: ChatMessage[];
    generating: boolean;
    generationBusy: boolean;
    generationStatus: string;
    error: string | null; };

export const state =
  observable<AppBuilderState>(
    { apps: [],
      currentAppId: null,
      files: [],
      activeFileName: null,
      chatMessages: [],
      generating: false,
      generationBusy: false,
      generationStatus: '',
      error: null });
