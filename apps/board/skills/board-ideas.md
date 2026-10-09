# board-ideas

Use when: writing an idea, developing it, or moving it from Ideas to Plans.

The documents and their ids are in [Board][BD]; the commands in [Commands][CM].

## Write an idea

1. Take the next free number: one above the highest `I<n>` in `Ideas/` and
   `Archive/`.
2. Create `Ideas/I<n> <subject>.md`, starting with `# I<n> <subject>`. The
   subject says what is wanted, as a short imperative: `Track how fresh articles
   are`.
3. Write what is wanted and why, what is known - with links and dates - and what
   is not settled, under `## Open questions`, one `- <question>` each.

## Develop it

Run `board develop I<n> "<what you want from it>"`. Then read the idea:

- if it has open questions, answer each under it, `  - Answer: <answer>`, and
  run `board develop I<n>` again; repeat until nothing important is open;
- if the text is wrong, edit it directly, then develop again.

An idea is ready to plan when it says what is wanted, why, and what is known,
and its open questions are ones the plan can carry.

## Move it to Plans

1. Run `board plan I<n>`, with guidance when the plan should aim at something:
   `board plan I<n> "a pilot on one folder first"`.
2. Read `Plans/P<n> <subject>.md`. Check that its steps are concrete actions,
   each of which can become a task, in a workable order.
3. Develop the plan as above, `board develop P<n>`, until its open questions are
   answered and its steps are right. Continue with [board-plans][BP].

An idea that turns out not worth doing goes to the archive as it is: `board
archive I<n>`.

[BD]: ../docs/Board.md
[BP]: board-plans.md
[CM]: ../docs/Commands.md
