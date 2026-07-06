import path
  from 'node:path';
import { fileURLToPath }
  from 'node:url';

const SCRIPT_FILE_PATH =
  fileURLToPath(
    import.meta.url);

/**
 * Path to the common package directory, which is supposed to be the parent of
 * this script's directory, assuming the compiled script is located in
 * common/dist/toolkit.
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
    message: string
  ): void
{
  console.log(
    `[toolkit] ${message}`);
}
