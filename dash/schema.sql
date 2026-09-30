-- Dash store: append-on-change samples. See docs/concept.md section 5.
CREATE TABLE IF NOT EXISTS samples (
    id    INTEGER PRIMARY KEY,
    key   TEXT    NOT NULL,
    ts    INTEGER NOT NULL, -- when this value first appeared
    seen  INTEGER NOT NULL, -- when this value was last confirmed current
    value TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS samples_key_ts ON samples (key, ts DESC);
