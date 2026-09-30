import { Eventful }
  from 'asljs-eventful';
import { ObservableEventsObject }
  from 'asljs-observable';

/**
 * Why a `send`, `go`, or `activate` call left the active state unchanged.
 *
 * - `unknown-event`: the active state has no transition with that event name.
 * - `unknown-state`: no state with that name belongs to this machine.
 * - `no-transition`: the target state exists, but the active state has no
 *   transition to it.
 * - `not-active`: the transition's source state is not the active state.
 * - `in-transition`: another transition is already running.
 * - `final`: the source state is final and cannot be left.
 * - `self-transition`: source and target are the same state and the transition
 *   was not created with `reentry`.
 * - `guard`: the transition's `when` guard returned false.
 */
export type MachineRejectReason =
  | 'unknown-event'
  | 'unknown-state'
  | 'no-transition'
  | 'not-active'
  | 'in-transition'
  | 'final'
  | 'self-transition'
  | 'guard';

/** Payload of every event emitted while a transition runs. */
export interface MachineTransitionPayload
{
  /** Event name the transition answers to, or undefined when unnamed. */
  event: string | undefined;
  from: MachineState;
  to: MachineState;
  machine: Machine;
  transition: MachineTransition;
}

/** Payload of the `rejected` event. */
export interface MachineRejectionPayload
{
  reason: MachineRejectReason;
  /** Event name that was sent, or undefined for `go` and `activate`. */
  event: string | undefined;
  /** The active state at the time of the call. */
  from: MachineState;
  /** Intended target, or null when it could not be resolved. */
  to: MachineState | null;
  machine: Machine;
  /** The transition that refused, or null when none was found. */
  transition: MachineTransition | null;
}

/**
 * Decides whether a transition may run. Called by `activate`, and by `can` and
 * `canGo` without any state change, so keep it side-effect free and cheap.
 */
export type MachineGuard =
  (
    payload: MachineTransitionPayload
  ) =>
    boolean;

export type MachineTransitionEvents = {
  activating: [MachineTransitionPayload];
  completed: [MachineTransitionPayload];
  rejected: [MachineRejectionPayload];
};

export type MachineStateEvents = {
  entered: [MachineTransitionPayload];
  leaving: [MachineTransitionPayload];
};

/** The observable properties of a machine. */
export type MachineData = {
  state: MachineState;
  previous: MachineState | null;
};

export type MachineEvents =
  & {
    transition: [MachineTransitionPayload];
    rejected: [MachineRejectionPayload];
  }
  & ObservableEventsObject<MachineData>;

export interface MachineStateOptions
{
  /**
   * A final state cannot be left: every transition out of it is rejected with
   * reason `final`.
   */
  final?: boolean;
}

export interface MachineTransitionOptions
{
  /** Event name that fires this transition through `machine.send(event)`. */
  name?: string;

  /** Guard. Rejects the transition with reason `guard` when it returns false. */
  when?: MachineGuard;

  /** Allows the transition when source and target are the same state. */
  reentry?: boolean;
}

export interface MachineTransition extends Eventful<MachineTransitionEvents>
{
  /** Event name that fires this transition, or undefined when unnamed. */
  readonly name: string | undefined;
  readonly from: MachineState;
  readonly to: MachineState;
  readonly machine: Machine;

  /** True when `activate` would currently succeed. Runs the guard. */
  can(): boolean;

  /**
   * Runs the transition. Returns false and emits `rejected` when any check
   * fails.
   */
  activate(): boolean;
}

export interface MachineState extends Eventful<MachineStateEvents>
{
  readonly name: string | undefined;
  readonly final: boolean;
  readonly machine: Machine;

  /** A copy of this state's outgoing transitions, in creation order. */
  getTransitions(): MachineTransition[];

  /** The outgoing transition with that event name, or null. */
  getTransition(event: string): MachineTransition | null;

  createTransition(
    to: MachineState,
    options?: MachineTransitionOptions
  ): MachineTransition;
}

export interface Machine extends Eventful<MachineEvents>
{
  /** The active state. Change it with `send` or `go`, never by assignment. */
  readonly state: MachineState;

  /** The state left by the last successful transition, or null. */
  readonly previous: MachineState | null;

  /** A copy of the registered states, in creation order. */
  getStates(): MachineState[];

  getState(name: string): MachineState | null;

  createState(name?: string, options?: MachineStateOptions): MachineState;

  /** True when `send(event)` would currently succeed. Runs the guard. */
  can(event: string): boolean;

  /** Fires the active state's transition with that event name. */
  send(event: string): boolean;

  /** True when `go(target)` would currently succeed. Runs the guard. */
  canGo(target: string | MachineState): boolean;

  /**
   * Fires the active state's transition that targets `target`. Only declared
   * transitions are used, so this cannot jump outside the graph.
   */
  go(target: string | MachineState): boolean;

  watch(
    property: 'state' | 'previous',
    callback: (value: MachineState | null) => void
  ): () => boolean;

  watch(
    property: string,
    callback: (value: any) => void
  ): () => boolean;
}

/**
 * Declarative machine shape: state name to a map of event name to either a
 * target state name or a transition spec. `null` in place of the map declares
 * a final state.
 */
export type MachineDefinition = Record<string, MachineStateDefinition | null>;

export type MachineStateDefinition = Record<
  string,
  string | MachineTargetDefinition
>;

export interface MachineTargetDefinition
{
  to: string;
  when?: MachineGuard;
  reentry?: boolean;
}
