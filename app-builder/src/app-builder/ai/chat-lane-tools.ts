import {
  type AiTools,
} from './ai-tools.js';

type ChatLaneOptions =
  { planFileName: string;
    startGeneration: () => Promise<string>; };

export function createChatLaneTools(
    baseTools: AiTools,
    options: ChatLaneOptions,
  ): AiTools
{
  const normalizedPlanFileName =
    normalizePath(options.planFileName);

  function assertPlanOnly(path: string): void {
    if (normalizePath(path) !== normalizedPlanFileName) {
      throw new Error(
        'The chat lane may only edit PLAN.md. Ask the generation lane to implement runtime files.',
      );
    }
  }

  return {
    ...baseTools,
    setFilesContent: async files => {
      for (const file of files) {
        assertPlanOnly(file.path);
      }

      await baseTools.setFilesContent(files);
    },
    setFileData: async () => {
      throw new Error('The chat lane cannot create binary assets. Use a direct file command or the generation lane.');
    },
    setFileContent: async (path, content) => {
      assertPlanOnly(path);
      await baseTools.setFileContent(path, content);
    },
    deleteFile: async path => {
      assertPlanOnly(path);
      await baseTools.deleteFile(path);
    },
    replaceFilePart: async (path, search, replacement, replaceAll) => {
      assertPlanOnly(path);
      await baseTools.replaceFilePart(path, search, replacement, replaceAll);
    },
    evalInApp: async () => {
      throw new Error('The chat lane cannot run the app. Start generation first.');
    },
    assertInApp: async () => {
      throw new Error('The chat lane cannot assert runtime behavior. Start generation first.');
    },
    runAppTests: async () => {
      throw new Error('The chat lane cannot run app tests. Start generation first.');
    },
    getAppDiagnostics: async () => {
      throw new Error('The chat lane cannot inspect runtime diagnostics. Start generation first.');
    },
    runAppAndCollectDiagnostics: async () => {
      throw new Error('The chat lane cannot run the app. Start generation first.');
    },
    startGeneration: options.startGeneration,
  };
}

function normalizePath(path: string): string {
  return path.trim().replace(/\\/g, '/').toLowerCase();
}
