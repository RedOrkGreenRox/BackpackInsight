# Справочники предметов (Backend/DB/)

Каталог `Backend/DB/` содержит статические JSON-файлы с данными предметов игры **Backpack Brawl**. Это **исходные данные** для [builder](../../RBackend/crates/build.md) crate (валидация + сборка FlatBuffer-паков).

## Файлы

| Файл | Назначение |
| :--- | :--- |
| `items_3_1_0.json` | Справочник предметов v3.1.0. |
| `items_4_0_0.json` | Справочник предметов v4.0.0. |
| `items_5_0_0.json` | Справочник предметов v5.0.0. |
| `items_en_5_1_0.json` | Английская локализация v5.1.0. |
| `items_ru_5_1_0.json` | Русская локализация v5.1.0; на ней держатся тесты модели экспорта. |
| `items_en_7_0_0.json` | Английская локализация v7.0.0 (старшая, 1139 предметов, добавлена 2026-10-06). |
| `items_ru_7_0_0.json` | Русская локализация v7.0.0 (старшая). |
| `items_tooltips.json` | Текстовые тултипы предметов. |

## Как используется
1. [builder](../../RBackend/crates/build.md) читает эти файлы через [catalog/files.rs](../../RBackend/crates/builder/src/catalog/files.md).
2. [catalog/locales.rs](../../RBackend/crates/builder/src/catalog/locales.md) объединяет `en`/`ru` локализации.
3. [catalog/validate.rs](../../RBackend/crates/builder/src/catalog/validate.md) проверяет целостность.
4. [catalog/api_items_flatbuffer.rs](../../RBackend/crates/builder/src/catalog/api_items_flatbuffer.md) упаковывает в `RBackend/generated/api_items_{en,ru}.fb` (для старого API).
5. [catalog/export.rs](../../RBackend/crates/builder/src/catalog/export.md) проверяет локализации строгой моделью и пишет `RBackend/generated/items_{en,ru}.json` — каталог сайта.

## AI-контекст
*   Старшая версия локализаций (сейчас `7.0.0`) выбирается автоматически по имени файла.
*   Сайт (Leptos) читает нормализованный JSON из `generated/` в модель [core/catalog/export](../../RBackend/crates/core/src/catalog/export/mod.md); старый API отдаёт FlatBuffer.

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
