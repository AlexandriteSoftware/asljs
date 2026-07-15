const DEFAULT_SHARE_LIMIT_LABEL =
  'Use copy buttons to share as text or HTML.';

export function shouldExcludeNonApplicationFileFromShare(
  fileName: string
): boolean
{
  const normalized =
    fileName.trim();

  return /(?:^|\/)[^/]+\.test\.js$/i.test(normalized)
    || /(?:^|\/)(DEVELOP|CHANGE|PLAN)\.md$/i.test(normalized);
}

export function buildShareStatusMessage(
  urlLength: number,
  practicalLimit: number,
  maxLimit: number
): string
{
  const prefix =
    `Link is ready at ${urlLength} characters. Practical working limit is about ${practicalLimit}. `;

  if (urlLength > maxLimit) {
    return `${prefix}It is over the warning threshold of ${maxLimit}, so some apps may reject it.`;
  }

  if (urlLength > practicalLimit) {
    return `${prefix}It may still work, but shorter links are safer.`;
  }

  return `${prefix}${DEFAULT_SHARE_LIMIT_LABEL}`;
}
