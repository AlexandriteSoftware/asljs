export function hasPendingPlanChanges(content: string): boolean {
  const normalized = normalizeWorkflowBody(content, 'PLAN');

  return normalized !== ''
    && normalized !== 'Pending changes for the next generation cycle go here.';
}

export function hasPendingChangeItems(content: string): boolean {
  const normalized = normalizeWorkflowBody(content, 'CHANGE');

  return normalized !== ''
    && normalized !== 'Active implementation changes for the current generation cycle go here.';
}

export function buildChangeListFromPlan(content: string): string {
  const lines =
    normalizeWorkflowBody(content, 'PLAN')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line !== '');

  if (lines.length === 0) {
    return '# CHANGE\n';
  }

  const items = lines.map(line =>
    /^[-*]\s+/.test(line)
      ? line
      : `- ${line}`);

  return [
    '# CHANGE',
    '',
    'Current generation cycle:',
    '',
    ...items,
  ].join('\n');
}

function normalizeWorkflowBody(
    content: string,
    heading: 'PLAN' | 'CHANGE',
  ): string
{
  return content
    .replace(new RegExp(`^#\\s+${heading}\\s*$`, 'im'), '')
    .trim();
}
