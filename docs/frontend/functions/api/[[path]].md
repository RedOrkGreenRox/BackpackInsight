# [API-прокси Cloudflare ([[path]].ts)](../../../../Frontend/Web/functions/api/[[path]].ts)

## Назначение
Catch-all Cloudflare Pages Function: проксирует **все** запросы `/api/*` на бэкенд (VPS), добавляя секретный заголовок, и кеширует на Edge список предметов. Ключевой узел безопасности (бэкенд напрямую недоступен).

## Связи (Dependencies)
*   Переменные окружения: `env.BACKEND` (адрес VPS), `env.API_SECRET` (общий секрет).
*   Серверная проверка секрета — в [api.py (verify_proxy_secret)](../../../backend/playerdata/api.md).

## Подробное описание `onRequest(context)`
1.  Определяет `isItemsApi` (`GET /api/items`) — единственный кешируемый случай; при попадании в `caches.default` сразу отдаёт кеш.
2.  Формирует `destination = env.BACKEND + pathname + search`.
3.  Копирует заголовки, выставляет `X-Internal-Secret = env.API_SECRET`, удаляет `if-range` (для стабильного кеша).
4.  Тело пробрасывает только для не-GET/HEAD (`arrayBuffer()`).
5.  Для успешного `/api/items` оборачивает ответ, ставит `Cache-Control: public, s-maxage=60, max-age=3600` и фоном кладёт в Edge-кеш (`waitUntil`).
6.  При сбое фетча → `502 {error:'VPS_OFFLINE'}`.

## AI-контекст
*   Без этого прокси фронтенд не может ходить на бэкенд: секрет добавляется только здесь. `s-maxage=60` — Edge-кеш на узле CF; список предметов меняется редко. Не кешируйте `POST /api/profile`.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
