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
  { apiKey?: string; };

export type GeneratedFile =
  { name: string;
    content: string; };

export type GenerateAppResult =
  { description: string;
    files: GeneratedFile[]; };
