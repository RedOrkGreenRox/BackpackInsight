# [Декодеры FlatBuffer-паков (flatbuffer-decoders.ts)](/Frontend/Web/ground/middleware/flatbuffer-decoders.ts)

## Назначение
Фронтенд-декодеры бинарных ответов Rust-бэкенда: превращают FlatBuffer-байты в обычные объекты из [api-types](../types/api-types.md). Используют TS-биндинги, сгенерированные компилятором FlatBuffers в `ground/middleware/generated/backpack-insight/` (каталог исключён из зеркальной документации как сгенерированный).

## Экспорты
- `decodeItems(bytes)` — пак каталога (идентификатор файла `"BIAI"`, схема `api_items.fbs`). Каждый элемент пака — дерево `Value`; оно разворачивается `decodeValue`, и объекты верхнего уровня возвращаются как `ItemDefinition[]`. Неверный идентификатор — исключение.
- `decodeProfile(bytes)` — профиль игрока (`"BIPR"`, `profile.fbs`) → `PlayerProfile`: статистика предметов по редкостям, герои, предметы, скины по владельцам и скалярные поля. Неверный идентификатор — исключение.
- `decodeApiError(bytes)` — ошибка API (`"BIER"`, `error.fbs`) → `ApiErrorData` (`code`, `detail`, `issues`); при чужом идентификаторе возвращает `null`, чтобы вызывающий мог обработать ответ иначе.
- `ApiErrorData` — интерфейс результата `decodeApiError`.

## Внутренние функции
- `decodeValue(value)` — рекурсивно переводит FlatBuffer-`Value` в JSON-подобное значение (`JsonLike`) по `ValueKind`: null, bool, int, float, string, массив, объект.
- `byteBuffer(bytes)` — оборачивает `ArrayBuffer` в `flatbuffers.ByteBuffer`.
- `toNumber(value)` — `bigint` → `number` с ограничением до `Number.MAX_SAFE_INTEGER`.
- `isObject(value)` — проверка «обычный объект, не массив и не null».

## Связи
- Вызывается из [ApiService](../utils/ApiService.md) при загрузке каталога, профиля и разборе ошибок.
- Схемы: [Backend/schemas](../../../Backend/schemas.md); серверный аналог — [middleware crate](../../../Backend/crates/middleware.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
