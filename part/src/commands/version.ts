import { createRequire }
  from 'node:module';
import { Environment }
  from '../environment.js';

export function execVersion(
  environment: Environment
): Promise<number>
{
  const packageVersion =
    (() =>
  {
    const require =
      createRequire(
        import.meta.url);

    const { version } =
      require(
        '../../package.json');

    return version;
  })();

  environment.stdout.write(
    `${packageVersion}\n`
  );

  return Promise.resolve(0);
}
