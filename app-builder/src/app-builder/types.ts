export type AppRecord =
  { id: string;
    name: string;
    createdAt: string;
    updatedAt: string; };

export type FileRecord =
  { id: string;
    appId: string;
    name: string;
    content: string; };

export type Settings =
  {
    apiKey?: string;
    model?: 'gpt-5.3-codex' | 'gpt-5.4';
    maxToolSteps?: number;
  };

export type GeneratedFile =
  { name: string;
    content: string; };
