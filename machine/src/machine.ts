import { eventful }
  from 'asljs-eventful';
import { observable }
  from 'asljs-observable';
import { Machine,
         MachineDefinition,
         MachineGuard,
         MachineRejectionPayload,
         MachineRejectReason,
         MachineState,
         MachineStateOptions,
         MachineTargetDefinition,
         MachineTransition,
         MachineTransitionOptions,
         MachineTransitionPayload }
  from './types.js';

type MachineBacking = {
  state: MachineState;
  previous: MachineState | null;
};

function defineMethod(
    target: object,
    name: string,
    value: Function
  ): void
{
  Object.defineProperty(
    target,
    name,
    { value,
      enumerable: false,
      configurable: true,
      writable: true });
}

/**
 * Creates a state machine.
 *
 * The result is eventful and observable: `state` and `previous` emit
 * `set:state` and `set:previous`, and the machine emits `transition` and
 * `rejected`.
 *
 * @param initial name of the initial state, or the base object to extend
 * @param definition optional declarative states and transitions
 */
export function machine(
  initial: string,
  definition?: MachineDefinition
): Machine;

export function machine<TBase extends object>(
  base: TBase,
  initial: string,
  definition?: MachineDefinition
): TBase & Machine;

export function machine(
    first: string | object,
    second?: string | MachineDefinition,
    third?: MachineDefinition
  ): any
{
  const hasBase =
    typeof first !== 'string';

  const base =
    hasBase
    ? first
    : {};

  const initial =
    hasBase
    ? second
    : first;

  const definition =
    (hasBase
    ? third
    : second) as MachineDefinition | undefined;

  if (
    typeof initial
    !== 'string'
    || initial === ''
  ) {
    throw new Error(
      '`initial` must be a non-empty state name.');
  }

  if (
    definition !== undefined
    && (typeof definition
        !== 'object'
        || definition === null)
  ) {
    throw new Error(
      '`definition` must be an object of states.');
  }

  const states: MachineState[] = [ ];

  const currentMachine =
    observable(
      { ...base,
        state: null,
        previous: null }) as unknown as MachineBacking & Machine;

  let inTransition = false;

  const findState =
    (
    name: string
  ): MachineState | null =>
    states.find(
      state => state.name === name)
      ?? null;

  const reject =
    (
        transition: MachineTransition | null,
        payload: MachineRejectionPayload
      ): false =>
    {
    if (transition !== null) {
      transition.emit(
        'rejected',
        payload);
    }

    currentMachine.emit(
      'rejected',
      payload);

    return false;
  };

  const createState =
    (
        name?: string,
        options?: MachineStateOptions
      ): MachineState =>
    {
    if (
      name !== undefined
      && findState(name)
         !== null
    ) {
      throw new Error(
        `State "${name}" already exists`);
    }

    const transitions: MachineTransition[] = [ ];

    const state =
      eventful(
        { name,
          final: options?.final === true,
          machine:
            currentMachine as Machine }) as MachineState;

    const getTransition =
      (
      event: string
    ): MachineTransition | null =>
      transitions.find(
        transition => transition.name === event)
        ?? null;

    const createTransition =
      (
          to: MachineState,
          transitionOptions?: MachineTransitionOptions
        ): MachineTransition =>
      {
      if (!states.includes(to)) {
        throw new Error(
          'Target state is not part of this machine');
      }

      const event =
        transitionOptions?.name;

      if (
        event !== undefined
        && getTransition(event)
           !== null
      ) {
        throw new Error(
          `Transition "${event}" already exists on state "${String(name)}"`);
      }

      const guard: MachineGuard | undefined =
        transitionOptions?.when;

      const reentry =
        transitionOptions?.reentry === true;

      const transition =
        eventful(
          { name: event,
            from: state,
            to,
            machine:
              currentMachine as Machine }) as MachineTransition;

      const payload =
        (): MachineTransitionPayload => ({ event,
                                           from: state,
                                           to,
                                           machine:
                                             currentMachine as Machine,
                                           transition });

      const check =
        (): MachineRejectReason | null =>
        {
        if (
          currentMachine.state
          !== state
        ) {
          return 'not-active';
        }

        if (inTransition) {
          return 'in-transition';
        }

        if (state.final) {
          return 'final';
        }

        if (
          to === state
          && !reentry
        ) {
          return 'self-transition';
        }

        if (
          guard !== undefined
          && !guard(
            payload())
        ) {
          return 'guard';
        }

        return null;
      };

      defineMethod(
        transition,
        'can',
        (): boolean => check() === null);

      defineMethod(
        transition,
        'activate',
        (): boolean =>
        {
          const reason =
            check();

          if (reason !== null) {
            return reject(
              transition,
              { reason,
                event,
                from:
                  currentMachine.state,
                to,
                machine:
                  currentMachine as Machine,
                transition });
          }

          const current =
            payload();

          inTransition = true;

          try {
            transition.emit(
              'activating',
              current);

            state.emit(
              'leaving',
              current);

            currentMachine.previous = state;
            currentMachine.state = to;

            to.emit(
              'entered',
              current);

            transition.emit(
              'completed',
              current);

            currentMachine.emit(
              'transition',
              current);

            return true;
          } finally {
            inTransition = false;
          }
        });

      transitions.push(transition);

      return transition;
    };

    defineMethod(
      state,
      'getTransitions',
      (): MachineTransition[] => [ ...transitions ]);

    defineMethod(
      state,
      'getTransition',
      getTransition);

    defineMethod(
      state,
      'createTransition',
      createTransition);

    states.push(state);

    return state;
  };

  const resolveState =
    (
    target: string | MachineState
  ): MachineState | null =>
    typeof target === 'string'
      ? findState(target)
      : states.includes(target)
      ? target
      : null;

  const findTransitionTo =
    (
    target: MachineState
  ): MachineTransition | null =>
    currentMachine.state
      .getTransitions()
      .find(
        transition => transition.to === target)
      ?? null;

  defineMethod(
    currentMachine,
    'getStates',
    (): MachineState[] => [ ...states ]);

  defineMethod(
    currentMachine,
    'getState',
    findState);

  defineMethod(
    currentMachine,
    'createState',
    createState);

  defineMethod(
    currentMachine,
    'can',
    (
        event: string
      ): boolean =>
    {
      const transition =
        currentMachine.state.getTransition(event);

      return transition !== null
        && transition.can();
    });

  defineMethod(
    currentMachine,
    'send',
    (
        event: string
      ): boolean =>
    {
      const transition =
        currentMachine.state.getTransition(event);

      if (transition === null) {
        return reject(
          null,
          { reason: 'unknown-event',
            event,
            from:
              currentMachine.state,
            to: null,
            machine:
              currentMachine as Machine,
            transition: null });
      }

      return transition.activate();
    });

  defineMethod(
    currentMachine,
    'canGo',
    (
        target: string | MachineState
      ): boolean =>
    {
      const state =
        resolveState(target);

      if (state === null) {
        return false;
      }

      const transition =
        findTransitionTo(state);

      return transition !== null
        && transition.can();
    });

  defineMethod(
    currentMachine,
    'go',
    (
        target: string | MachineState
      ): boolean =>
    {
      const state =
        resolveState(target);

      if (state === null) {
        return reject(
          null,
          { reason: 'unknown-state',
            event: undefined,
            from:
              currentMachine.state,
            to: null,
            machine:
              currentMachine as Machine,
            transition: null });
      }

      const transition =
        findTransitionTo(state);

      if (transition === null) {
        return reject(
          null,
          { reason: 'no-transition',
            event: undefined,
            from:
              currentMachine.state,
            to: state,
            machine:
              currentMachine as Machine,
            transition: null });
      }

      return transition.activate();
    });

  currentMachine.state =
    createState(
      initial,
      { final:
          definition?.[initial] === null });

  if (definition !== undefined) {
    applyDefinition(
      currentMachine as Machine,
      definition);
  }

  return currentMachine;
}

function applyDefinition(
    currentMachine: Machine,
    definition: MachineDefinition
  ): void
{
  for (const [name, spec] of Object.entries(definition)) {
    if (
      currentMachine.getState(name)
      === null
    ) {
      currentMachine.createState(
        name,
        { final: spec === null });
    }
  }

  for (const [name, spec] of Object.entries(definition)) {
    if (spec === null) {
      continue;
    }

    const from =
      currentMachine.getState(name);

    if (from === null) {
      throw new Error(
        `State "${name}" is missing`);
    }

    for (const [event, target] of Object.entries(spec)) {
      const options: MachineTargetDefinition =
        typeof target === 'string'
        ? { to: target }
        : target;

      const to =
        currentMachine.getState(options.to);

      if (to === null) {
        throw new Error(
          `Transition "${event}" on state "${name}" targets unknown state "${options.to}"`);
      }

      from.createTransition(
        to,
        { name: event,
          when: options.when,
          reentry: options.reentry });
    }
  }
}
