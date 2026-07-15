export class VersionConflictError extends Error
{
  constructor(
    public readonly key: IDBValidKey,
    public readonly expectedVersion: unknown,
    public readonly actualVersion: unknown
  )
  {
    super(
      `Version conflict for key ${String(key)}.`
    );

    this.name = 'VersionConflictError';
  }
}
