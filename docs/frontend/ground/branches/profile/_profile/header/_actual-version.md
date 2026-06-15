# [Версия приложения в шапке (_actual-version.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/header/_actual-version.scss)

## Назначение
Еле заметная подпись версии приложения в углу шапки профиля (`.actual-version` в контейнере `.actual-version-container`).

## Задаваемые стили
### `.profile-header .actual-version-container`
*   `position:absolute; bottom:2%; right:2%; z-index:5` — закреплена в правом нижнем углу шапки.
### `.profile-header .actual-version`
*   `font-size:0.3em; font-weight:300; white-space:nowrap`.
*   `color: rgba(255,255,255,0.15)` — почти прозрачная (ненавязчивая); `background:transparent`.

## AI-контекст
*   Намеренно низкая контрастность (alpha 0.15) — техническая подпись, не должна отвлекать.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
