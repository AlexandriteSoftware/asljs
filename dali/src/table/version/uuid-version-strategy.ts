import { VersionStrategy }
  from './version-strategy.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UuidVersionStrategy<T extends Record<string, any>>
  implements VersionStrategy<T>
{
  constructor(
      private readonly field: string & keyof T
    )
  {}

  getVersion(
      record: T
    ): unknown
  {
    return record[this.field];
  }

  initialise(
      record: T
    ): T
  {
    const version =
      record[this.field];

    if (typeof version === 'string'
        && UUID_PATTERN.test(version))
    {
      return record;
    }

    return { ...record, [this.field]: crypto.randomUUID() };
  }

  verify(
      record: T,
      expectedVersion: unknown
    ): boolean
  {
    return record[this.field] === expectedVersion;
  }

  update(
      record: T
    ): T
  {
    return { ...record, [this.field]: crypto.randomUUID() };
  }
}
