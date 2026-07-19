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

  progressElement.classList.toggle(
    'hidden',
    !visible
  );
}

export function appendChatMessageUi(
    messagesElement: HTMLElement,
    role: 'user' | 'assistant',
    text: string
  ): void
{
  const message =
    document.createElement('div');

  message.className = `chat-msg ${role}`;

  const roleLabel =
    document.createElement('div');

  roleLabel.className = 'chat-msg-role';

  roleLabel.textContent = role === 'user'
    ? 'You'
    : 'Assistant';

  const bubble =
    document.createElement('div');

  bubble.className = 'chat-bubble';
  bubble.textContent = text;

  message.appendChild(roleLabel);
  message.appendChild(bubble);
  messagesElement.appendChild(message);
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

export function renderChatChoicesUi(
    containerElement: HTMLElement,
    question: string,
    options: string[],
    onChoose: (value: string) => void
  ): void
{
  containerElement.replaceChildren();

  if (question.trim() === '' || options.length === 0) {
    containerElement.classList.add('hidden');
    return;
  }

  const questionElement =
    document.createElement('p');

  questionElement.className = 'chat-choice-question';
  questionElement.textContent = question;

  containerElement.appendChild(
    questionElement
  );

  const optionsElement =
    document.createElement('div');

  optionsElement.className = 'chat-choice-options';

  for (const option of options) {
    const button =
      document.createElement('button');

    button.type = 'button';
    button.className = 'chat-choice-option';
    button.textContent = option;

    button.addEventListener(
      'click',
      () =>
      {
        onChoose(option);
      }
    );

    optionsElement.appendChild(button);
  }

  containerElement.appendChild(optionsElement);
  containerElement.classList.remove('hidden');
}

export function clearChatChoicesUi(
    containerElement: HTMLElement
  ): void
{
  containerElement.replaceChildren();
  containerElement.classList.add('hidden');
}
