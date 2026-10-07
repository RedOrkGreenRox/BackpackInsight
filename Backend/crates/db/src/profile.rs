//! Transactional normalized upsert for `profiles` + `hero` + `item`.
//!
//! Works on `&sqlx::AnyPool` (Postgres or SQLite). The SQL is intentionally
//! dialect-portable: `$N` placeholders (supported by both drivers),
//! `INSERT ... ON CONFLICT(uid) DO UPDATE ... RETURNING id` (Postgres ≥9.5,
//! SQLite ≥3.35), `DELETE`, and bulk multi-row `INSERT ... VALUES`.

use sqlx::AnyPool;

#[derive(Debug, Clone)]
pub struct ProfileSave {
    pub uid: String,
    pub nickname: String,
    pub level: u64,
    pub trophy: u64,
    pub bonus_trophy: u64,
    pub coins: u64,
    pub gems: u64,
    pub area: String,
    pub heroes: Vec<HeroSave>,
    pub items: Vec<ItemSave>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HeroSave {
    pub name: String,
    pub level: i32,
    pub experience: i64,
    pub rating: i32,
    pub prestige: bool,
    pub league: String,
    pub exp_req: i64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ItemSave {
    pub item_id: String,
    pub level: i32,
    pub cards: i32,
    pub cards_need: i32,
    pub total_xp: i64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SavedProfile {
    pub uid: String,
    pub nickname: String,
}

pub async fn save_profile(pool: &AnyPool, profile: ProfileSave) -> Result<SavedProfile, String> {
    let mut tx = pool
        .begin()
        .await
        .map_err(|err| format!("tx begin failed: {err}"))?;

    let row: (i64,) = sqlx::query_as(
        r#"
        INSERT INTO profiles (
            uid, nickname, level, trophy, bonus_trophy, coins, gems, area, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        ON CONFLICT (uid) DO UPDATE SET
            nickname = EXCLUDED.nickname,
            level = EXCLUDED.level,
            trophy = EXCLUDED.trophy,
            bonus_trophy = EXCLUDED.bonus_trophy,
            coins = EXCLUDED.coins,
            gems = EXCLUDED.gems,
            area = EXCLUDED.area,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
        "#,
    )
    .bind(&profile.uid)
    .bind(&profile.nickname)
    .bind(profile.level as i64)
    .bind(profile.trophy as i64)
    .bind(profile.bonus_trophy as i64)
    .bind(profile.coins as i64)
    .bind(profile.gems as i64)
    .bind(&profile.area)
    .fetch_one(&mut *tx)
    .await
    .map_err(|err| format!("profile upsert failed: {err}"))?;
    let profile_id = row.0;

    sqlx::query("DELETE FROM hero WHERE profile_id = $1")
        .bind(profile_id)
        .execute(&mut *tx)
        .await
        .map_err(|err| format!("hero clear failed: {err}"))?;
    if !profile.heroes.is_empty() {
        let sql = build_bulk_insert(
            "INSERT INTO hero (profile_id, name, level, experience, rating, prestige, league, exp_req) VALUES",
            profile.heroes.len(),
            8,
        );
        let mut q = sqlx::query(&sql);
        for hero in &profile.heroes {
            q = q
                .bind(profile_id)
                .bind(&hero.name)
                .bind(hero.level)
                .bind(hero.experience)
                .bind(hero.rating)
                .bind(hero.prestige)
                .bind(&hero.league)
                .bind(hero.exp_req);
        }
        q.execute(&mut *tx)
            .await
            .map_err(|err| format!("hero insert failed: {err}"))?;
    }

    sqlx::query("DELETE FROM item WHERE profile_id = $1")
        .bind(profile_id)
        .execute(&mut *tx)
        .await
        .map_err(|err| format!("item clear failed: {err}"))?;
    if !profile.items.is_empty() {
        let sql = build_bulk_insert(
            "INSERT INTO item (profile_id, item_id, level, cards, cards_need, total_xp) VALUES",
            profile.items.len(),
            6,
        );
        let mut q = sqlx::query(&sql);
        for item in &profile.items {
            q = q
                .bind(profile_id)
                .bind(&item.item_id)
                .bind(item.level)
                .bind(item.cards)
                .bind(item.cards_need)
                .bind(item.total_xp);
        }
        q.execute(&mut *tx)
            .await
            .map_err(|err| format!("item insert failed: {err}"))?;
    }

    tx.commit()
        .await
        .map_err(|err| format!("tx commit failed: {err}"))?;

    Ok(SavedProfile {
        uid: profile.uid,
        nickname: profile.nickname,
    })
}

/// Builds a multi-row `INSERT ... VALUES ($1, $2, ..., $C), ($C+1, ...), ...` statement.
fn build_bulk_insert(prefix: &str, rows: usize, cols: usize) -> String {
    // prefix typically ends with "VALUES" (no trailing space) — add one.
    let mut sql = String::from(prefix);
    sql.push(' ');
    for row in 0..rows {
        if row > 0 {
            sql.push_str(", ");
        }
        sql.push('(');
        for col in 0..cols {
            if col > 0 {
                sql.push_str(", ");
            }
            sql.push('$');
            sql.push_str(&((row * cols + col + 1).to_string()));
        }
        sql.push(')');
    }
    sql
}

#[cfg(test)]
mod tests {
    use super::{build_bulk_insert, HeroSave, ItemSave, ProfileSave};

    #[test]
    fn build_bulk_insert_2_rows_3_cols() {
        let sql = build_bulk_insert("INSERT INTO t (a, b, c) VALUES", 2, 3);
        assert_eq!(sql, "INSERT INTO t (a, b, c) VALUES ($1, $2, $3), ($4, $5, $6)");
    }

    #[test]
    fn build_bulk_insert_single_row() {
        let sql = build_bulk_insert("INSERT INTO t (a) VALUES", 1, 1);
        assert_eq!(sql, "INSERT INTO t (a) VALUES ($1)");
    }

    #[test]
    fn profile_save_carries_heroes_and_items_not_blob() {
        let save = ProfileSave {
            uid: "uid".to_string(),
            nickname: "Player".to_string(),
            level: 1,
            trophy: 0,
            bonus_trophy: 0,
            coins: 0,
            gems: 0,
            area: "01".to_string(),
            heroes: vec![HeroSave {
                name: "Ronan".to_string(),
                level: 15,
                experience: 100,
                rating: 2000,
                prestige: false,
                league: "Diamond".to_string(),
                exp_req: 3200,
            }],
            items: vec![ItemSave {
                item_id: "wooden_sword".to_string(),
                level: 6,
                cards: 200,
                cards_need: 100,
                total_xp: 190,
            }],
        };
        assert_eq!(save.heroes.len(), 1);
        assert_eq!(save.items.len(), 1);
        assert_eq!(save.items[0].item_id, "wooden_sword");
    }

    #[test]
    fn profile_save_with_empty_children_is_valid() {
        let save = ProfileSave {
            uid: "u".to_string(),
            nickname: "P".to_string(),
            level: 1,
            trophy: 0,
            bonus_trophy: 0,
            coins: 0,
            gems: 0,
            area: "01".to_string(),
            heroes: Vec::new(),
            items: Vec::new(),
        };
        assert!(save.heroes.is_empty());
        assert!(save.items.is_empty());
    }

    #[test]
    fn hero_save_preserves_prestige_flag() {
        let hero = HeroSave {
            name: "Harkon".to_string(),
            level: 6,
            experience: 1,
            rating: 1,
            prestige: true,
            league: "Mythic".to_string(),
            exp_req: 1,
        };
        assert!(hero.prestige);
    }
}
