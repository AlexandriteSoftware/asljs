import { afterCurrentDelivery,
         asObservable,
         Change,
         ChangeListener,
         currentDelivery,
         inDelivery,
         isObservable,
         Observable }
  from './contract.js';
import { functionTypeGuard,
         isFunction,
         isObject }
  from './guards.js';
import { ObservablePath,
         ObservablePathValue }
  from './types.js';

/**
 * A query over a source, as an immutable description.
 *
 * `observe(source)` starts one, each operator returns a **new** chain carrying
 * the source and the operators so far, and nothing is subscribed until a
 * terminal executes it. Holding a chain, passing it around and branching off it
 * are all free.
 *
 * A chain is deliberately not closed under the contract: it has `subscribe` and
 * `.value` and no `on`/`off` at all. That is what makes disposal answer itself
 * -- one `subscribe` builds one subscription tree and returns the one disposer
 * that owns it -- at the cost of fan-out duplicating work, which is noise at
 * the scale this package targets.
 *
 * Every operator compares its result with the last value it emitted, using
 * `Object.is`, and stays silent when they match. A projection that rebuilds a
 * value is therefore never deduplicated; `distinct` is the way out.
 */
export interface Chain<T>
{
  /**
   * Descends a dotted path.
   *
   * Executed, it subscribes to `change` on the source and reacts when an entry
   * names the first segment, then subscribes on that value and reacts when an
   * entry names the second, and so on. When an intermediate value is replaced,
   * the downstream subscriptions are rebuilt.
   */
  at<P extends ObservablePath<T> & string>(
    path: P
  ): Chain<ObservablePathValue<T, P>>;

  /** Projects the value. */
  map<R>(
    project: (value: T) => R
  ): Chain<R>;

  /** Keeps only the values the predicate accepts. */
  filter(
    predicate: (value: T) => boolean
  ): Chain<T>;

  /**
   * Replaces the default `Object.is` comparison for one step, for a projection
   * that rebuilds a value rather than returning one.
   */
  distinct(
    compare: (a: T, b: T) => boolean
  ): Chain<T>;

  /**
   * Executes the chain: builds the subscriptions, calls back with the current
   * value, and returns one disposer that tears them down.
   *
   * The first callback always happens, except where `filter` rejects the
   * current value.
   */
  subscribe(
    listener: (value: T) => void
  ): () => boolean;

  /**
   * Evaluates the chain on demand, without subscribing.
   *
   * `undefined` where the path does not resolve or a `filter` rejects the
   * value.
   */
  readonly value: T | undefined;
}

export type ChainValue<C> = C extends Chain<infer V> ? V
  : never;

export type ChainValues<C extends readonly unknown[]> = {
  [I in keyof C]: ChainValue<C[I]>;
};

const NOTHING =
  Symbol(
    'observable.query.nothing');

type Step =
  | { kind: 'at'; segments: readonly string[]; }
  | { kind: 'map'; project: (value: any) => any; }
  | { kind: 'filter'; predicate: (value: any) => boolean; }
  | { kind: 'distinct'; compare: (a: any, b: any) => boolean; };

type Root =
  | { kind: 'source'; source: Observable; }
  | { kind: 'combine'; chains: readonly object[]; };

type Node = {
  root: Root;
  steps: readonly Step[];
};

/**
 * The description behind each chain object.
 *
 * Held outside the object so that a chain exposes operators and nothing else.
 */
const nodes =
  new WeakMap<object, Node>();

function splitPath(
    path: string
  ): string[]
{
  if (
    typeof path
    !== 'string'
  ) {
    throw new TypeError(
      'Expect a path to be a non-empty string.');
  }

  if (path.trim() === '') {
    throw new TypeError(
      'Expect a path to be a non-empty string.');
  }

  const segments =
    path.split('.');

  for (const segment of segments) {
    if (segment.trim() === '') {
      throw new TypeError(
        'Expect path segments to be non-empty.');
    }
  }

  return segments.map(
    segment => segment.trim());
}

function readPath(
    source: unknown,
    segments: readonly string[]
  ): unknown
{
  let current = source;

  for (const segment of segments) {
    if (
      !isObject(current)
      && !isFunction(current)
    ) {
      return undefined;
    }

    if (!(segment in (current as object))) {
      return undefined;
    }

    current =
      (current as Record<string, unknown>)[segment];
  }

  return current;
}

/**
 * Whether an entry list reports a change to one property.
 *
 * A `splice` entry carries no `property`, and counts as a change to every index
 * from `splice.index` onwards and to `length`. Nothing else would report the
 * length change, because a producer emitting a splice emits no `set` for it.
 *
 * An entry kind this version does not understand means "something changed,
 * re-read", which deduplication then absorbs when the re-read yields the same
 * value.
 */
