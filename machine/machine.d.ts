import type {
  Eventful
} from 'asljs-eventful';

export interface MachineTransition extends Eventful {
  from: MachineState;
  to: MachineState;
  machine: Machine;
  activate(): boolean;
}

export interface MachineState extends Eventful {
  name: string | undefined;
  machine: Machine;
  transitions: MachineTransition[];
  createTransition(to: MachineState): MachineTransition;
}

export interface Machine extends Eventful {
  state: MachineState;
  states: MachineState[];
  createState(name?: string): MachineState;
  getState(name: string): MachineState | null;
}

export declare function machine<TBase extends object = {}>(
  base: TBase | undefined,
  initial: string
): TBase & Machine;
