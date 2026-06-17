# Долгий ящик / отложенный backlog

Файл создан по запросу: складывать сюда всё, что не является текущим фокусом анализа страницы **Предметы**.

Дата фиксации: 2026-06-17.

## Из первичного анализа репозитория

### 1. Профили с чувствительными полями в `Backend/PlayerData/Profiles/*.json`
Статус: **пофиг / не трогать сейчас**.

В профилях встречаются поля вроде `UID`, `DUID`, `FBID`, `FBT`, `CS`, `AS`. Это privacy/security-риск, но по текущему решению не является задачей.

### 2. Потенциальный XSS во frontend-renderers
Статус: **долгий ящик**.

Ряд renderer-ов вставляет данные через HTML-шаблоны/`innerHTML`. Для пользовательских данных в будущем стоит добавить единый `escapeHtml` / safe DOM rendering.

### 3. Проверка размера `/api/profile` происходит после парсинга body
Статус: **долгий ящик**.

FastAPI уже распарсил JSON к моменту проверки `Content-Length`. В будущем можно делать ASGI/body-limit middleware или лимиты на proxy уровне.

### 4. Документация введена недавно, не вся дописана
Статус: **контекст принят**.

`check_docs.py` сейчас ругается на broken links/orphans/низкое покрытие. Причина: документация введена буквально в прошлом коммите, не все файлы успели быть описаны.

### 5. `verify_indexes.py` возвращает exit code 0 при ошибке подключения к БД
Статус: **долгий ящик**.

Скрипт пишет `CRITICAL ERROR`, но завершение успешное. Для CI в будущем лучше делать ненулевой exit code.

### 6. `server.ts` жёстко завязан на Docker paths
Статус: **долгий ящик**.

В проде сайт запускается. Возможная будущая задача — сделать локальный fallback для `DIST_DIR`/`STATIC_DIR` через env.

### 7. Production backend port открыт наружу
Статус: **отклонено**.

Текущая схема требует такого проброса. Не предлагать как ближайшую задачу.

### 8. `.env.api` логика в deploy workflow
Статус: **непонятно / отложено**.

В workflow есть логика `.env.api`, при этом compose сейчас использует `.env`. Требует отдельного разбора деплоя, не является текущей задачей.

### 9. Upsert профиля через delete + insert
Статус: **долгий ящик**.

Возможны конкурентные гонки по `user_id`; будущая задача — транзакционный upsert/lock/IntegrityError retry.

### 10. Mutable defaults в SQLModel/Pydantic моделях
Статус: **долгий ящик**.

Можно заменить `default=[]`/`default={}` на `default_factory=list/dict`, но это не текущий приоритет.

### 11. `@ts-ignore` во frontend
Статус: **игнор / очень долгий ящик**.

Есть несколько `@ts-ignore` для AOS/Bun/Cloudflare окружения. Не трогать сейчас.

---

## Из фронтенд-анализа до перехода к странице «Предметы»

### SEO / item functions
Статус: **долгий ящик**.

- Возможный slug mismatch для `Robo Rat 2.0` между SPA и Cloudflare function.
- `robots.txt` указывает на `/sitemap.xml`, а sitemap function находится под `/api/sitemap`.
- Есть дублирование `functions/item/[id].ts` и `functions/api/item/[id].ts`.

### Profile page
Статус: **долгий ящик**.

- В `ScreenshotManager` стили `.profile-header` лучше восстанавливать через `finally`.
- В `HeaderRenderer` fallback paths для hero/rank имеют casing-риск.
- `fromBack` в `ItemDetailManager` нигде не выставляется.

### Router / SPA lifecycle
Статус: **долгий ящик**.

- Менеджеры с `requestAnimationFrame`/`setTimeout` желательно защищать `destroyed`-флагом.
- `Gen.navigate()` игнорирует быстрые клики во время `isNavigating`.

### Static / PWA / SEO
Статус: **долгий ящик**.

- В `index.html` указан `/images/og-image.png`, но файл не найден.
- Есть два `_headers`; реально в dist попадает `static/_headers`, где hashed assets кешируются на 60 секунд, а не на год.

---

## Предварительный backlog по странице «Предметы» из прошлого сообщения

Статус: **перенесено сюда, не считать финальным анализом страницы**.

- `ItemsManager.ts` и `ItemsFilterManager.ts` — главные hotspot-файлы страницы.
- `Fuse.js` создаёт индекс, но фактического `fuse.search()` в выдаче нет.
- `{Relevance}` сейчас выглядит как не полностью реализованный режим сортировки.
- Активное состояние filter chips может рассинхронизироваться с query после обычного ввода.
- Нет нормального empty state при нулевой выдаче.
- `ItemsManager.ts` стоит в будущем разрезать на search input / filter panel / grid-renderer / infinite scroll / rich-query renderer.

Текущий фокус после этого файла: **читать и анализировать конкретно страницу `Frontend/Web/ground/branches/items`**.
