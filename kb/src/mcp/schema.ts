/**
 * Builders for the JSON Schema a tool declares for its arguments.
 */

export function objectSchema(
    properties: Record<string, unknown>,
    required: string[] = [ ]
  ): Record<string, unknown>
{
  if (required.length === 0) {
    return { type: 'object',
             properties };
  }

  return { type: 'object',
           properties,
           required };
}

export function stringProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'string',
           description };
}

export function booleanProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'boolean',
           description };
}

export function numberProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'number',
           description };
}

export function stringArrayProperty(
    description: string
  ): Record<string, unknown>
{
  return { type: 'array',
           items:
             { type: 'string' },
           description };
}

export function enumProperty(
    values: readonly string[],
    description: string
  ): Record<string, unknown>
{
  return { type: 'string',
           enum:
             [ ...values ],
           description };
}

/**
 * Schema shared by the tools that transfer an entry from one path to another.
 */
export function transferSchema(
  ): Record<string, unknown>
{
  return objectSchema(
    { source:
        stringProperty(
          'Library-relative path of the entry to transfer.'),
      target:
        stringProperty(
          'Library-relative path of the destination.'),
      overwrite:
        booleanProperty(
          'Replace the target when it already exists.') },
    [ 'source',
      'target' ]);
}
