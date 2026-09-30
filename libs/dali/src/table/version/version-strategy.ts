export interface VersionStrategy<T extends Record<string, any>>
{
  getVersion(
    record: T
  ): unknown;

  initialise(
    record: T
  ): T;

  verify(
    record: T,
    expectedVersion: unknown
  ): boolean;

  update(
    record: T
  ): T;
}