function changesProperty(
    changes: readonly Change[],
    property: string
  ): boolean
{
  for (const change of changes) {
    switch (change.kind) {
      case 'set':
        if (change.property === property) {
          return true;
        }

        break;

      case 'splice': {
        if (property === 'length') {
          return true;
        }

        const index =
          Number(property);

        if (
          Number.isInteger(index)
          && index >= change.index
        ) {
          return true;
        }

        break;
      }

      default:
        return true;
    }
  }

  return false;
}

type Emit =
  (
    value: unknown
  ) =>
    void;

type Stage = {
  accept: Emit;
  dispose: () => void;
};

function makeAtStage(
    segments: readonly string[],
    next: Emit
  ): Stage
{
  let input: unknown = undefined;

  let bindings: Array<() => void> = [ ];

  let last: unknown = NOTHING;

  const unbind =
    (): void =>
    {
    const current = bindings;

    bindings = [ ];

    for (const off of current) {
      off();
    }
  };

  const push =
    (): void =>
    {
    const value =
      readPath(
        input,
        segments);

    if (
      last !== NOTHING
      && Object.is(
        last,
        value)
    ) {
      return;
    }

    last = value;

    next(value);
  };

  const bind =
    (): void =>
    {
    let current: unknown = input;

    for (
      let index = 0;
      index < segments.length;
      index++
    ) {
      if (
        !isObject(current)
        && !isFunction(current)
      ) {
        return;
      }

      const segment = segments[index];

      const source =
        asObservable(current);

      if (source) {
        const listener: ChangeListener =
          (
              changes
            ) =>
          {
          if (
            !changesProperty(
              changes,
              segment)
          ) {
            return;
          }

          unbind();
          bind();
          push();
        };

        const disposer =
          source.on(
            'change',
            listener);

        // `off` is the canonical teardown path, so an emitter that returns
        // `this` from `on` -- a Node `EventEmitter` does -- still works. A
        // function the source offers is used as a fast path.
        bindings.push(
          isFunction(disposer)
            ? () =>
            {
              (disposer as () => unknown)();
            }
            : () =>
            {
              source.off(
                'change',
                listener);
            });
      }

      current =
        (current as Record<string, unknown>)[segment];
    }
  };

  return { accept(
      value: unknown
    ): void
    {
      unbind();

      input = value;

      bind();
      push();
    },
           dispose: unbind };
}

function makeStage(
    step: Step,
    next: Emit
  ): Stage
{
  if (step.kind === 'at') {
    return makeAtStage(
      step.segments,
      next);
  }

  let last: unknown = NOTHING;

  if (step.kind === 'map') {
    return { accept(
        value: unknown
      ): void
      {
        const projected =
          step.project(value);

        if (
          last !== NOTHING
          && Object.is(
            last,
            projected)
        ) {
          return;
        }

        last = projected;

        next(projected);
      },
             dispose: () => { } };
  }

  if (step.kind === 'filter') {
    return { accept(
        value: unknown
      ): void
      {
        if (!step.predicate(value)) {
          return;
        }

        if (
          last !== NOTHING
          && Object.is(
            last,
            value)
        ) {
          return;
        }

        last = value;

        next(value);
      },
             dispose: () => { } };
  }

  return { accept(
      value: unknown
    ): void
    {
      if (
        last !== NOTHING
        && step.compare(
          last,
          value)
      ) {
        return;
      }

      last = value;

      next(value);
    },
           dispose: () => { } };
}

function nodeOf(
    chain: object
  ): Node
{
  const node =
    nodes.get(chain);

  if (!node) {
    throw new TypeError(
      'Expect a query built by observe(...).');
  }

  return node;
}

function evaluate(
    chain: object
  ): unknown
{
  const { root, steps } =
    nodeOf(chain);

  let value: unknown =
    root.kind === 'source'
    ? root.source
    : root.chains.map(
      input => evaluate(input));

  for (const step of steps) {
    switch (step.kind) {
      case 'at':
        value =
          readPath(
            value,
            step.segments);

        break;

      case 'map':
        value =
          step.project(value);

        break;

      case 'filter':
        if (!step.predicate(value)) {
          return undefined;
        }

        break;

      default:
        // `distinct` compares against the last emitted value, of which a
        // one-shot read has none.
        break;
    }
  }

  return value;
}

