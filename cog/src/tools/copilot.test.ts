import assert
  from 'node:assert/strict';
import test
  from 'node:test';
import { createLoggerProvider }
  from '../logger.js';
import { TaskRegistry }
  from '../task.js';
import { CopilotAcpTool }
  from './copilot.js';

const loggerProvider =
  createLoggerProvider();

test.after(
  async () => await loggerProvider.dispose());

/** Minimal ACP agent: answers initialize, session/new, and one permission round trip. */
const stubAgent =
  `
  let buffer = '';
  let promptId = null;
  let promptText = '';

  const send =
    message =>
      process.stdout.write(JSON.stringify(message) + '\\n');

  process.stdin.setEncoding('utf8');

  process.stdin.on('data', chunk => {
    buffer += chunk;
    const lines = buffer.split('\\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (line.trim() === '') continue;
      const message = JSON.parse(line);

      if (message.method === 'initialize') {
        send({ jsonrpc: '2.0', id: message.id, result: { protocolVersion: 1 } });
      } else if (message.method === 'session/new') {
        send({ jsonrpc: '2.0', id: message.id, result: { sessionId: 'stub-session' } });
      } else if (message.method === 'session/prompt') {
        promptId = message.id;
        promptText = message.params.prompt[0].text;
        send({ jsonrpc: '2.0', id: 9001, method: 'session/request_permission', params: {} });
      } else if (message.id === 9001 && message.result) {
        send({
          jsonrpc: '2.0',
          method: 'session/update',
          params: {
            update: {
              sessionUpdate: 'agent_message_chunk',
              content: {
                type: 'text',
                text: 'echo:' + promptText + ':' + message.result.outcome.outcome
              }
            }
          }
        });
        send({ jsonrpc: '2.0', id: promptId, result: { stopReason: 'end_turn' } });
      }
    }
  });
  `;

function createTool(
  ): CopilotAcpTool
{
  return new CopilotAcpTool(
    loggerProvider.getLogger(
      'CopilotAcpTool'),
    { command: process.execPath,
      args:
        [ '-e',
          stubAgent ],
      timeoutMs: 10000 });
}

test(
  'copilot tool completes the ACP handshake and answers prompts',
  async () =>
  {
    const tool =
      createTool();

    await tool.start();

    try {
      assert.equal(
        tool.sessionId,
        'stub-session');

      assert.equal(
        await tool.prompt(
          'first'),
        'echo:first:cancelled');

      assert.equal(
        await tool.prompt(
          'second'),
        'echo:second:cancelled');
    } finally {
      await tool.stop();
    }

    assert.equal(
      tool.sessionId,
      undefined);
  });

test(
  'copilot tool rejects prompts before start and double starts',
  async () =>
  {
    const tool =
      createTool();

    await assert.rejects(
      tool.prompt(
        'first'),
      /not started/);

    await tool.start();

    try {
      await assert.rejects(
        tool.start(),
        /already running/);
    } finally {
      await tool.stop();
    }
  });

test(
  'copilot tool connects the task MCP server when configured',
  async () =>
  {
    const agent =
      `
      let buffer = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', chunk => {
        buffer += chunk;
        const lines = buffer.split('\\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (line.trim() === '') continue;
          const message = JSON.parse(line);
          process.stdout.write(JSON.stringify({
            jsonrpc: '2.0',
            id: message.id,
            result: message.method === 'session/new'
              ? { sessionId:
                    message.params.mcpServers.length === 1
                    && message.params.mcpServers[0].name
                       === 'asljs-cog-tasks'
                    ? 'task-session'
                    : 'missing-task-server' }
              : { protocolVersion: 1 }
          }) + '\\n');
        }
      });
      `;

    const tool =
      new CopilotAcpTool(
        loggerProvider.getLogger(
          'CopilotAcpTool'),
        { command: process.execPath,
          args:
            [ '-e',
              agent ],
          taskRegistry:
            new TaskRegistry(),
          taskServerPath: 'task-server.js',
          timeoutMs: 10000 });

    await tool.start();

    try {
      assert.equal(
        tool.sessionId,
        'task-session');
    } finally {
      await tool.stop();
    }
  });
