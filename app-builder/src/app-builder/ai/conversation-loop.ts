import {
  type ChatMessage,
} from '../types.js';
import {
  hasOnlyWorkflowFiles,
} from '../workflow-files.js';

export const README_SNAPSHOT_FILE = '.README.md';
const MAX_TRANSCRIPT_MESSAGES = 10;

export function getConversationKickoffMessage(fileNames: string[]): string {
  if (hasOnlyWorkflowFiles(fileNames)) {
    return 'What would you like to create? You can describe it in simple words, and I will help shape the plan first.';
  }

  return 'What would you like to add or change? I will keep README.md as the current app state and put new ideas into PLAN.md.';
}

export function buildConversationPrompt(messages: ChatMessage[]): string {
  const transcript =
    messages
      .slice(-MAX_TRANSCRIPT_MESSAGES)
      .map(message => `${formatRoleLabel(message.role)}: ${message.text}`)
      .join('\n\n');

  return [
    'Conversation transcript:',
    transcript,
    '',
    'Use the transcript to resolve short follow-up answers such as "yes",',
    '"2 players", or "make it blue". The last user message is the newest',
    'request.',
  ].join('\n');
}

function formatRoleLabel(role: ChatMessage['role']): string {
  return role === 'assistant'
    ? 'Assistant'
    : 'User';
}
