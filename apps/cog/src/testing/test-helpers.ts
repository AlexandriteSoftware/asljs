export function argv(
    ...args: string[]
  ): string[]
{
  return [ 'node',
           'cog',
           ...args ];
}

export function quoteShellArg(
    value: string
  ): string
{
  return `"${
    value.replace(
      /"/g,
      '"')
  }"`;
}

export function nodeCommand(
    source: string
  ): string
{
  return `${
    quoteShellArg(
      process.execPath)
  } -e ${
    quoteShellArg(
      source)
  }`;
}
