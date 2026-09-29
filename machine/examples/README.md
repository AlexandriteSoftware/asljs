# Examples

## Document agent

`document-agent.ts` is a folder-monitoring document agent. Its whole control
flow is one machine:

```
idle --scan--> scanning --found--> classifying --<kind>--> <kind>
scanning --empty--> idle
<kind> --step--> <kind>            (reentry, guarded by pending steps)
<kind> --done--> completed         (guarded by no pending steps)
<kind> --fail--> failed
classifying --unrecognised--> discarded
completed | failed | discarded --reset--> idle
idle --shutdown--> stopped         (final)
```

Run it against a throwaway folder:

```
npm -w asljs-machine run example
```

### What each part demonstrates

- **A generated definition.** Every key of `pipelines` becomes a state, so
  routing a document is `machine.go(kind)` and adding a pipeline is a
  configuration change. The definition is the routing table.
- **Guards that carry weight.** `step` is guarded by "a step is pending" and
  `done` by "no step is pending", so the step loop cannot outrun the machine and
  a half-run pipeline cannot report success.
- **Reentry.** Each pipeline step is a transition from the pipeline state to
  itself, which needs `reentry: true`.
- **`can` instead of flags.** `tick` starts with `machine.can('scan')`, which
  answers "is the agent idle" and "has the agent shut down" in one call. A timer
  tick that arrives mid-pipeline is refused by the machine rather than by an ad
  hoc boolean.
- **Rejection as diagnostics.** The agent logs every `rejected` event with its
  reason, so a refused event is visible instead of a silent `false`.
- **A final state.** `shutdown` reaches `stopped`, and nothing leaves it.
- **Synchronous transitions with asynchronous work.** Step work happens between
  `send` calls: the agent sends `step`, awaits the step, then continues. So
  `machine.state` always says what the agent is doing right now.

`document-agent.test.ts` drives the agent over temporary folders and covers the
pipeline, the routing, the discard and failure paths, the mid-pipeline refusal,
and shutdown.
