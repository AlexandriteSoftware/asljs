import path
  from 'node:path';
import { fileURLToPath }
  from 'node:url';

/**
 * Path to the compiled script file, which is supposed to be located in
 * common/dist/toolkit.
 */
const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

/**
 * Path to the common package directory, which is supposed to be the parent of
 * this script's directory.
 */
export const PKG_COMMON_DIR =
  path.dirname(
    path.dirname(
      path.dirname(
        SCRIPT_FILE_PATH)));

/**
 * Path to the repository root directory, which is supposed to be the parent of
 * the common package directory.
 */
export const ROOT_DIR =
  path.dirname(
    PKG_COMMON_DIR);

export function log(
    message: string,
    ...params: any[]
  ): void
{
  console.error(
    message.replace(
      /%[sdo]/g,
      m => {
        const param =
          params.shift();

        if (param === undefined) {
          switch (m) {
            case '%s':
              return String(param);
            case '%d':
              return String(
                Number(param));
            case '%o':
              return JSON.stringify(param);
          }

          return m;
        }

        return param;
      }));
}
