export function renderGeneratingButtonUi(
    button: HTMLButtonElement,
    generating: boolean
  ): void
{
  button.disabled = generating;
  button.innerHTML = generating
    ? '<span class="spinner"></span> Sending…'
    : 'Send';
}

export function setChatProgressUi(
    progressElement: HTMLElement,
    message: string,
    visible: boolean
  ): void
{
  progressElement.textContent = message;
  progressElement.classList.toggle('hidden', !visible);
}

export function appendChatMessageUi(
    messagesElement: HTMLElement,
    role: 'user' | 'assistant',
    text: string,
  ): void
{
  const message = document.createElement('div');
  message.className = `chat-msg ${role}`;

  const roleLabel = document.createElement('div');
  roleLabel.className = 'chat-msg-role';
  roleLabel.textContent = role === 'user'
    ? 'You'
    : 'Assistant';

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;

  message.appendChild(roleLabel);
  message.appendChild(bubble);
  messagesElement.appendChild(message);
  messagesElement.scrollTop = messagesElement.scrollHeight;
}
