import { VersionStrategy }
  from './version-strategy.js';

export class IncrementVersionStrategy<T extends Record<string, any>>
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

    if (
      typeof version === 'number'
      && Number.isFinite(version)
    ) {
      return record;
    }

    return { ...record, [this.field]: 1 };
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
    const version =
      record[this.field];

    if (
      typeof version !== 'number'
      || !Number.isFinite(version)
    ) {
      throw new Error(
        `Version field "${
          String(
            this.field)
        }" does not contain a valid number.`
      );
    }

    return { ...record, [this.field]: version + 1 };
  }
}
