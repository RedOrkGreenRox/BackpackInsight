# api profile fb — бинарный профильный контракт

Backend→middleware endpoint:

```text
POST /api/profile.fb
```

Вход остаётся пользовательским JSON-профилем, потому что это внешний формат, который вставляет пользователь.

Выход — FlatBuffer:

```text
success: ProfileView, file_identifier BIPR
error:   ApiError,    file_identifier BIER
```

Старый JSON endpoint `/api/profile` удалён. Middleware должен потреблять только `/api/profile.fb`.

Активные элементы:

```text
RBackend/schemas/profile.fbs
RBackend/schemas/error.fbs
pack::profile
pack::error
api::routes::profile_binary
middleware::decode_profile
middleware::decode_error
```

---
> 📌 **Подпись документации:** binary profile endpoint для backend→middleware контракта, 2026-07-11.
