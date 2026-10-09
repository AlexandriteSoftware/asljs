# board-plans

Use when: developing a plan, or moving it from Plans to Tasks.

The documents and their ids are in [Board][BD]; the commands in [Commands][CM].

## Develop a plan

A plan is ready for tasks when:

- `## Goal` says what is true when it is done, so that it can be checked;
- `## Steps` is a numbered list of concrete actions, in order, each small enough
  to be one task;
- no open question blocks a step: the answer would not change what the steps
  are.

Until then, answer its open questions under each, `  - Answer: <answer>`, edit
what is wrong, and run `board develop P<n> "<what to change>"`.

## Move it to Tasks

1. Run `board tasks P<n>`. It writes `Tasks/T<n>-<m> <subject>.md`, from 1, in
   the order they are to be carried out.
2. Read every task. Each says what to do, where, and how to know it is done. Fix
   one by editing it, or with `board develop T<n>-<m> "<what to change>"`.
3. A task that needs something only you can give - a password, a payment, a
   decision - says so, so that `board exec` stops there rather than guessing.

`board tasks` refuses a plan that already has tasks. To start over, delete its
`Tasks/T<n>-*` files first, or develop the tasks one by one.

Continue with [board-tasks][BT].

[BD]: ../docs/Board.md
[BT]: board-tasks.md
[CM]: ../docs/Commands.md
