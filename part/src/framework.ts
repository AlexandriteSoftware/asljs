let instanceId = 1;

export function getInstanceId(
    className: string
  ): string
{
  const id =
    `${className}[${instanceId}]`;

  instanceId++;

  return id;
}