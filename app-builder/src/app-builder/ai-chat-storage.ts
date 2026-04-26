import {
    type AiChatSecretsAndSettingsProvider,
    type AiChatSerializableState,
    type AiChatStateStore,
  } from 'asljs-components';
import {
    loadAppOpenAiApiKey,
  } from './storage.js';

const chatStateStorageKeyPrefix =
  'asljs-app-builder:chat-state:';

export function createAppBuilderAiChatSecretsAndSettingsProvider(
    options:
      { appId: string;
        readChatModel: () => string;
        readInitialToolStepLimit: () => number; }
  ): AiChatSecretsAndSettingsProvider
{
  return {
    getOpenAiApiKey: async () =>
      loadAppOpenAiApiKey(options.appId),
    getChatModel: async () =>
      options.readChatModel(),
    getInitialToolStepLimit: async () =>
      options.readInitialToolStepLimit(),
  };
}

export function createSessionStorageAiChatStateStore(
    appId: string
  ): AiChatStateStore
{
  const storageKey =
    `${chatStateStorageKeyPrefix}${appId}`;

  return {
    load: async (): Promise<Partial<AiChatSerializableState>> => {
      try {
        const raw =
          sessionStorage.getItem(storageKey);

        if (raw === null || raw.trim() === '') {
          return { };
        }

        return JSON.parse(raw) as Partial<AiChatSerializableState>;
      } catch {
        return { };
      }
    },
    save: async (
        state: AiChatSerializableState
      ): Promise<void> => {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify(state));
    },
  };
}
