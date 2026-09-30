import { Environment }
  from '../environment.js';
import { McpClient }
  from '../mcp/client.js';

/**
 * What a command works with: where to write, and the server to work through.
 *
 * A command never touches the library itself. It asks the server, and renders
 * what comes back.
 */
export interface CommandContext
{
  environment: Environment;

  client: McpClient;
}
