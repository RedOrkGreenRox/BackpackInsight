use crate::{
    profile::{
        json_input,
        view::{profile_view, ProfileErrorResponse, ProfileViewResponse},
    },
    AppState,
};
use axum::{
    body::Body,
    extract::State,
    http::{header, StatusCode},
    response::Response,
    Json,
};
use pack::{
    build_api_error_bytes, build_profile_view_bytes, ApiErrorPack, ProfileHeroPack,
    ProfileItemPack, ProfileViewPack,
};
use rbackend_core::ProfileIdentityService;
use serde_json::Value;

pub async fn profile_fb(
    State(state): State<AppState>,
    Json(payload): Json<Value>,
) -> Result<Response, (StatusCode, Response)> {
    match profile_view(&payload, &state.project_root) {
        Ok(view) => {
            let bytes = build_profile_view_bytes(&to_pack(view.clone()));
            save_profile_if_enabled(&state, &payload, &view, &bytes)
                .await
                .map_err(|error| (StatusCode::INTERNAL_SERVER_ERROR, error_response(error)))?;
            Ok(binary_response(StatusCode::OK, bytes))
        }
        Err(error) => Err((StatusCode::BAD_REQUEST, error_response(error))),
    }
}

async fn save_profile_if_enabled(
    state: &AppState,
    payload: &Value,
    view: &ProfileViewResponse,
    bytes: &[u8],
) -> Result<(), ProfileErrorResponse> {
    let Some(db) = &state.db else {
        return Ok(());
    };
    let identity =
        ProfileIdentityService::read(&json_input::identity_input(payload)).map_err(|issues| {
            let issues = issues.iter().map(ToString::to_string).collect::<Vec<_>>();
            ProfileErrorResponse {
                detail: format!("Failed to persist profile: {}", issues.join(", ")),
                issues,
            }
        })?;

    db::save_profile(
        db.pool(),
        db::ProfileSave {
            uid: identity.uid.to_string(),
            nickname: view.nickname.clone(),
            level: view.level,
            trophy: view.trophy,
            bonus_trophy: view.bonus_trophy,
            coins: view.coins,
            gems: view.gems,
            area: view.area.clone(),
            profile_fb: bytes.to_vec(),
        },
    )
    .await
    .map_err(|error| ProfileErrorResponse {
        detail: error.clone(),
        issues: vec![error],
    })?;
    Ok(())
}

fn to_pack(view: ProfileViewResponse) -> ProfileViewPack {
    ProfileViewPack {
        nickname: view.nickname,
        level: view.level,
        trophy: view.trophy,
        bonus_trophy: view.bonus_trophy,
        gems: view.gems,
        coins: view.coins,
        xp_current: view.xp_current,
        xp_need: view.xp_need,
        area: view.area,
        item_stats: view.item_stats.into_iter().collect(),
        heroes: view
            .heroes
            .into_iter()
            .map(|hero| ProfileHeroPack {
                name: hero.name,
                level: hero.level,
                rating: hero.rating,
                experience: hero.experience,
                exp_req: hero.exp_req,
                prestige: hero.prestige,
                league: hero.league,
                skin_num: hero.skin_num.to_string(),
            })
            .collect(),
        items: view
            .items
            .into_iter()
            .map(|item| ProfileItemPack {
                name: item.name,
                rarity: item.rarity,
                level: item.level,
                cards: item.cards,
                cards_need: item.cards_need,
            })
            .collect(),
        actual_version: view.actual_version,
        install_version: view.install_version,
        profile_skins: view.profile_skins.into_iter().collect(),
    }
}

fn error_response(error: ProfileErrorResponse) -> Response {
    let bytes = build_api_error_bytes(&ApiErrorPack {
        code: "bad_request".to_string(),
        detail: error.detail,
        issues: error.issues,
    });
    binary_response(StatusCode::BAD_REQUEST, bytes)
}

fn binary_response(status: StatusCode, bytes: Vec<u8>) -> Response {
    let mut response = Response::new(Body::from(bytes));
    *response.status_mut() = status;
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        header::HeaderValue::from_static("application/octet-stream"),
    );
    response
}
