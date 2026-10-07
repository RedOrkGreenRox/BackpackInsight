# [Режим слабых устройств (_low-res.scss)](/Backend/crates/branches/style/roots/_roots/_low-res.scss)

## Назначение
Этот файл содержит логику «экстремальной оптимизации» производительности. Она активируется динамически классом `.low-res-mode` на теге `<body>` для слабых мобильных устройств или медленных соединений.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/roots/_roots/_low-res.scss](/docs/Frontend/ground/roots/_roots/_low-res.md).
Общие стили каркаса: подключаются в [site.scss](../../site.md) глобально.

## Содержимое
- Классы и id: `.sidebar`, `.sidebar-overlay`, `.item-card`, `.load-more-btn`, `.nav-tab`, `#parallax-container`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
