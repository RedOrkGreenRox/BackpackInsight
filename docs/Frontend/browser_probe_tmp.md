# [Разовый замер сайта в браузере (browser_probe_tmp.cjs)](/Frontend/Web/browser_probe_tmp.cjs)

## Назначение
Разовый замер живого сайта в браузере через Playwright (CommonJS-скрипт, запускается `node browser_probe_tmp.cjs`). Ни сборка, ни сервер его не используют. Судя по имени и жёстко заданному пути вывода, это временный файл из WIP-коммита.

## Ключевое
- Открывает в headless Chromium три адреса `https://backpackinsight.pages.dev/`: главную, `/items` и `/item/wooden-sword`. Окно 1365×768, service worker заблокирован, каждая страница в новом контексте.
- Ждёт `load`, затем до 10 с `networkidle` и ещё 1 с.
- Собирает:
  - по каждому завершённому запросу: адрес, метод, тип, статус, размеры заголовков и тела, `content-type`, `cache-control`, `content-encoding`;
  - Navigation Timing (DCL, load, размеры документа), paint-метки (FCP) и Resource Timing;
  - число детей `#app` и карточек `.item-card`/`.item-card-link`.
- Пишет всё в `/home/user/prod_probe/browser_metrics.json` (путь жёстко задан и есть не на каждой машине) и печатает сводку: время, DCL, load, FCP, объёмы по типам ресурсов и 12 самых тяжёлых запросов.

## Связи
- Зависимость `playwright` объявлена в [package.json](package.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
