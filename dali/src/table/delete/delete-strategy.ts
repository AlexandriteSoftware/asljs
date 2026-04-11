export interface DeleteStrategy<
    T extends Record<string, any>>
{
  isDeleted(
      record: T
    ): boolean;

  delete(
      record: T
    ): T;

  mapIndexQuery?(
      index: string,
      key: IDBValidKey
    ):
      { index: string;
        key: IDBValidKey; }
      | null;
}