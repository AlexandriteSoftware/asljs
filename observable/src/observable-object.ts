import { EventfulBase }
  from 'asljs-eventful';
import { observable }
  from './observable.js';
import { ObservableEventsObject,
         WatchedValues }
  from './types.js';

export class ObservableObject<T extends object>
  extends EventfulBase<ObservableEventsObject<T>>
{
  public watch<
    K extends Extract<keyof T, string>
  >(
    property: K,
    callback: (value: T[K]) => void
  ): () => boolean;

  public watch<
    K extends readonly (Extract<keyof T, string>)[]
  >(
    properties: K,
    callback: (...values: WatchedValues<T, K>) => void
  ): () => boolean;

  public watch(
    properties: readonly string[],
    callback: (...values: any[]) => void
  ): () => boolean;

  public watch(
    property: string,
    callback: (value: any) => void
  ): () => boolean;

  public watch(
    properties: readonly string[] | string,
    callback: (...values: any[]) => void
  ): () => boolean
  {
    const propertiesList =
      typeof properties === 'string'
      ? [properties]
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
      { property, value, previous };

    (this as any).emit(
      `set:${property}`,
      payload);

    (this as any).emit(
      'set',
      payload);

    return true;
  }
}
