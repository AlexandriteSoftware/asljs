import { EventfulBase }
  from 'asljs-eventful';
import { batch,
         Change,
         reportChange }
  from './contract.js';
import { ObservableEvents }
  from './types.js';

/**
 * A base class for a hand-written participant.
 *
 * It emits `change` like every other producer in this package, and its
 * emissions join an open `batch(fn)`, so a setter that changes two properties
 * inside one batch produces one notification.
 *
 * Query it with `observe(instance).at(...)`: the class carries no query of its
 * own, because a query is a description over a source rather than a method on
 * it.
 */
export class ObservableObject<T extends object>
  extends EventfulBase<ObservableEvents>
{
  /**
   * Assigns and reports, unless the value is already there.
   *
   * The comparison is `Object.is`, the same one the converter's `set` trap
   * makes, so one rule holds from the source to the terminal.
   */
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

  /** Reports one property change. */
  protected emitSet<
    K extends Extract<keyof T, string>
  >(
    property: K,
    previous: T[K],
    value: T[K]
  ): boolean
  {
    return this.emitChange(
      [ { kind: 'set',
          property,
          value,
          previous } ]);
  }

  /**
   * Reports a list of changes as one notification.
   *
   * Wrapped in a batch, so the list arrives as one `change` and joins an outer
   * batch when there is one.
   */
  protected emitChange(
    changes: readonly Change[]
  ): boolean
  {
    batch(
      (): void =>
      {
        for (const change of changes) {
          reportChange(
            this as any,
            change);
        }
      });

    return true;
  }
}
