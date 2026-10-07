# [Модули утилиты сборки (mod.rs)](/Backend/crates/builder/src/catalog/mod.rs)

## Назначение
Модули утилиты сборки, вызываемые из [main](../main.md):

| Подмодуль | Роль |
| :--- | :--- |
| [files](files.md) | пути к исходным JSON и их чтение |
| [validate](validate.md) | проверка каталога |
| [images](images.md) | проверка картинок предметов |
| [locales](locales.md) | проверка EN/RU каталогов |
| [flatbuffer](flatbuffer.md) | пак `catalog_summary.fb` |
| [api_items_flatbuffer](api_items_flatbuffer.md) | паки `api_items_{en,ru}.fb` |
| [export](export.md) | каталог `items_{en,ru}.json` для сайта по строгой модели |

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
