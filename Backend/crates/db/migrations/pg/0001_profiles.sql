CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY,
    uid TEXT NOT NULL UNIQUE,
    nickname TEXT NOT NULL,
    level BIGINT NOT NULL DEFAULT 1,
    trophy BIGINT NOT NULL DEFAULT 0,
    bonus_trophy BIGINT NOT NULL DEFAULT 0,
    coins BIGINT NOT NULL DEFAULT 0,
    gems BIGINT NOT NULL DEFAULT 0,
    area TEXT NOT NULL,
    profile_fb BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles (nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles (level);
CREATE INDEX IF NOT EXISTS idx_profiles_trophy ON profiles (trophy);
