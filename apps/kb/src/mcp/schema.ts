import { booleanProperty,
         objectSchema,
         stringProperty }
  from 'asljs-mdcli';

/**
 * Builders for the JSON Schema a tool declares for its arguments.
 */
export {
  booleanProperty,
  enumProperty,
  numberProperty,
  objectSchema,
  stringArrayProperty,
  stringProperty
} from 'asljs-mdcli';

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
