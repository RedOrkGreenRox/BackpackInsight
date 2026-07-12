-- Normalized 4-table schema (SQLite): profiles + itemdefinition + hero + item.
-- Idempotent; safe to re-run. Drops legacy profile_fb BLOB column.

CREATE TABLE IF NOT EXISTS itemdefinition (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_ru TEXT NOT NULL DEFAULT '',
    rarity TEXT NOT NULL DEFAULT '',
    coin_value INTEGER,
    connected_hero TEXT,
    unlock_source TEXT,
    purchasable INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hero (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    experience INTEGER NOT NULL DEFAULT 0,
    rating INTEGER NOT NULL DEFAULT 0,
    prestige INTEGER NOT NULL DEFAULT 0,
    league TEXT NOT NULL DEFAULT '',
    exp_req INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES itemdefinition (item_id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    cards INTEGER NOT NULL DEFAULT 0,
    cards_need INTEGER NOT NULL DEFAULT -1,
    total_xp INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hero_profile_id ON hero (profile_id);
CREATE INDEX IF NOT EXISTS idx_hero_name ON hero (name);
CREATE INDEX IF NOT EXISTS idx_item_profile_id ON item (profile_id);
CREATE INDEX IF NOT EXISTS idx_item_item_id ON item (item_id);
CREATE INDEX IF NOT EXISTS idx_itemdefinition_rarity ON itemdefinition (rarity);
CREATE INDEX IF NOT EXISTS idx_itemdefinition_connected_hero ON itemdefinition (connected_hero);

ALTER TABLE profiles DROP COLUMN profile_fb;
