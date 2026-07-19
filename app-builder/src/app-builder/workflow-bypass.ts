const DIRECT_FILE_PATTERN =
  /\b(?:[\w-]+\/)*[\w.-]+\.(?:html|css|js|json|md|svg|png|jpg|jpeg|gif|webp)\b/i;

export function shouldBypassWorkflowCycle(
    request: string
  ): boolean
{
  const normalized =
    request.trim().toLowerCase();

  if (normalized === '') {
    return false;
  }

  if (DIRECT_FILE_PATTERN.test(normalized)) {
    return true;
  }

  return /\b(?:add|create|replace|update|change|fix|edit)\b.*\b(?:image|icon|logo|background|asset)\b/i
    .test(normalized);
}
