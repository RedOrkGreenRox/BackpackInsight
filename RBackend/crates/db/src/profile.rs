use sqlx::PgPool;

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
    pub profile_fb: Vec<u8>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SavedProfile {
    pub uid: String,
    pub nickname: String,
}

pub async fn save_profile(pool: &PgPool, profile: ProfileSave) -> Result<SavedProfile, String> {
    sqlx::query(
        r#"
        INSERT INTO profiles (
            uid, nickname, level, trophy, bonus_trophy, coins, gems, area, profile_fb, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (uid) DO UPDATE SET
            nickname = EXCLUDED.nickname,
            level = EXCLUDED.level,
            trophy = EXCLUDED.trophy,
            bonus_trophy = EXCLUDED.bonus_trophy,
            coins = EXCLUDED.coins,
            gems = EXCLUDED.gems,
            area = EXCLUDED.area,
            profile_fb = EXCLUDED.profile_fb,
            updated_at = NOW()
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
    .bind(&profile.profile_fb)
    .execute(pool)
    .await
    .map_err(|err| format!("profile upsert failed: {err}"))?;

    Ok(SavedProfile {
        uid: profile.uid,
        nickname: profile.nickname,
    })
}
