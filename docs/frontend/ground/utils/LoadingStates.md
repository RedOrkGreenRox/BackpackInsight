# [Состояния загрузки (LoadingStates.ts)](../../../../Frontend/Web/ground/utils/LoadingStates.ts)

## Назначение
Статический класс-генератор HTML для состояний ожидания: skeleton-карточки, skeleton-профиль, прогресс-бар и спиннер. Только генерирует разметку — показ/скрытие делает вызывающий код.

## Связи (Dependencies)
*   **Стили**: [визуальные стили загрузки](_loading-states/loading-states.md) (классы `.skeleton-*`, `.progress-*`, `.spinner`).
*   [Локализация (i18n)](../localization/i18n.md): импортирует `t` для подписей.
*   Потребители: [ItemDetailRenderer](../branches/itemDetail/_itemDetail/components/ItemDetailRenderer.md) (скелетоны), [ItemsBranch](../branches/items/ItemsBranch.md), менеджеры профиля.

## Подробное описание методов (все `static`)
*   `createCardSkeleton(count=6): string` — генерирует `count` «мерцающих» карточек-заглушек (`.skeleton-card` с image/title/text/meta).
*   `createProfileSkeleton(): string` — каркас шапки профиля (avatar/name/level + три `.skeleton-stat`).
*   `createProgressBar(label, progress=0): string` — индикатор прогресса (`.progress-container/.progress-bar/.progress-fill/.progress-text`).
*   `createSpinner(size='medium'): string` — спиннер (`.spinner.spinner-<small|medium|large>`).

## AI-контекст
*   **Важно**: это «фабрика разметки», без методов `setLoading/withLoading/isLoading` (их нет). Логику показа/скрытия и обёртку промисов реализует вызывающий код. При добавлении нового состояния добавляйте метод-генератор сюда и парные стили в [loading-states.scss](_loading-states/loading-states.md).

---

> 📌 **Подпись документации:** актуализировано линтером check_docs.py (исправлены несуществующие методы на реальный API).
