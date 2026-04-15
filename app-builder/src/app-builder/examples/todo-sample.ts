import {
  type FileRecord,
} from '../types.js';

export function buildTodoSampleFiles(
    appId: string,
    createId: () => string,
  ): FileRecord[]
{
  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TODO Sample</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main class="app">
    <h1>TODO Sample</h1>
    <form id="todo-form">
      <input id="todo-input" type="text" placeholder="What needs doing?" required />
      <button type="submit">Add</button>
    </form>
    <section class="list-section">
      <h2>Todo</h2>
      <ul id="todo-list" class="todo-list"></ul>
    </section>
    <section class="list-section">
      <h2>Done</h2>
      <ul id="done-list" class="todo-list"></ul>
    </section>
  </main>
  <script type="module" src="app.js"></script>
</body>
</html>`;

  const styleCss = `:root {
  color-scheme: light dark;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #0b1220;
  color: #e7edf7;
}

.app {
  max-width: 560px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #2b3954;
  border-radius: 8px;
  background: #121b2d;
}

#todo-form {
  display: flex;
  gap: 0.5rem;
}

#todo-input {
  flex: 1;
  padding: 0.5rem;
}

.list-section {
  margin-top: 1rem;
}

.list-section h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.todo-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid #2b3954;
  border-radius: 6px;
  background: #0f1a2f;
}

.todo-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.todo-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.done .todo-text {
  text-decoration: line-through;
  opacity: 0.75;
}

.bin-btn {
  border: 1px solid #3b4e7a;
  background: transparent;
  color: #e7edf7;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
}

.check-btn {
  border: 1px solid #3b4e7a;
  background: #1b2b4b;
  color: #e7edf7;
  border-radius: 6px;
  padding: 0.35rem 0.55rem;
  cursor: pointer;
}

.todo-empty {
  color: #9fb2d8;
  font-size: 0.9rem;
  padding: 0.25rem 0;
}`;

  const appJs = `const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');

if (!(form instanceof HTMLFormElement)
    || !(input instanceof HTMLInputElement)
    || !(list instanceof HTMLUListElement)
    || !(doneList instanceof HTMLUListElement))
{
  throw new Error('Missing TODO app elements.');
}

const state = {
  todos: [],
  done: [],
};

function uid() {
  return crypto.randomUUID();
}

function render() {
  list.replaceChildren();
  doneList.replaceChildren();

  for (const todo of state.todos) {
    const item = document.createElement('li');
    item.className = 'todo-item';

    const main = document.createElement('div');
    main.className = 'todo-main';

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const actions = document.createElement('div');

    const checkButton = document.createElement('button');
    checkButton.type = 'button';
    checkButton.className = 'check-btn';
    checkButton.textContent = '✓';
    checkButton.title = 'Mark done';
    checkButton.addEventListener('click', () => {
      state.todos = state.todos.filter(entry => entry.id !== todo.id);
      state.done.unshift(todo);
      render();
    });

    main.appendChild(checkButton);
    main.appendChild(text);

    const bin = document.createElement('button');
    bin.type = 'button';
    bin.className = 'bin-btn';
    bin.textContent = '🗑';
    bin.title = 'Delete todo';
    bin.addEventListener('click', () => {
      state.todos = state.todos.filter(entry => entry.id !== todo.id);
      render();
    });

    actions.appendChild(checkButton);
    actions.appendChild(bin);

    item.appendChild(main);
    item.appendChild(actions);
    list.appendChild(item);
  }

  for (const todo of state.done) {
    const item = document.createElement('li');
    item.className = 'todo-item done';

    const main = document.createElement('div');
    main.className = 'todo-main';

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    main.appendChild(text);

    const actions = document.createElement('div');

    const bin = document.createElement('button');
    bin.type = 'button';
    bin.className = 'bin-btn';
    bin.textContent = '🗑';
    bin.title = 'Delete todo';
    bin.addEventListener('click', () => {
      state.done = state.done.filter(entry => entry.id !== todo.id);
      render();
    });

    actions.appendChild(bin);

    item.appendChild(main);
    item.appendChild(actions);
    doneList.appendChild(item);
  }

  if (state.todos.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'todo-empty';
    empty.textContent = 'No active TODO items.';
    list.appendChild(empty);
  }

  if (state.done.length === 0) {
    const emptyDone = document.createElement('li');
    emptyDone.className = 'todo-empty';
    emptyDone.textContent = 'No completed TODO items yet.';
    doneList.appendChild(emptyDone);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === '') {
    return;
  }

  state.todos.unshift({
    id: uid(),
    text,
  });
  input.value = '';
  input.focus();
  render();
});

render();`;

  const packageJson = `{
  "name": "todo-sample",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "echo \"Open index.html in a browser\""
  }
}`;

  const readme = `# TODO Sample

Simple TODO sample application.

## Usage

Open index.html and add items using the input.

## Behavior

- Add TODO item on submit.
- Active TODO items show Check and Bin actions.
- Clicking Check moves an item immediately to Done.
- Each item has a bin icon to delete it.
`;

  return [
    {
      id: createId(),
      appId,
      name: 'index.html',
      content: indexHtml,
    },
    {
      id: createId(),
      appId,
      name: 'style.css',
      content: styleCss,
    },
    {
      id: createId(),
      appId,
      name: 'app.js',
      content: appJs,
    },
    {
      id: createId(),
      appId,
      name: 'package.json',
      content: packageJson,
    },
    {
      id: createId(),
      appId,
      name: 'README.md',
      content: readme,
    },
  ];
}
