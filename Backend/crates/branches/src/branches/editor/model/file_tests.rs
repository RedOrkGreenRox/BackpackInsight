//! Тесты файла билда и записи в адресе на экспорте из игры (7.0.0, Mycella).

use super::{
    board_tests::{kit, BAG, SPORE},
    url, BuildFile,
};

/// Экспорт билда из игры (сокращён: `run`, `name` и `slotPositions` игра пишет, редактору они не нужны).
const GAME: &str = r#"{
  "gameVersion": "7.0.0",
  "hero": { "name": "Mycella", "level": 11, "isParagon": false },
  "run": { "matchType": "ranked", "currentStage": 0, "wins": 0, "livesLeft": 5 },
  "inventoryItems": [
    { "id": "Sporeweaver's Sac", "name": "Sporeweaver's Sac", "position": { "x": 5, "y": 2 }, "orientation": "Left" },
    { "id": "Medium Bag", "position": { "x": 7, "y": 2 }, "orientation": "Left" },
    { "id": "Wooden Stick", "position": { "x": 5, "y": 2 }, "orientation": "Right" },
    { "id": "Medium Bag", "position": { "x": 4, "y": 4 }, "orientation": "Up" },
    { "id": "Watermelon", "position": { "x": 4, "y": 4 }, "orientation": "Up" },
    { "id": "Spore", "position": { "x": 4, "y": 3 }, "orientation": "Up" },
    { "id": "Wooden Stick", "position": { "x": 7, "y": 3 }, "orientation": "Down" },
    { "id": "Spore", "position": { "x": 5, "y": 3 }, "orientation": "Up" }
  ],
  "storageItems": [{ "id": "Spore" }, { "id": "Royal Banana" }]
}"#;

fn game_file() -> BuildFile {
    serde_json::from_str(GAME).unwrap_or_else(|err| panic!("{err}"))
}

#[test]
fn game_export_lays_out_without_losses() {
    let kit = kit();
    let imported = game_file().import(&kit);
    assert_eq!(imported.hero.as_deref(), Some("Mycella"));
    assert_eq!(imported.unknown, ["Royal Banana"]);
    assert_eq!(imported.board.bags.len(), 3);
    assert_eq!(imported.board.items.len(), 5);
    assert_eq!(imported.board.storage, [SPORE]);
}

#[test]
fn export_drops_run_and_round_trips() {
    let kit = kit();
    let imported = game_file().import(&kit);
    let file = BuildFile::export(&kit, &imported.board, imported.hero.as_deref());
    let json = serde_json::to_string(&file).unwrap_or_else(|err| panic!("{err}"));
    assert!(!json.contains("run") && !json.contains("level"));
    assert!(json.contains("slotPositions"));
    assert_eq!(file.import(&kit).board, imported.board);
}

#[test]
fn url_code_round_trips() {
    let kit = kit();
    let board = game_file().import(&kit).board;
    let field = url::encode_field(&kit, &board);
    assert!(field.starts_with("sporeweaver-s-sac.52l~medium-bag.72l~"));
    let storage = url::encode_storage(&kit, &board);
    assert_eq!(url::decode(&kit, &field, &storage), board);
    let broken = url::decode(&kit, "nope.00u~medium-bag.9xq~medium-bag.00u", "");
    assert_eq!(broken.bags.len(), 1);
    assert_eq!(broken.bags[0].piece, BAG);
}
