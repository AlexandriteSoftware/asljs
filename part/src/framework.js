let instanceId = 1;

/**
 * @param {string} className
 * @return {string}
 */
export function getInstanceId(
  className)
{
  const id =
    `${className}[${instanceId}]`;

  instanceId++;

  return id;
}