# AI Chat

`asljs-ai-chat` (`AiChat`) is a chat UI around an observable, eventful model,
with optional persistence and tool execution hooks. `asljs-ai-chat-key`
collects an API key from the user.

## The chat

- API: `createAiChatModel()`, `AiChat`
- Custom element: `asljs-ai-chat`

The chat state lives directly on the custom element: `messages`, `promptDraft`,
`choicePrompt`, `progress`, `sending` and the related fields. The element keeps
that state in a model it creates itself, so no separate model object is passed
in. `messages` is a store object with `save(...)`, `read()` and a `list`
collection for rendering and data binding.

`options` carries the request, persistence and tool callbacks the chat needs:

- `options.transport` sets the HTTP transport. `OpenAiTransport` is the
  built-in OpenAI Responses API transport, constructed with an API key string.
  Without a transport, the component falls back to
  `options.provider.getOpenAiApiKey()`.
- `options.stateStore` persists the chat state. Without it, the state is kept in
  `sessionStorage`, under a key derived from the page path and the element id.

Persisted state includes `lastResponseId` and the operational UI state
(`choicePrompt`, `progress` and `sending`), so a page refresh can restore an
in-progress chat.

## The key prompt

`asljs-ai-chat-key` (`AiChatKeyPrompt`) is a small form that collects an API
key. It has `label`, `placeholder`, `submitLabel` and `disabled` properties, and
dispatches a `key-submit` event with the detail `{ key }` when the user submits
a non-empty key.
