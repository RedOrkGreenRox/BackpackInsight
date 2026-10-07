# [Стили состояний загрузки (loading-states.scss)](../../../../../Frontend/Web/ground/utils/_loading-states/loading-states.scss)

## Назначение
Реализация визуальных эффектов для индикаторов ожидания и скелетных экранов.

---

## Ключевые анимации

### 1. `skeleton-shimmer` (Блик)
Создает эффект движущегося светового блика на серых блоках. Реализуется через анимированное смещение градиентного фона (`background-position`).

### 2. `skeleton-pulse` (Пульсация)
Плавное изменение прозрачности всего блока, создающее эффект "дыхания" загружающегося интерфейса.

---

## Описание компонентов

### Скелеты (`.skeleton-card`, `.skeleton-profile`)
*   Используют крайне низкую контрастность (`rgba(255, 255, 255, 0.05)`), чтобы не слепить пользователя в темной теме.
*   Содержат вложенные элементы (avatar, title, text) с фиксированной высотой для предотвращения скачков верстки.

### Спиннеры (`.spinner`)
*   Три типоразмера: 20px, 32px, 48px.
*   Цветовой акцент: Верхняя дуга окрашена в зеленый цвет PWA (`#4CAF50`).

---

## Оптимизация
В режиме [**Low-Res Mode**](../../roots/_roots/_low-res.md) все анимации бликов и пульсаций отключаются, а спиннеры заменяются на статичные индикаторы для экономии ресурсов процессора.

## Все селекторы
| Группа | Селекторы | Что это |
| :--- | :--- | :--- |
| Карточка | `.skeleton-card`: `.skeleton-image`, `.skeleton-content`, `.skeleton-title`, `.skeleton-text`, `.skeleton-meta`, `.skeleton-badge` | заглушка карточки предмета (`createCardSkeleton`) |
| Профиль | `.skeleton-profile`: `.skeleton-header`, `.skeleton-avatar`, `.skeleton-info`, `.skeleton-name`, `.skeleton-level`, `.skeleton-stats`, `.skeleton-stat` | заглушка шапки профиля (`createProfileSkeleton`) |
| Прогресс | `.progress-container`: `.progress-label`, `.progress-bar`, `.progress-fill`, `.progress-text` | полоса прогресса (`createProgressBar`) |
| Спиннер | `.spinner`, `.spinner-circle`, `.spinner-small`, `.spinner-medium`, `.spinner-large` | вращающийся круг трёх размеров, анимация `spin` |
| Страница | `.page-loading`, `.loading-text` | полноэкранная загрузка (`showPageLoading`) |
| Экономия | `.low-res-mode` | без анимаций скелетов и спиннера |

Разметку для всех них строит [LoadingStates.ts](../LoadingStates.md).

---

> 📌 **Подпись документации:** атомарный стиль системных сервисов · 2026-06-15; селекторы сверены с исходником · 2026-10-06
