# AI Chat Integration Guide

This guide explains how to add an `asljs-ai-chat` component to a page,
configure it with an OpenAI transport, and optionally prompt the user for
their API key using `asljs-ai-chat-key`.

## Overview

- `asljs-ai-chat` — the chat UI component
- `OpenAiTransport` — sends requests to the OpenAI Responses API
- `asljs-ai-chat-key` — a small form component that collects an API key from
  the user

All of these are exported from `asljs-components`.

## Step 1: Add the chat component to the page

```html
<asljs-ai-chat id="chat"></asljs-ai-chat>
```

```ts
import 'asljs-components';
```

Importing `asljs-components` registers all custom elements, including
`asljs-ai-chat` and `asljs-ai-chat-key`.

## Step 2: Configure the transport

Create an `OpenAiTransport` with the API key and set it through `options`:

```ts
import { OpenAiTransport } from 'asljs-components';

const chat = document.getElementById('chat');

chat.options = {
  transport: new OpenAiTransport('sk-…'),
  provider: {
    getOpenAiApiKey: async () => '',
    getChatModel: async () => 'gpt-4o',
  },
  buildRequestInput: ({ messages }) => [
    { role: 'system', content: 'You are a helpful assistant.' },
    ...messages.read().map(m => ({ role: m.role, content: m.content })),
  ],
  getRequestContext: () => ({}),
};
```

When `options.transport` is provided, the component uses it for all requests
and does not call `provider.getOpenAiApiKey`. The `provider` is still used
for `getChatModel` and optionally `getInitialToolStepLimit`.

## Step 3 (optional): Ask the user for their API key

Use `asljs-ai-chat-key` to collect the API key from the user. Show it on the
page when no key is available, then replace it with the configured chat once
the user submits their key.

### HTML

```html
<div id="chat-area">
  <asljs-ai-chat-key
    id="key-prompt"
    label="Enter your OpenAI API key to start chatting"
    submit-label="Start chatting">
  </asljs-ai-chat-key>
</div>
```

### JavaScript

```ts
import 'asljs-components';
import { OpenAiTransport } from 'asljs-components';

const chatArea = document.getElementById('chat-area');
const keyPrompt = document.getElementById('key-prompt');

keyPrompt.addEventListener('key-submit', (event) => {
  const { key } = event.detail;

  // Remove the key prompt
  chatArea.removeChild(keyPrompt);

  // Create the chat element and configure it with the provided key
  const chat = document.createElement('asljs-ai-chat');
  chat.options = {
    transport: new OpenAiTransport(key),
    provider: {
      getOpenAiApiKey: async () => '',
      getChatModel: async () => 'gpt-4o',
    },
    buildRequestInput: ({ messages }) => [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...messages.read().map(m => ({ role: m.role, content: m.content })),
    ],
    getRequestContext: () => ({}),
  };

  chatArea.appendChild(chat);
});
```

## Full example: stored key with fallback to user prompt

This pattern loads a persisted key and shows the key prompt only when no key
is available.

```ts
import 'asljs-components';
import { OpenAiTransport } from 'asljs-components';

function buildChatOptions(apiKey) {
  return {
    transport: new OpenAiTransport(apiKey),
    provider: {
      getOpenAiApiKey: async () => '',
      getChatModel: async () => 'gpt-4o',
    },
    buildRequestInput: ({ messages }) => [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...messages.read().map(m => ({ role: m.role, content: m.content })),
    ],
    getRequestContext: () => ({}),
  };
}

async function mountChat(container) {
  const storedKey = localStorage.getItem('openai-api-key') ?? '';

  if (storedKey !== '') {
    // Key already available — mount the chat directly
    const chat = document.createElement('asljs-ai-chat');
    chat.options = buildChatOptions(storedKey);
    container.replaceChildren(chat);
    return;
  }

  // No key — show the key prompt first
  const keyPrompt = document.createElement('asljs-ai-chat-key');
  keyPrompt.label = 'Enter your OpenAI API key to start chatting';

  keyPrompt.addEventListener('key-submit', (event) => {
    const { key } = event.detail;
    localStorage.setItem('openai-api-key', key);

    const chat = document.createElement('asljs-ai-chat');
    chat.options = buildChatOptions(key);
    container.replaceChildren(chat);
  });

  container.replaceChildren(keyPrompt);
}

mountChat(document.getElementById('chat-container'));
```

## `asljs-ai-chat-key` properties

| Property      | Type    | Default                         | Description                             |
| ------------- | ------- | ------------------------------- | --------------------------------------- |
| `label`       | string  | `'OpenAI API Key'`              | Label shown above the input             |
| `placeholder` | string  | `'sk-…'`                       | Placeholder text for the input          |
| `submitLabel` | string  | `'Save key'`                    | Text on the submit button               |
| `disabled`    | boolean | `false`                         | Disables the input and button           |

## `asljs-ai-chat-key` events

| Event        | Detail type                | Description                                   |
| ------------ | -------------------------- | --------------------------------------------- |
| `key-submit` | `{ key: string }`          | Fired when user submits a non-empty API key   |

## `OpenAiTransport`

`OpenAiTransport` sends requests to the OpenAI Responses API
(`https://api.openai.com/v1/responses`).

```ts
import { OpenAiTransport } from 'asljs-components';

const transport = new OpenAiTransport('sk-…');
```

- Implements the `AiChatTransport` interface.
- Set via `options.transport` on `asljs-ai-chat`.
- If `options.transport` is not set, the component falls back to calling
  `options.provider.getOpenAiApiKey()` to create an implicit transport.
