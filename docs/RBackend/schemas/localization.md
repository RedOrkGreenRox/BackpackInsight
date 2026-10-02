# [localization.fbs](/RBackend/schemas/localization.fbs)

## Назначение
Схема пака строк интерфейса (пространство имён `BackpackInsight.Localization`, корень `LocalePack`, идентификатор `"BILC"`).

## Таблицы
- `LocalePack` — `schema_version`, `lang`, `strings`, все обязательные.
- `LocalizedString` — `key` и `value`, обязательные.

## Использование
Схема нигде не используется: для неё нет Rust-биндингов в `pack/src/generated`, builder не собирает такой пак, фронтенд берёт строки интерфейса из своих JSON ([i18n](../../Frontend/ground/localization/i18n.md)). Локализация предметов идёт внутри паков [api_items](api_items.md).

## Планируется
Пак строк интерфейса в этом формате; срок и потребитель не определены.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
