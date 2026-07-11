# Data source layer — контрольная точка данных

Эта контрольная точка начинает backend data source layer.

Входит:

```text
RBackend/schemas/*.fbs
build crate
catalog validation
image validation
locale validation
catalog preview pack
```

Не входит:

```text
runtime чтение .fb в api
SQLx/DB
frontend/SSR/islands
```

Цель: перестать относиться к raw JSON как к безусловной истине и начать строить слой, где raw data проходит проверку перед попаданием в runtime packs.

---
> 📌 **Подпись документации:** data source layer checkpoint, 2026-07-06.
