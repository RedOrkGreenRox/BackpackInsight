# [SEO-утилита keywords — Cloudflare Function (seo-utils.ts)](../../../../Frontend/Web/functions/utils/seo-utils.ts)

## Назначение
Cloudflare Function: отдаёт HTML с динамически подставленными `keywords`/`description` в зависимости от языка (`?lang=ru|en`).

## Подробное описание
*   `getKeywords(lang)` — словарь ключевых слов для `ru`/`en` (fallback `ru`).
*   `onRequestGet(context)` — читает `?lang`, формирует минимальный HTML с локализованными `<title>/description/keywords`, отдаёт `text/html`.

## AI-контекст
*   Вспомогательный/демо-эндпоинт генерации SEO-разметки. Основная мета на страницах предметов — в [api/item/[id]](../api/item/[id].md) и [item/[id]](../item/[id].md).

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
