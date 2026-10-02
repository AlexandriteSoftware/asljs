# request-analysis

Use when: acting on any request that changes code, documentation or
configuration, before making the change.

A request carries more than an instruction. Before acting, decompose it into:

- **Stated facts** - claims about the repository, code, types, data shapes, or
  current behavior.
- **Assumptions and predictions** - what the user expects to be true, or expects
  to happen as a result of the change.
- **Intended effect** - the outcome the user actually wants, which is often
  broader than the proposed change.

Verify each part against the repository before implementing:

- Verify every stated fact against actual code, documentation, and type
  definitions. A fact is not true because the request states it.
- Verify the proposed change is permitted by [CONVENTIONS.md][CNV], the module
  `docs`, and the existing architecture.
- Verify the proposed change actually produces the intended effect, and that the
  effect is significant rather than negligible.
- Verify no simpler or more consistent way to reach the intended effect already
  exists in the repository.

Report the result of the verification, and act on it:

- If a stated fact is wrong, say so, give the real state with the file path, and
  do not build on the wrong fact.
- If the fact is wrong and the request depends on it, stop and ask instead of
  implementing a change with no valid basis.
- If the reasoning is wrong but the goal is valid, implement what reaches the
  goal and explain why the proposed approach would not.
- If the change conflicts with documentation or conventions, follow
  **Documentation governance** in [AGENTS.md][AMD]: do not proceed silently.
- If the predicted effect cannot be confirmed without measurement, say so
  explicitly rather than claiming an improvement.

Example. Request: _"the user record has a `group` field, so adding an index on
orders will make the lookup faster"_. Three separate checks:

1. Fact: does a `group` field exist on that record, with that name and type?
2. Design: is an added index consistent with the design rules in the module
   `docs`?
3. Effect: is the lookup actually index-bound, and does the index cover the
   query the code issues?

If any check fails, report it with the real state instead of implementing the
request as stated.

[AMD]: <../AGENTS.md>
[CNV]: <../CONVENTIONS.md>
