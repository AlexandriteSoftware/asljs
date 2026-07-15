export * from './table/delete/uuid-soft-delete-strategy.js';
import { DeleteStrategy }
  from './delete-strategy.js';

type IndexQueryMapping = { index: string; key: IDBValidKey; };

type IndexQueryMapper = (
  index: string,
  key: IDBValidKey
) => IndexQueryMapping | null;

export class UuidSoftDeleteStrategy<
  T extends Record<string, any>
> implements DeleteStrategy<T>
{
  constructor(
    private readonly deletedField: keyof T & string,
    private readonly mapActiveIndexQuery?: IndexQueryMapper
  )
  {
  }

  isDeleted(
    record: T
  ): boolean
  {
    const marker =
      record[this.deletedField];

    return typeof marker === 'string'
      && marker.length > 0;
  }

  delete(
    record: T
  ): T
  {
    if (this.isDeleted(record)) {
      return record;
    }

    return {
      ...record,
      [this.deletedField]: crypto.randomUUID()
    };
  }

  mapIndexQuery(
    index: string,
    key: IDBValidKey
  ):
    | { index: string; key: IDBValidKey; }
    | null
  {
    const query =
      this.mapActiveIndexQuery;

    if (query === undefined) {
      return null;
    }

    const result =
      query(
        index,
        key);

    return result
      ?? null;
  }
}
