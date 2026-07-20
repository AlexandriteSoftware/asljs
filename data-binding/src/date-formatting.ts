type DateFormatToken = { token: string; getter: (d: Date) => string; };

const DATE_FORMATTERS: DateFormatToken[] =
  [{
  token: 'yyyy',
  getter: (d: Date) =>
    d.getFullYear().toString().padStart(
      4,
      '0')
}, {
  token: 'yy',
  getter: (d: Date) =>
    d.getFullYear().toString().substring(2).padStart(
      2,
      '0')
}, {
  token: 'MM',
  getter: (d: Date) =>
    (d.getMonth() + 1).toString().padStart(
      2,
      '0')
}, {
  token: 'dd',
  getter: (d: Date) =>
    d.getDate().toString().padStart(
      2,
      '0')
}, {
  token: 'hh',
  getter: (d: Date) =>
    d.getHours().toString().padStart(
      2,
      '0')
}, {
  token: 'mm',
  getter: (d: Date) =>
    d.getMinutes().toString().padStart(
      2,
      '0')
}, {
  token: 'ss',
  getter: (d: Date) =>
    d.getSeconds().toString().padStart(
      2,
      '0')
}];

const dateFormatterCache = new Map<string, (dt: Date) => string>();

function createFormatter(
    format: string
  ): (dt: Date) => string
{
  const parts: Array<(dt: Date) => string> = [];

  let part = '';

  for (let i = 0; i < format.length;) {
    if (format[i] === '\\') {
      if (i + 1 < format.length) {
        part += format[i + 1];
        i += 2;
      } else {
        part += format[i];
        i++;
      }

      continue;
    }

    let matched = false;

    for (const item of DATE_FORMATTERS) {
      if (
        format.startsWith(
          item.token,
          i)
      ) {
        if (part.length > 0) {
          const localPart = part;

          parts.push(
            () => localPart);

          part = '';
        }

        parts.push(
          item.getter);

        i += item.token.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      part += format[i];
      i++;
    }
  }

  if (part.length > 0) {
    parts.push(
      () => part);
  }

  return dt =>
    parts.map(
      p => p(dt)).join('');
}

export function formatDate(
    dt: Date,
    format: string | null
  ): string
{
  if (!format) {
    return dt.toString();
  }

  let formatter =
    dateFormatterCache.get(format);

  if (!formatter) {
    formatter = createFormatter(format);

    dateFormatterCache.set(
      format,
      formatter);
  }

  return formatter(dt);
}
