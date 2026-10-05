# RQ004 TmpGlobals replaces and restores global properties

`TmpGlobals` defines a set of properties on `globalThis` and restores each one
it touched when restored or disposed:

- a property is restored with the descriptor it had, so a getter stays a
  getter;
- a property that did not exist before is removed again;
- restoring a second time does nothing and returns `false`.
