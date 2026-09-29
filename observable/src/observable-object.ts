import { EventfulBase }
  from 'asljs-eventful';
import { observable }
  from './observable.js';
import { ObservableEventsObject,
         WatchPath,
         WatchPathValue,
         WatchPathValues }
  from './types.js';

export class ObservableObject<T extends object>
  extends EventfulBase<ObservableEventsObject<T>>
{
  public watch<
    P extends WatchPath<T>
  >(
    path: P,
    callback: (value: WatchPathValue<T, P>) => void
  ): () => boolean;

  public watch<
    P extends readonly WatchPath<T>[] | []
  >(
    paths: P,
    callback: (...values: WatchPathValues<T, P>) => void
  ): () => boolean;

  public watch(
    properties: readonly string[] | string,
    callback: (...values: any[]) => void
  ): () => boolean
  {
    const propertiesList =
      typeof properties === 'string'
      ? [ properties ]
      : properties;

    return observable.watch(
      this as any,
      propertiesList,
      callback as any);
  }

  protected setAndEmit<
    K extends Extract<keyof T, string>
  >(
    property: K,
    previous: T[K],
    value: T[K],
    assign: (value: T[K]) => void
  ): boolean
  {
    if (
      Object.is(
        previous,
        value)
    ) {
      return false;
    }

    assign(value);

    this.emitSet(
      property,
      previous,
      value);

    return true;
  }

  protected emitSet<
    K extends Extract<keyof T, string>
  >(
    property: K,
    previous: T[K],
    value: T[K]
  ): boolean
  {
    const payload =
      { property,
        value,
        previous };

    (this as any).emit(
      `set:${property}`,
      payload);

    (this as any).emit(
      'set',
      payload);

    return true;
  }
}
