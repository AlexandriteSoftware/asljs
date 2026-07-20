export function dbRequestAsync<T>(
    request: IDBRequest<T>
  ): Promise<T>
{
  return new Promise(
    (
      resolve,
      reject
    ) =>
    {
      request.addEventListener(
        'success',
        () =>
        {
          resolve(
            request.result);
        });

      request.addEventListener(
        'error',
        () =>
        {
          reject(
            request.error
              ?? new Error(
                'IndexedDB request failed'
              ));
        });
    }
  );
}

export function dbOpen(
    name: string,
    upgrades: ((db: IDBDatabase) => void)[]
  ): Promise<IDBDatabase>
{
  return new Promise<IDBDatabase>(
    (
      resolve,
      reject
    ) =>
    {
      const request =
        indexedDB.open(
          name,
          upgrades.length);

      request.addEventListener(
        'upgradeneeded',
        e =>
        {
          const updates =
            upgrades.slice(
              e.oldVersion,
              e.newVersion
              ?? upgrades.length);

          for (const update of updates) {
            update(
              request.result);
          }
        });

      request.addEventListener(
        'success',
        () =>
        {
          resolve(
            request.result);
        });

      request.addEventListener(
        'blocked',
        () =>
        {
          reject(
            new Error(
              'Database opening is blocked'
            ));
        });

      request.addEventListener(
        'error',
        () =>
        {
          reject(
            request.error
              ?? new Error(
                'Failed to open database'
              ));
        });
    }
  );
}

export function dbDelete(
    name: string
  ): Promise<void>
{
  return new Promise(
    (
      resolve,
      reject
    ) =>
    {
      const request =
        indexedDB.deleteDatabase(name);

      request.addEventListener(
        'success',
        () =>
        {
          resolve();
        });

      request.addEventListener(
        'blocked',
        () =>
        {
          reject(
            new Error(
              'Database deletion is blocked'
            ));
        });

      request.addEventListener(
        'error',
        () =>
        {
          reject(
            request.error
              ?? new Error(
                'Failed to delete database'
              ));
        });
    }
  );
}
