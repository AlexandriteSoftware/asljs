export type OpenAiToolDefinition = {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string }>;
    required: string[];
    additionalProperties: false;
  };
  strict: true;
};

export const OPENAI_TOOLS: OpenAiToolDefinition[] = [
  {
    type: 'function',
    name: 'listFileset',
    description: 'List all file paths in the virtual filesystem.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'readFile',
    description: 'Read the full text content of a file.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' },
      },
      required: ['path'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'setFileContent',
    description: 'Create or fully replace file content.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['path', 'content'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'replaceFilePart',
    description: 'Replace part of a file by exact search string.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        search: { type: 'string' },
        replacement: { type: 'string' },
        replaceAll: { type: 'boolean' },
      },
      required: [
        'path',
        'search',
        'replacement',
        'replaceAll',
      ],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'deleteFile',
    description: 'Delete a file from the virtual filesystem.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' },
      },
      required: ['path'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'evalInApp',
    description: 'Evaluate JavaScript in the running app document context.',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string' },
      },
      required: ['code'],
      additionalProperties: false,
    },
    strict: true,
  },
];
