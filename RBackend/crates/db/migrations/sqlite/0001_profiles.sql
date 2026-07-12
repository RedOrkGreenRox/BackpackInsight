-- SQLite variant of the profiles table (semantically identical to the Postgres 0001).
-- Type mapping: BIGSERIAL → INTEGER PRIMARY KEY AUTOINCREMENT,
--               BIGINT → INTEGER, TEXT → TEXT, TIMESTAMPTZ → TEXT, NOW() → CURRENT_TIMESTAMP.
-- profile_fb is dropped in 0002 (SQLite stores blobs as BLOB but we no longer need it).

CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT NOT NULL UNIQUE,
    nickname TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    trophy INTEGER NOT NULL DEFAULT 0,
    bonus_trophy INTEGER NOT NULL DEFAULT 0,
    coins INTEGER NOT NULL DEFAULT 0,
    gems INTEGER NOT NULL DEFAULT 0,
    area TEXT NOT NULL,
    profile_fb BLOB NOT NULL DEFAULT x'',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles (nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles (level);
CREATE INDEX IF NOT EXISTS idx_profiles_trophy ON profiles (trophy);
