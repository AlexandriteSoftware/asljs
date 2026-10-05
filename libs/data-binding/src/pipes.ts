import { coerceDisplayValue }
  from './coerce-display-value.js';
import { formatDate }
  from './date-formatting.js';
import { sanitizeHtml }
  from './sanitize-html.js';
import { BindDataModelOptions,
         PipeFn }
  from './types.js';

const DATE_STYLE_NAMES =
  new Set(
    [ 'short',
      'medium',
      'long',
      'full' ]);

// An ISO date without a time, as a JSON API, <input type="date"> or a stored
// record gives it.
const DATE_ONLY_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})$/;

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
 * - `default:value` - the fallback for `null`, `undefined` and `''`
 * - `safeHtml` - sanitizes HTML with DOMPurify, for `data-bind-html`
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
  return { string:
             (
                 value
               ) =>
             {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      return coerceDisplayValue(value);
    },
           number:
             (
                 value
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

      if (Number.isFinite(numeric)) {
        return new Intl.NumberFormat(locale)
          .format(numeric);
      }

      return '';
    },
           currency:
             (
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
        { style: 'currency',
          currency: code })
        .format(numeric);
    },
           date:
             (
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
           datetime:
             (
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
           fixed:
             (
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
           upper:
             (
                 value
               ) =>
             {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      return coerceDisplayValue(value).toUpperCase();
    },
           lower:
             (
                 value
               ) =>
             {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      return coerceDisplayValue(value).toLowerCase();
    },
           json:
             (
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
           default:
             (
                 value,
                 ...fallbackParts
               ) =>
             {
      // The one built-in that consumes a nullish value: a missing path reads
      // null, and that is the value a default is for.
      if (
        value === null
        || value === undefined
        || value === ''
      ) {
        return fallbackParts.join(':');
      }

      return value;
    },
           safeHtml:
             (
                 value: unknown
               ): unknown =>
             {
      if (
        value === null
        || value === undefined
      ) {
        return value;
      }

      return sanitizeHtml(
        String(value));
    } };
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

  return { ...builtIns,
           ...(options?.pipes ?? {}) };
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
        { dateStyle: style,
          timeStyle: style })
        .format(dt)
      : new Intl.DateTimeFormat(
        locale,
        { dateStyle: style })
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
  if (
    typeof value
    === 'string'
  ) {
    const dateOnly =
      DATE_ONLY_PATTERN.exec(value);

    if (dateOnly !== null) {
      return localDate(
        Number(dateOnly[1]),
        Number(dateOnly[2]),
        Number(dateOnly[3]));
    }
  }

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime())
      ? null
      : value;
  }

  if (
    typeof value
    === 'string'
    || typeof value
       === 'number'
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

/**
 * The local midnight of a calendar date. `new Date('2026-02-03')` is UTC
 * midnight, which the formatters, reading local time, show as 2 February west
 * of Greenwich; a date written without a time means that day wherever it is
 * shown.
 *
 * Returns `null` for a day the month does not have, which the `Date`
 * constructor would roll over into the next month.
 */
function localDate(
    year: number,
    month: number,
    day: number
  ): Date | null
{
  const date =
    new Date(0);

  // setFullYear, unlike the constructor, keeps years below 100 as written.
  date.setFullYear(
    year,
    month - 1,
    day);

  date.setHours(
    0,
    0,
    0,
    0);

  if (
    date.getFullYear()
    !== year
    || date.getMonth()
       !== month - 1
    || date.getDate()
       !== day
  ) {
    return null;
  }

  return date;
}
