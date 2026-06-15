# [Фон 404: логика + стили (background.ts / background.scss)](../../../../../../../Frontend/Web/ground/branches/404/_404/background/background.ts)

> Компонент состоит из двух файлов: [background.ts](../../../../../../../Frontend/Web/ground/branches/404/_404/background/background.ts) (логика) и [background.scss](../../../../../../../Frontend/Web/ground/branches/404/_404/background/background.scss) (стили).

## Назначение
Управление полноэкранным «редкостным» фоном страницы 404: класс `BackgroundManager` выбирает редкость и просит [Shell](../../../../roots/Shell.md) её отрисовать, а `.bg-404` задаёт растяжку фонового изображения на весь вьюпорт.

## Связи (Dependencies)
*   [Оболочка (Shell)](../../../../roots/Shell.md): фактическая отрисовка фона.
*   [Страница 404 (NotFoundBranch)](../../NotFoundBranch.md): вызывает менеджер при входе/выходе.
*   **Изображения**: фоны берутся из [папки фонов 404 (/images/404/)](../../../../../static/images/404/index.md).

## Логика (background.ts) — `BackgroundManager`
*   Состояние: `currentRarity`, `isLanguageChanging`, `preservedRarity`.
*   `set404Background()` — приоритет у `preservedRarity`; при смене языка держит текущую; иначе генерирует по вероятностям: `04` 0.1%, `03` 0.9%, `02` 4%, `01` 15%, `00` 80%. Добавляет `body.error-404` и зовёт `Shell.set404Background`.
*   `restoreNormalBackground()` — снимает `error-404`, возвращает обычный фон; при смене языка сохраняет редкость.
*   `is404Background()`, `refresh404Background()` (та же редкость), `setLanguageChanging(flag)`.

## Стили (background.scss)
### `.bg-404`
*   `position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-2; overflow:hidden; background-color:#000`.
### `.bg-404 picture, .bg-404 img`
*   `position:absolute; width:100%; height:100%; object-fit:cover; object-position:center; transition: filter 0.3s ease`.

## AI-контекст
*   `error-404` на `<body>` — единая точка блокировки скролла (см. [body.scss](../body/body.md)). `z-index:-2` держит фон под [overlay](../overlay/overlay.md) (`-1`).

---

> 📌 **Подпись документации:** создано/актуализировано при рефактор-документировании (приоритет по глубине; объединены `.ts` и `.scss` одного компонента).
