# [Разбор баннеров (banners.rs)](/Backend/crates/core/src/profile/unlocks/banners.rs)

## Назначение
`BannerService` разбирает строку разблокировки баннера вида `{имя}Banner…`.

## `parse(unlock)`
Ищет маркер `Banner` (`BANNER_MARKER`); имя баннера — часть строки до маркера, она должна быть корректным `UnlockName` ([types](types.md)). Всё после маркера игнорируется.

Примеры: `Season01Banner01` → `Season01`; `birthdayBanner01` → `birthday`; `Banner01` и `bad-nameBanner01` — `None`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
