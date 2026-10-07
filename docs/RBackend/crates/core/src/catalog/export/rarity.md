# [Чтение редкости (rarity.rs)](/RBackend/crates/core/src/catalog/export/rarity.rs)

## Назначение
Модуль для `#[serde(with = "super::rarity")]`: читает и пишет `ItemRarity` ([profile/items/types.rs](../../profile/items/types.md)) строкой, как она записана в экспорте игры. Так модель экспорта использует ту же редкость, что и правила профиля, без второго перечисления.

## Ключевая функциональность
- **`deserialize`** — берёт строку и разбирает её через `ItemRarity::from_str`; незнакомое имя (например, `Godly`) — ошибка разбора всего экспорта.
- **`serialize`** — пишет `ItemRarity::as_str()`. `clippy::trivially_copy_pass_by_ref` разрешён: ссылку в сигнатуре требует `serde`.

## Связи
- Модуль: [export/mod.rs](mod.md); поле `rarity` в [item.rs](item.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
