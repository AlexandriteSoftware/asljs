export type RenderKioskHtmlOptions =
  { scriptSource: string;
    title?: string };

function replaceAllLiteral(
    value: string,
    search: string,
    replacement: string
  ): string
{
  return value
    .split(search)
    .join(replacement);
}

function escapeHtmlText(
    value: string
  ): string
{
  return replaceAllLiteral(
    replaceAllLiteral(
      replaceAllLiteral(
        replaceAllLiteral(
          replaceAllLiteral(
            value,
            '&',
            '&amp;'),
          '<',
          '&lt;'),
        '>',
        '&gt;'),
      '"',
      '&quot;'),
    "'",
    '&#39;');
}

function escapeScriptForInlineTag(
    scriptSource: string
  ): string
{
  // Prevent premature closing of the script tag.
  return replaceAllLiteral(
    scriptSource,
    '</script',
    '<\\/script');
}

export function renderKioskHtml(
    options: RenderKioskHtmlOptions
  ): string
{
  if (!options
    || typeof options !== 'object')
  {
    throw new TypeError(
      'renderKioskHtml: options must be an object');
  }

  const { scriptSource, title } =
    options;

  if (typeof scriptSource !== 'string') {
    throw new TypeError(
      'renderKioskHtml: scriptSource must be a string');
  }

  const safeTitle =
    escapeHtmlText(
      title ?? 'Kiosk');

  const safeScript =
    escapeScriptForInlineTag(
      scriptSource);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
</head>
<body>
  <script type="module">
${safeScript}
  </script>
</body>
</html>
`;
}
