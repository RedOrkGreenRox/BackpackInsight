# [style/utils/_loading-states/loading-states.scss](/RBackend/crates/branches/style/utils/_loading-states/loading-states.scss)

## Назначение
Реализация визуальных эффектов для индикаторов ожидания и скелетных экранов.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/utils/_loading-states/loading-states.scss](/docs/Frontend/ground/utils/_loading-states/loading-states.md).
Общие стили: подключаются через `roots/_roots.scss` из [site.scss](../../site.md) глобально.

## Содержимое
- Классы и id: `.skeleton-card`, `.skeleton-image`, `.skeleton-content`, `.skeleton-title`, `.skeleton-text`, `.skeleton-meta`, `.skeleton-badge`, `.skeleton-profile`, `.skeleton-header`, `.skeleton-avatar`, `.skeleton-info`, `.skeleton-name`, `.skeleton-level`, `.skeleton-stats`, `.skeleton-stat`, `.progress-container`, `.progress-label`, `.progress-bar`, `.progress-fill`, `.progress-text`, `.spinner`, `.spinner-circle`, `.spinner-small`, `.spinner-medium`, `.spinner-large`, `.page-loading`, `.loading-text`, `.low-res-mode`.
- Анимации: `@keyframes skeleton-pulse`, `@keyframes skeleton-shimmer`, `@keyframes spin`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
