export type AppAuthor =
  { name?: string;
    email?: string; };

export type AppRecord =
  { id: string;
    uuid: string;
    name: string;
    author?: AppAuthor;
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
    chatModel?: string;
    generationModel?: string;
    maxToolSteps?: number;
    theme?: 'dark' | 'light';
    fontSize?: number;
  };

export type GeneratedFile =
  { name: string;
    content: string; };

export type ChatMessageRole =
  'user' | 'assistant';

export type ChatMessage =
  { role: ChatMessageRole;
    text: string; };
