import { Eventful,
         eventful }
  from 'asljs-eventful';
import { observable }
  from 'asljs-observable';

export interface MachineTransition extends Eventful
{
  from: MachineState;
  to: MachineState;
  machine: Machine;
  activate(): boolean;
}

export interface MachineState extends Eventful
{
  name: string | undefined;
  machine: Machine;
  transitions: MachineTransition[];
  createTransition(to: MachineState): MachineTransition;
}

export interface Machine extends Eventful
{
  state: MachineState;
  states: MachineState[];
  createState(name?: string): MachineState;
  getState(name: string): MachineState | null;
}

type MachineDuringSetup =
  & Omit<Machine, 'state'>
  & { state: MachineState | null; };

type MachineBacking<TBase extends object> =
  & TBase
  & {
    state: MachineState | null;
    states: MachineState[];
    createState(name?: string): MachineState;
    getState(name: string): MachineState | null;
  };

export function machine<TBase extends object = {}>(
  base: TBase = {} as TBase,
  initial: string
): TBase & Machine
{
  const initialMachine: MachineBacking<TBase> =
    {
    ...base,
    state: null,
    states: [],
    createState: (): MachineState =>
    {
      throw new Error('Machine is not initialized yet.');
    },
    getState: (): MachineState | null => null
  };

  const currentMachine =
    observable(initialMachine) as
    & TBase
    & MachineDuringSetup;

  const states: MachineState[] =
    currentMachine.states = [];

  let inTransition = false;

  currentMachine.createState = (name?: string): MachineState =>
  {
    if (
      name !== undefined
      && states.find(
        state => state.name === name) !== undefined
    ) {
      throw new Error(`State "${name}" already exists`);
    }

    const transitions: MachineTransition[] = [];

    const state =
      eventful(
        {
        name,
        machine: currentMachine as TBase & Machine,
        transitions,
        createTransition: (to: MachineState): MachineTransition =>
        {
          if (!states.includes(to)) {
            throw new Error('Target state is not part of this machine');
          }

          const transition =
            eventful(
              {
              from: state,
              to,
              machine: currentMachine as TBase & Machine,
              activate(): boolean
              {
                if (currentMachine.state !== state) {
                  return false;
                }

                if (inTransition) {
                  return false;
                }

                if (to === state) {
                  return false;
                }

                const payload =
                  {
                  from: state,
                  to,
                  machine: currentMachine as TBase & Machine,
                  transition
                };

                inTransition = true;

                try {
                  transition.emit(
                    'activating',
                    payload);

                  state.emit(
                    'leaving',
                    payload);

                  currentMachine.state = to;

                  to.emit(
                    'entered',
                    payload);

                  transition.emit(
                    'completed',
                    payload);

                  currentMachine.emit(
                    'transition',
                    payload);

                  return true;
                } finally {
                  inTransition = false;
                }
              }
            }) as MachineTransition;

          transitions.push(transition);

          return transition;
        }
      }) as MachineState;

    states.push(state);

    return state;
  };

  currentMachine.getState = (name: string): MachineState | null =>
    states.find(
      state => state.name === name)
      ?? null;

  if (!initial) {
    throw new Error('`initial` must be a string.');
  }

  currentMachine.state = currentMachine.createState(initial);

  return currentMachine as TBase & Machine;
}
