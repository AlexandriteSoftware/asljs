export function coerceDisplayValue(
    value: unknown
  ): string
{
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}
