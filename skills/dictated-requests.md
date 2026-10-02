# dictated-requests

Use when: a request shows signs of voice input. Apply this before
[request-analysis][SKR], which then runs on the corrected request rather than on
the raw transcript.

Some requests arrive through voice input. Treat them as lower-fidelity input
rather than as literal text.

Signals that a request was dictated:

- run-on sentences, missing punctuation, or spoken filler
- self-correction inside the sentence ("use the map, no, the set")
- no code formatting around identifiers, paths, or commands
- technical terms replaced by similar-sounding everyday words, for example
  _pear_ for `PR`, _get_ for `git`, or _diff print_ for `dprint`
- identifiers, module names, or file names spelled phonetically

When dictation is suspected:

- Reconstruct the intended request: correct recognition errors, restore
  structure, and drop filler.
- Resolve ambiguous words against repository vocabulary. A word that matches a
  real module, file, symbol, or command is more likely correct than an unrelated
  common word.
- Keep the reconstruction minimal. Correct what is likely misrecognized; do not
  extend, narrow, or reinterpret the request.
- Restate the corrected request and obtain approval before acting on it.
- If a term cannot be resolved with confidence, ask instead of silently choosing
  one reading.

[SKR]: request-analysis.md
