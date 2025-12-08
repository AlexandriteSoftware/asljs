import { eventful } from 'asljs-eventful';
import { observable } from 'asljs-observable';

export function machine(base = { }, initial) {
  const machine =
    observable(
      { ...base,
        state: null });

  const states = machine.states = [];
  let inTransition = false;

  machine.createState = (name) => {
    if (name && states.find(s => s.name === name))
      throw new Error(`State "${name}" already exists`);

    const transitions = [];

    const state =
      eventful({
        name,
        machine,
        transitions,
        createTransition: to => {
          if (!states.includes(to))
            throw new Error(`Target state is not part of this machine`);

          const transition =
            eventful({
              from: state,
              to,
              machine,
              activate: function () {
                if (machine.state !== state)
                  return false;
                if (inTransition)
                  return false;
                if (to === state)
                  return false;

                const payload =
                  { from: state,
                    to,
                    machine,
                    transition };

                inTransition = true;

                try {
                  transition.emit('activating', payload);
                  state.emit('leaving', payload);

                  machine.state = to;

                  to.emit('entered', payload);
                  transition.emit('completed', payload);
                  machine.emit('transition', payload);
                  return true;
                } finally {
                  inTransition = false;
                }
              }
            });

          transitions.push(transition);

          return transition;
        }
      });

    states.push(state);

    return state;
  };

  machine.getState =
    name =>
      states.find(s => s.name === name)
      || null;

  if (!initial)
    throw new Error('`initial` must be a string.');

  machine.state =
    machine.createState(initial);

  return machine;
}
