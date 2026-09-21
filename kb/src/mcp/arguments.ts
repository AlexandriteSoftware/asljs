import { EntryKind }
  from '../files.js';

/**
 * Readers for the arguments of a tool call.
 *
 * Arguments arrive from a client, so each is checked before it is used, and a
 * bad one is reported as a message naming it.
 */

export function requireString(
    args: Record<string, unknown>,
    name: string
  ): string
{
  const value = args[name];

  if (
    typeof value
    !== 'string'
  ) {
    throw new Error(
      `Argument '${name}' is required and must be a string.`);
  }

  return value;
}

export function optionalString(
    args: Record<string, unknown>,
    name: string
  ): string | undefined
{
  const value = args[name];

  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value
    !== 'string'
  ) {
    throw new Error(
      `Argument '${name}' must be a string.`);
  }

  return value;
}

export function optionalBoolean(
    args: Record<string, unknown>,
    name: string
  ): boolean | undefined
{
  const value = args[name];

  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value
    !== 'boolean'
  ) {
    throw new Error(
      `Argument '${name}' must be a boolean.`);
  }

  return value;
}

export function optionalCount(
    args: Record<string, unknown>,
    name: string
  ): number | undefined
{
  const value = args[name];

  if (value === undefined) {
    return undefined;
  }

  if (!isCount(value)) {
    throw new Error(
      `Argument '${name}' must be a positive integer.`);
  }

  return value;
}

export function optionalStringArray(
    args: Record<string, unknown>,
    name: string
  ): string[] | undefined
{
  const value = args[name];

  if (value === undefined) {
    return undefined;
  }

  if (!isStringArray(value)) {
    throw new Error(
      `Argument '${name}' must be an array of strings.`);
  }

  return value;
}

export function optionalKind(
    args: Record<string, unknown>,
    name: string
  ): EntryKind | 'any' | undefined
{
  const value =
    optionalString(
      args,
      name);

  if (value === undefined) {
    return undefined;
  }

  if (
    value === 'file'
    || value === 'folder'
    || value === 'any'
  ) {
    return value;
  }

  throw new Error(
    `Argument '${name}' must be file, folder or any.`);
}

function isCount(
    value: unknown
  ): value is number
{
  if (
    typeof value
    !== 'number'
  ) {
    return false;
  }

  if (!Number.isInteger(value)) {
    return false;
  }

  return value > 0;
}

function isStringArray(
    value: unknown
  ): value is string[]
{
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(
    entry => typeof entry === 'string');
}
