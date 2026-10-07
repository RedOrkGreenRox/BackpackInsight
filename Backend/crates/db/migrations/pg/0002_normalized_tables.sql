-- Normalized 4-table schema (PostgreSQL): profiles + itemdefinition + hero + item.
-- Idempotent; safe to re-run. Drops legacy profile_fb BYTEA blob column.

CREATE TABLE IF NOT EXISTS itemdefinition (
    id BIGSERIAL PRIMARY KEY,
    item_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_ru TEXT NOT NULL DEFAULT '',
    rarity TEXT NOT NULL DEFAULT '',
    coin_value BIGINT,
    connected_hero TEXT,
    unlock_source TEXT,
    purchasable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hero (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level BIGINT NOT NULL DEFAULT 1,
    experience BIGINT NOT NULL DEFAULT 0,
    rating BIGINT NOT NULL DEFAULT 0,
    prestige BOOLEAN NOT NULL DEFAULT FALSE,
    league TEXT NOT NULL DEFAULT '',
    exp_req BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES itemdefinition (item_id) ON DELETE CASCADE,
    level BIGINT NOT NULL DEFAULT 1,
    cards BIGINT NOT NULL DEFAULT 0,
    cards_need BIGINT NOT NULL DEFAULT -1,
    total_xp BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_profile_id ON hero (profile_id);
CREATE INDEX IF NOT EXISTS idx_hero_name ON hero (name);
CREATE INDEX IF NOT EXISTS idx_item_profile_id ON item (profile_id);
CREATE INDEX IF NOT EXISTS idx_item_item_id ON item (item_id);
CREATE INDEX IF NOT EXISTS idx_itemdefinition_rarity ON itemdefinition (rarity);
CREATE INDEX IF NOT EXISTS idx_itemdefinition_connected_hero ON itemdefinition (connected_hero);

ALTER TABLE profiles DROP COLUMN IF EXISTS profile_fb;
