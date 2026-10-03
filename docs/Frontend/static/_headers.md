# [static/_headers](/Frontend/Web/static/_headers)

## Назначение
Правила HTTP-заголовков кэширования для Cloudflare Pages. Лежит в `static/`, которую Vite использует как `publicDir` ([vite.config](../vite.config.md)), поэтому попадает в корень собранного сайта. Второй файл `_headers` в корне `Frontend/Web` относится к Netlify и описан отдельно: [_headers](../_headers.md).

## Ключевое
| Путь | `Cache-Control` |
| :--- | :--- |
| `/fonts/*`, `/*.woff2` | `public, max-age=31536000, immutable` (год) |
| `/assets/*` | `public, max-age=31536000, immutable` (год, файлы Vite с хэшем в имени) |
| `/images/*`, `/*.js`, `/*.css`, `/*.json` | `public, max-age=60, immutable` (минута) |
| `/api/*` | `public, max-age=60, stale-while-revalidate=600` |

## AI-контекст
- Комментарий в файле говорит, что Cloudflare применяет правила сверху вниз. По документации Cloudflare Pages заголовки всех подходящих правил объединяются, поэтому файл под `/assets/` с расширением `.js` может получить оба значения `Cache-Control`. Это вывод из документации, на живом сайте не проверялся.

## Связи
- Перенаправления: [static/_redirects](_redirects.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
