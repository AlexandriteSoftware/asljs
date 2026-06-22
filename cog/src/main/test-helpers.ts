export function argv(
    ...args: string[]
  ): string[]
{
  return [
    'node',
    'cog',
    ...args
  ];
}

export function quoteShellArg(
    value: string
  ): string
{
  return `"${value.replace(
    /"/g,
    '\"')}"`;
}

export function nodeCommand(
    source: string
  ): string
{
  return `${quoteShellArg(
    process.execPath)} -e ${quoteShellArg(
    source)}`;
}

export function withEnv(
    updates: Record<string, string | undefined>,
    action: () => void | Promise<void>
  ): Promise<void>
{
  const previous =
    new Map<string, string | undefined>();

  for (const name of Object.keys(
      updates)) {
    previous.set(
      name,
      process.env[name]);

    const value =
      updates[name];

    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] =
        value;
    }
  }

  return Promise.resolve()
    .then(
      action)
    .finally(
      () => {
        for (const [name, value] of previous) {
          if (value === undefined) {
            delete process.env[name];
          } else {
            process.env[name] =
              value;
          }
        }
      });
}
