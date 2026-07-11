# FlatBuffers schemas — начальный набор схем

В `RBackend/schemas/` добавлены стартовые `.fbs` схемы:

```text
catalog.fbs       catalog summary/details foundation
profile.fbs       profile response foundation
search.fbs        search index foundation
localization.fbs  locale string table foundation
error.fbs         shared API error foundation
```

Эта контрольная точка не генерирует production `.fb` packs. Схемы фиксируют направление и имена будущих бинарных контрактов.

Следующий шаг после валидаторов:

```text
подключить flatc/codegen
сгенерировать Rust bindings или использовать reflection/flatbuffers crate
заменить preview JSON pack на настоящий .fb
```

---
> 📌 **Подпись документации:** начальные FlatBuffers schemas, 2026-07-06.
