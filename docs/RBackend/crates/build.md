# build — сборка и проверка данных

`builder` — backend/oracle crate для data source layer.

Он не является runtime API и не должен попадать в production runtime image без необходимости. Это build/CI-инструмент для будущего перехода от raw JSON к проверенным data packs.

## Команды контрольной точки

```bash
cargo run -p builder -- validate-catalog
cargo run -p builder -- check-images
cargo run -p builder -- check-locales
cargo run -p builder -- validate-all
cargo run -p builder -- build-catalog-preview
```

## Ответственности

```text
catalog/files.rs       поиск и чтение текущих JSON-файлов
catalog/validate.rs    проверка id/slug/rarity/recipes
catalog/images.rs      проверка image_key -> webp/avif
catalog/locales.rs     проверка en/ru id coverage
catalog/preview.rs     preview pack для следующего шага FlatBuffers
```

## Важно

`build-catalog-preview` пока создаёт JSON preview, а не финальный FlatBuffer binary. Это осознанный промежуточный шаг: сначала фиксируются схемы и валидаторы, затем будет подключён `flatc`/генерация бинарных packs.

---
> 📌 **Подпись документации:** build data source layer, 2026-07-06.
