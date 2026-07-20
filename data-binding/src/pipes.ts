import { coerceDisplayValue }
  from './coerce-display-value.js';
import { formatDate }
  from './date-formatting.js';
import { BindDataModelOptions,
         PipeFn }
  from './types.js';

const DATE_STYLE_NAMES =
  new Set(['short', 'medium', 'long', 'full']);

/**
 * Creates the built-in value pipes used by data-bind value bindings.
 *
 * If `locale` is omitted, Intl formatters use the runtime default locale
 * (for example browser language preferences).
 *
 * Built-ins:
 * - `string`
 * - `number`
 * - `currency[:code]`
 * - `date[:format]`
 * - `datetime[:format]`
 * - `fixed[:digits]`
 * - `upper`
 * - `lower`
 * - `json[:spaces]`
 * - `default:value`
 * - `safeHtml`
 *
 * @example
 * ```ts
 * const pipes = createBuiltInPipes('en-GB');
 * pipes.currency(12.5, 'GBP');
 * ```
 */
export function createBuiltInPipes(
    locale?: string
  ): Record<string, PipeFn>
{
  return {
    string: value =>
    {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      return coerceDisplayValue(value);
    },
    number: value =>
    {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      const numeric =
        Number(value);

      if (Number.isFinite(numeric)) {
        return new Intl.NumberFormat(locale)
          .format(numeric);
      }

      return '';
    },
    currency: (
      value,
      code = 'USD'
    ) =>
    {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      const numeric =
        Number(value);

      if (!Number.isFinite(numeric)) {
        return '';
      }

      return new Intl.NumberFormat(
        locale,
        { style: 'currency', currency: code }
      )
        .format(numeric);
    },
    date: (
      value,
      format = 'short'
    ) =>
    {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      return formatDateOrIntl(
        value,
        format,
        locale,
        false);
    },
    datetime: (
      value,
      format = 'short'
    ) =>
    {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      return formatDateOrIntl(
        value,
        format,
        locale,
        true);
    },
    fixed: (
      value,
      digitsText = '2'
    ) =>
    {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      const numeric =
        Number(value);

      const digits =
        Number(digitsText);

      if (!Number.isFinite(numeric)) {
        return '';
      }

      if (
        !Number.isInteger(digits)
        || digits < 0
      ) {
        return numeric.toString();
      }

      return numeric.toFixed(digits);
    },
    upper: value =>
    {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      return coerceDisplayValue(value).toUpperCase();
    },
    lower: value =>
    {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      return coerceDisplayValue(value).toLowerCase();
    },
    json: (
      value,
      spacesText = '0'
    ) =>
    {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      const spaces =
        Number(spacesText);

      const formatted =
        JSON.stringify(
          value,
          null,
          Number.isInteger(spaces) && spaces >= 0
          ? spaces
          : 0);

      return formatted ?? '';
    },
    default: (
      value,
      ...fallbackParts
    ) =>
    {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      if (value === '') {
        return fallbackParts.join(':');
      }

      return value;
    },
    safeHtml: value => value
  };
}

/**
 * Merges built-in pipes with user-provided pipes.
 * User-provided pipes override built-ins with the same name.
 *
 * @example
 * ```ts
 * const pipes = mergePipes({
 *   pipes: {
 *     yesno: value => value ? 'Yes' : 'No'
 *   }
 * });
 * ```
 */
export function mergePipes(
    options: BindDataModelOptions | undefined
  ): Record<string, PipeFn>
{
  const builtIns =
    createBuiltInPipes();

  return {
    ...builtIns,
    ...(options?.pipes ?? {})
  };
}

function formatDateOrIntl(
    value: unknown,
    format: string,
    locale: string | undefined,
    withTime: boolean
  ): string
{
  const dt =
    asDate(value);

  if (dt === null) {
    return '';
  }

  if (DATE_STYLE_NAMES.has(format)) {
    const style =
      format as 'short' | 'medium' | 'long' | 'full';

    return withTime
      ? new Intl.DateTimeFormat(
        locale,
        { dateStyle: style, timeStyle: style }
      )
        .format(dt)
      : new Intl.DateTimeFormat(
        locale,
        { dateStyle: style }
      )
        .format(dt);
  }

  return formatDate(
    dt,
    format);
}

function asDate(
    value: unknown
  ): Date | null
{
  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime())
      ? null
      : value;
  }

  if (
    typeof value === 'string'
    || typeof value === 'number'
  ) {
    const dt =
      new Date(value);

    return Number.isNaN(
      dt.getTime())
      ? null
      : dt;
  }

  return null;
}
