CREATE TABLE IF NOT EXISTS player_snapshots (
  steamid TEXT NOT NULL,
  captured_at INTEGER NOT NULL,
  name TEXT,
  avatar TEXT,
  steam_json TEXT,
  faceit_json TEXT,
  leetify_json TEXT,
  community_json TEXT,
  PRIMARY KEY (steamid, captured_at)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_player_time
  ON player_snapshots (steamid, captured_at DESC);
