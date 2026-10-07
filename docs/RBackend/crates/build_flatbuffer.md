# Сборка пака сводки каталога

Как утилита [builder](build.md) собирает `RBackend/generated/catalog_summary.fb` (идентификатор `"BICS"`).

```bash
cargo run -p builder -- build-catalog-flatbuffer
cargo run -p builder -- verify-flatbuffer
```

## `build-catalog-flatbuffer`
1. Читает нелокализованный JSON-каталог из `Backend/DB`.
2. Пишет временный JSON по схеме `RBackend/schemas/catalog.fbs`: номер строки, id, имя, слаг, ключ картинки и редкость каждого предмета.
3. Вызывает внешний `flatc -b`, удаляет временный JSON и переименовывает результат в `.fb`.
4. Сразу читает пак через crate [pack](pack.md), чтобы убедиться, что он корректен.

## `verify-flatbuffer`
Читает пак через сгенерированные Rust-биндинги crate pack и печатает число предметов, версию схемы и первый предмет. Тот же пак читает API в `/ready` ([routes/health](api/src/routes/health.md)).

## Почему `flatc`
Бинарный пак строит эталонный компилятор FlatBuffers, а не ручной код. Поэтому формат гарантированно совпадает со схемой; цена — `flatc` нужен в окружении сборки, но не на сервере.

Код — [catalog/flatbuffer](builder/src/catalog/flatbuffer.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
