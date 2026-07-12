//! Seeds the `itemdefinition` table from the pre-built FlatBuffer catalogs
//! `RBackend/generated/api_items_en.fb` + `api_items_ru.fb`. Idempotent: if
//! `itemdefinition` already has any row, this is a no-op.

use middleware::decode_items;
use sqlx::AnyPool;
use std::path::Path;

/// If `itemdefinition` is empty, reads both `api_items_en.fb` and `api_items_ru.fb`
/// from `<project_root>/RBackend/generated/`, decodes them, merges (en name + ru
/// name_ru) and bulk-INSERTs one row per catalog item. Returns the number of rows
/// inserted (0 if the table was already populated or the packs are missing).
pub async fn seed_itemdefinitions_if_empty(
    pool: &AnyPool,
    project_root: &Path,
) -> Result<usize, String> {
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM itemdefinition")
        .fetch_one(pool)
        .await
        .map_err(|err| format!("itemdefinition count failed: {err}"))?;
    if count.0 > 0 {
        return Ok(0);
    }

    let generated = project_root.join("RBackend/generated");
    let en_bytes = std::fs::read(generated.join("api_items_en.fb"))
        .map_err(|err| format!("read api_items_en.fb: {err}"))?;
    let ru_bytes = std::fs::read(generated.join("api_items_ru.fb"))
        .map_err(|err| format!("read api_items_ru.fb: {err}"))?;
    let en = decode_items(&en_bytes)?;
    let ru = decode_items(&ru_bytes)?;
    let ru_by_id: std::collections::BTreeMap<&str, &str> = ru
        .items
        .iter()
        .map(|item| (item.id.as_str(), item.name.as_str()))
        .collect();

    let rows: Vec<SeedRow> = en
        .items
        .iter()
        .map(|item| SeedRow {
            item_id: item.id.clone(),
            name: item.name.clone(),
            name_ru: ru_by_id.get(item.id.as_str()).copied().unwrap_or("").to_string(),
            rarity: item.rarity.clone(),
            coin_value: item.coin_value,
            connected_hero: item.connected_hero.clone(),
            unlock_source: item.unlock_source.clone(),
            purchasable: item.purchasable,
        })
        .collect();
    if rows.is_empty() {
        return Ok(0);
    }

    let sql = build_seed_insert(rows.len());
    let mut q = sqlx::query(&sql);
    for row in &rows {
        q = q
            .bind(&row.item_id)
            .bind(&row.name)
            .bind(&row.name_ru)
            .bind(&row.rarity)
            .bind(row.coin_value)
            .bind(&row.connected_hero)
            .bind(&row.unlock_source)
            .bind(row.purchasable);
    }
    q.execute(pool)
        .await
        .map_err(|err| format!("itemdefinition bulk insert failed: {err}"))?;
    Ok(rows.len())
}

struct SeedRow {
    item_id: String,
    name: String,
    name_ru: String,
    rarity: String,
    coin_value: Option<i64>,
    connected_hero: Option<String>,
    unlock_source: Option<String>,
    purchasable: bool,
}

fn build_seed_insert(rows: usize) -> String {
    let cols = 8;
    let mut sql = String::from(
        "INSERT INTO itemdefinition (item_id, name, name_ru, rarity, coin_value, connected_hero, unlock_source, purchasable) VALUES",
    );
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
    use super::build_seed_insert;

    #[test]
    fn build_seed_insert_2_rows() {
        let sql = build_seed_insert(2);
        assert_eq!(
            sql,
            "INSERT INTO itemdefinition (item_id, name, name_ru, rarity, coin_value, connected_hero, unlock_source, purchasable) VALUES ($1, $2, $3, $4, $5, $6, $7, $8), ($9, $10, $11, $12, $13, $14, $15, $16)"
        );
    }

    #[test]
    fn build_seed_insert_single_row_uses_8_placeholders() {
        let sql = build_seed_insert(1);
        assert!(sql.contains("($1, $2, $3, $4, $5, $6, $7, $8)"));
    }
}
