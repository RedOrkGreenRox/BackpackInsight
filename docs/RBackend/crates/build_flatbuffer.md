# build flatbuffer — первый настоящий `.fb` pack

Эта контрольная точка добавляет первый настоящий FlatBuffer artifact для catalog summary.

Команды:

```bash
cargo run -p builder -- build-catalog-flatbuffer
cargo run -p builder -- verify-flatbuffer
```

## Что делает `build-catalog-flatbuffer`

1. Читает текущий plain JSON-каталог.
2. Строит JSON, соответствующий `RBackend/schemas/catalog.fbs`.
3. Вызывает внешний `flatc`.
4. Создаёт бинарный pack:

```text
RBackend/generated/catalog_summary.fb
```

## Что делает `verify-flatbuffer`

Проверяет минимальные свойства pack-а:

```text
файл существует
размер больше 8 байт
FlatBuffers file identifier == BICS
```

Это пока не runtime-парсер pack-а. Runtime-переход `api` на чтение `.fb` будет отдельной backend-точкой.

## Почему через `flatc`, а не вручную

На этой точке важно получить настоящий бинарный FlatBuffer без преждевременного связывания runtime API с generated-кодом. `flatc` становится build-зависимостью data-source слоя.

---
> 📌 **Подпись документации:** первый build шаг настоящего FlatBuffer pack, 2026-07-06.


## Runtime reader

Добавлен `pack`: `verify-flatbuffer` теперь читает pack через generated Rust bindings, а не только проверяет байты file identifier.
