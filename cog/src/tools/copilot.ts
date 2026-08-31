import { type Logger }
  from 'asljs-logging';
import { type ChildProcessWithoutNullStreams,
         spawn }
  from 'node:child_process';
import { type Tool }
  from './tool.js';

export interface CopilotAcpOptions
{
  command?: string;
  args?: string[];
  cwd?: string;
  shell?: boolean;
  protocolVersion?: number;
  timeoutMs?: number;
}

interface PendingRequest
{
  resolve: (
    value: unknown
  ) => void;
  reject: (
    error: Error
  ) => void;
  timer: NodeJS.Timeout;
}

const defaultTimeoutMs = 120000;

/** Speaks ACP over NDJSON on stdio, as documented for `copilot --acp --stdio`. */
export class CopilotAcpTool implements Tool
{
  readonly name = 'copilot';

  #child?: ChildProcessWithoutNullStreams;
  #sessionId?: string;
  #failure?: Error;
  #buffer = '';
  #nextId = 1;
  #chunks: string[] = [ ];

  readonly #pending = new Map<number, PendingRequest>();

  constructor(
    readonly logger: Logger,
    readonly options: CopilotAcpOptions = {}
  )
  {
  }

  get sessionId(): string | undefined {
    return this.#sessionId;
  }

  async start(): Promise<void>
  {
    if (this.#child) {
      throw new Error(
        'Copilot ACP server is already running');
    }

    const command =
      this.options.command
      ?? process.env.COPILOT_CLI_PATH
      ?? 'copilot';

    const args =
      this.options.args
      ?? [ '--acp',
           '--stdio' ];

    const cwd =
      this.options.cwd
      ?? process.cwd();

    this.logger.trace(
      'copilot: starting %s %o',
      command,
      args);

    this.#failure = undefined;

    const child =
      spawn(
        command,
        args,
        { cwd,
          shell: this.options.shell ?? false,
          stdio:
            [ 'pipe',
              'pipe',
              'pipe' ] });

    this.#child = child;

    child.stdout.setEncoding(
      'utf8');

    child.stderr.setEncoding(
      'utf8');

    child.stdout.on(
      'data',
      chunk =>
        this.#receive(
          chunk as string));

    child.stderr.on(
      'data',
      chunk =>
        this.logger.trace(
          'copilot stderr: %s',
          (chunk as string).trimEnd()));

    child.on(
      'error',
      error =>
        this.#fail(
          error));

    child.on(
      'exit',
      (
          code
        ) =>
      {
        this.#fail(
          new Error(
            `Copilot ACP server exited with code ${code}`));
      });

    try {
      await this.#request(
        'initialize',
        { protocolVersion:
            this.options.protocolVersion ?? 1,
          clientCapabilities: {} });

      const session =
        await this.#request(
          'session/new',
          { cwd,
            mcpServers: [ ] }) as { sessionId: string; };

      this.#sessionId = session.sessionId;

      this.logger.trace(
        'copilot: session %s',
        session.sessionId);
    } catch (error) {
      await this.stop();

      throw error;
    }
  }

  async prompt(
    text: string
  ): Promise<string>
  {
    if (!this.#sessionId) {
      throw new Error(
        'Copilot ACP server is not started');
    }

    this.#chunks = [ ];

    const result =
      await this.#request(
        'session/prompt',
        { sessionId: this.#sessionId,
          prompt:
            [ { type: 'text',
                text } ] }) as { stopReason?: string; };

    if (
      result.stopReason
      && result.stopReason !== 'end_turn'
    ) {
      throw new Error(
        `Copilot prompt stopped with reason ${result.stopReason}`);
    }

    return this.#chunks
      .join('')
      .trim();
  }

  async stop(): Promise<void>
  {
    const child = this.#child;

    if (!child) {
      return;
    }

    this.#child = undefined;
    this.#sessionId = undefined;

    this.logger.trace(
      'copilot: stopping');

    child.stdin.end();

    await new Promise<void>(
      (
          resolve
        ) =>
      {
        const timer =
          setTimeout(
            () =>
            {
            child.kill('SIGTERM');
            resolve();
          },
            2000);

        child.once(
          'exit',
          () =>
          {
            clearTimeout(timer);
            resolve();
          });
      }
    );

    this.#fail(
      new Error(
        'Copilot ACP server stopped'));
  }

  #request(
    method: string,
    params: unknown
  ): Promise<unknown>
  {
    const child = this.#child;

    if (!child) {
      return Promise.reject(
        new Error(
          'Copilot ACP server is not running'));
    }

    if (this.#failure) {
      return Promise.reject(
        this.#failure);
    }

    const id =
      this.#nextId++;

    return new Promise<unknown>(
      (
          resolve,
          reject
        ) =>
      {
        const timer =
          setTimeout(
            () =>
            {
            this.#pending.delete(id);

            reject(
              new Error(
                `Copilot request timed out: ${method}`));
          },
            this.options.timeoutMs
            ?? defaultTimeoutMs);

        this.#pending.set(
          id,
          { resolve,
            reject,
            timer });

        this.#send(
          { jsonrpc: '2.0',
            id,
            method,
            params });
      }
    );
  }

  #send(
    message: unknown
  ): void
  {
    this.#child?.stdin.write(
      `${JSON.stringify(message)}\n`);
  }

  #receive(
    chunk: string
  ): void
  {
    this.#buffer += chunk;

    const lines =
      this.#buffer.split('\n');

    this.#buffer =
      lines.pop() ?? '';

    for (const line of lines) {
      if (line.trim() === '') {
        continue;
      }

      this.#handle(
        JSON.parse(line) as Record<string, unknown>);
    }
  }

  #handle(
    message: Record<string, unknown>
  ): void
  {
    const id =
      message.id as number | undefined;

    const method =
      message.method as string | undefined;

    if (
      method !== undefined
      && id !== undefined
    ) {
      this.#handleAgentRequest(
        id,
        method);

      return;
    }

    if (method !== undefined) {
      this.#handleNotification(
        method,
        message.params);

      return;
    }

    if (id === undefined) {
      return;
    }

    const pending =
      this.#pending.get(id);

    if (!pending) {
      return;
    }

    this.#pending.delete(id);
    clearTimeout(pending.timer);

    const error =
      message.error as { message?: string; } | undefined;

    if (error) {
      pending.reject(
        new Error(
          `Copilot request failed: ${error.message ?? 'unknown error'}`));

      return;
    }

    pending.resolve(
      message.result);
  }

  #handleAgentRequest(
    id: number,
    method: string
  ): void
  {
    if (
      method
      === 'session/request_permission'
    ) {
      this.#send(
        { jsonrpc: '2.0',
          id,
          result:
            { outcome:
                { outcome: 'cancelled' } } });

      return;
    }

    this.#send(
      { jsonrpc: '2.0',
        id,
        error:
          { code: -32601,
            message:
              `Method not supported: ${method}` } });
  }

  #handleNotification(
    method: string,
    params: unknown
  ): void
  {
    if (method !== 'session/update') {
      return;
    }

    const update =
      (params as { update?: Record<string, unknown>; })
      ?.update;

    if (
      update?.sessionUpdate
      !== 'agent_message_chunk'
    ) {
      return;
    }

    const content =
      update.content as
      | { type?: string; text?: string; }
      | undefined;

    if (
      content?.type === 'text'
      && content.text !== undefined
    ) {
      this.#chunks.push(
        content.text);
    }
  }

  #fail(
    error: Error
  ): void
  {
    this.#failure ??= error;

    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }

    this.#pending.clear();
  }
}
