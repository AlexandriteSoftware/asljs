import { type Logger,
         type LoggerProvider,
         NullLoggerProvider }
  from 'asljs-logging';
import { type AiAgent }
  from 'asljs-mdcli';

export interface Output
{
  write(
    text: string
  ): unknown;
}

/**
 * What a command reads from and writes to, so that tests can replace it.
 */
export interface Io
{
  /**
   * The board folder: it holds `Ideas`, `Plans`, `Tasks`, `Results` and
   * `Archive`; ids and paths are resolved in it.
   */
  cwd: string;
  env: Record<string, string | undefined>;
  stdout: Output;
  stderr: Output;

  /**
   * The clock results are stamped with; the system clock when absent.
   */
  now?: () => Date;

  /**
   * Finds the AI agent to use when none is named; `detectAgent` when absent.
   */
  detectAgent?: () => Promise<AiAgent | null>;

  /**
   * Where the MCP server, the view and the agent log, by component; nothing
   * is logged when absent. The entry point creates it from `--loglevel`,
   * `--logfile`, `--logformat` and the `BOARD_LOG_` variables.
   */
  loggerProvider?: LoggerProvider;
}

const NO_LOGGING =
  new NullLoggerProvider();

/**
 * The logger of a component, e.g. `board.mcp`, from the provider of `io`.
 */
export function getLogger(
    io: Io,
    context: string
  ): Logger
{
  return (io.loggerProvider ?? NO_LOGGING).getLogger(context);
}
