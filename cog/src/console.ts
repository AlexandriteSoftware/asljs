export interface HostConsole
{
  writeLine: (
    line: string
  ) => void;
}

export class DefaultHostConsole
  implements HostConsole
{
  writeLine(
      line: string
    ): void
  {
    process.stdout.write(
      `${line}\n`);
  }
}