function execute(
    chain: object,
    sink: Emit
  ): () => boolean
{
  const { root, steps } =
    nodeOf(chain);

  const disposers: Array<() => void> = [ ];

  let entry: Emit = sink;

  for (
    let index = steps.length - 1;
    index >= 0;
    index--
  ) {
    const stage =
      makeStage(
        steps[index],
        entry);

    disposers.push(stage.dispose);

    entry = stage.accept;
  }

  if (root.kind === 'source') {
    entry(root.source);
  } else {
    const inputs = root.chains;

    const values: unknown[] =
      new Array(inputs.length).fill(undefined);

    let initialising = true;

    let lastDelivery = -1;

    const recompute =
      (): void =>
      entry(
        [ ...values ]);

    for (
      let index = 0;
      index < inputs.length;
      index++
    ) {
      const position = index;

      const unsubscribe =
        execute(
          inputs[position],
          (
              value
            ) =>
          {
          values[position] = value;

          if (initialising) {
            return;
          }

          if (!inDelivery()) {
            recompute();

            return;
          }

          // Two inputs reading from one source are both notified by one
          // `change`, so the recompute waits for the end of the delivery and
          // happens once. Without it a subscriber would see the intermediate
          // tuple before the settled one.
          const delivery =
            currentDelivery();

          if (delivery === lastDelivery) {
            return;
          }

          lastDelivery = delivery;

          afterCurrentDelivery(recompute);
        });

      disposers.push(
        () =>
        {
          unsubscribe();
        });
    }

    initialising = false;

    recompute();
  }

  let active = true;

  return (): boolean =>
  {
    if (!active) {
      return false;
    }

    active = false;

    for (const dispose of disposers) {
      dispose();
    }

    return true;
  };
}

function makeChain<T>(
    root: Root,
    steps: readonly Step[]
  ): Chain<T>
{
  const chain =
    { at(
      path: string
    ): any
    {
      return makeChain(
        root,
        [ ...steps,
          { kind: 'at',
            segments:
              splitPath(path) } ]);
    },
      map(
      project: (value: any) => any
    ): any
    {
      functionTypeGuard(project);

      return makeChain(
        root,
        [ ...steps,
          { kind: 'map',
            project } ]);
    },
      filter(
      predicate: (value: any) => boolean
    ): any
    {
      functionTypeGuard(predicate);

      return makeChain(
        root,
        [ ...steps,
          { kind: 'filter',
            predicate } ]);
    },
      distinct(
      compare: (a: any, b: any) => boolean
    ): any
    {
      functionTypeGuard(compare);

      return makeChain(
        root,
        [ ...steps,
          { kind: 'distinct',
            compare } ]);
    },
      subscribe(
      listener: (value: any) => void
    ): () => boolean
    {
      functionTypeGuard(listener);

      return execute(
        chain,
        listener);
    },
      get value(): any {
      return evaluate(chain);
    } };

  nodes.set(
    chain,
    { root,
      steps });

  return chain as unknown as Chain<T>;
}

/**
 * Starts a query over a source that conforms to the contract.
 *
 * Throws when the source does not conform, and declares `Observable`, so
 * TypeScript rejects a plain object before the runtime does. A plain root used
 * to call back once with a snapshot and fall silent, which turned the commonest
 * mistake -- forgetting `observable()` -- into nothing at all.
 *
 * Intermediate segments stay permissive: the last segment of a path is always
 * non-conforming, and `shallow: true` produces partial observation on purpose.
 */
export function observe<T extends Observable>(
    source: T
  ): Chain<T>
{
  if (!isObservable(source)) {
    throw new TypeError(
      'Expect a source that conforms to the observable contract, with '
        + "on('change', listener) and off('change', listener). Wrap the value "
        + 'with observable() first.');
  }

  return makeChain<T>(
    { kind: 'source',
      source },
    [ ]
  );
}

/**
 * Reports several chains together, as a tuple.
 *
 * Never deduplicated: it builds a fresh tuple and `Object.is` compares
 * identity. `distinct` with a structural comparison is the way out.
 */
export function combine<C extends readonly Chain<any>[]>(
    chains: C
  ): Chain<ChainValues<C>>
{
  if (!Array.isArray(chains)) {
    throw new TypeError(
      'Expect an array of queries.');
  }

  const inputs =
    chains.map(
      (
          chain
        ) =>
      {
      if (
        !isObject(chain)
        || !nodes.has(
          chain as object)
      ) {
        throw new TypeError(
          'Expect an array of queries built by observe(...).');
      }

      return chain as unknown as object;
    });

  return makeChain<ChainValues<C>>(
    { kind: 'combine',
      chains: inputs },
    [ ]
  );
}
