# 📦 Backend/DB — справочники предметов

Каталог `Backend/DB/` содержит статические JSON-файлы с данными предметов игры **Backpack Brawl**. Это **исходные данные** для [builder](../../RBackend/crates/build.md) crate (валидация + сборка FlatBuffer-паков).

## Файлы

| Файл | Назначение |
| :--- | :--- |
| `items_3_1_0.json` | Справочник предметов v3.1.0. |
| `items_4_0_0.json` | Справочник предметов v4.0.0. |
| `items_5_0_0.json` | Справочник предметов v5.0.0. |
| `items_en_5_1_0.json` | Английская локализация v5.1.0 (старшая). |
| `items_ru_5_1_0.json` | Русская локализация v5.1.0 (старшая). |
| `items_tooltips.json` | Текстовые тултипы предметов. |

## Как используется
1. [builder](../../RBackend/crates/build.md) читает эти файлы через [catalog/files.rs](../../RBackend/crates/builder/src/catalog/files.md).
2. [catalog/locales.rs](../../RBackend/crates/builder/src/catalog/locales.md) объединяет `en`/`ru` локализации.
3. [catalog/validate.rs](../../RBackend/crates/builder/src/catalog/validate.md) проверяет целостность.
4. [catalog/api_items_flatbuffer.rs](../../RBackend/crates/builder/src/catalog/api_items_flatbuffer.md) упаковывает в `RBackend/generated/api_items_{en,ru}.fb`.

## AI-контекст
*   Старшая версия (`5.1.0`) выбирается автоматически по имени файла.
*   JSON-файлы НЕ сериализуются напрямую в API; transport = FlatBuffer.

---
> 📌 **Подпись документации:** справочник источников данных для builder crate · 2026-07-12.
