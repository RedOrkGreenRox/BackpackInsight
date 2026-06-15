# [Стили главной страницы (main.scss)](../../../../../Frontend/Web/ground/branches/main/main.scss)

## Назначение
Корневой агрегатор стилей главной страницы (загрузка/вставка профиля). Собирает все модули главной через `@use`.

## Связи (Dependencies)
*   [Стили зоны загрузки](_main/upload-zone.md) (и её под-стили: [upload-area](_main/upload-zone/upload-area.md), [upload-hint](_main/upload-zone/upload-hint.md), [button-view-profile](_main/upload-zone/button-view-profile.md)).
*   [Стили заголовка](_main/title/styles/index.md), [стили контейнера](_main/container/styles/index.md), [локальные анимации](_main/animations/animations.md).

## Ключевая логика
*   Через `@use` объединяет модули главной в единый бандл (CSS не сплитится — см. [vite.config](../../../vite.config.md), `cssCodeSplit:false`).

## AI-контекст
*   Barrel-файл: добавляя новый блок главной, подключайте его здесь и держите атомарные стили в `_main/*`. HTML-структуру даёт [MainBranch](MainBranch.md).

---

> 📌 **Подпись документации:** актуализировано при аудите (полнота, точность, ссылки).
