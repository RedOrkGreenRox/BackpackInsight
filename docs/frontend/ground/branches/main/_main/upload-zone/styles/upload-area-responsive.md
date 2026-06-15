# [Адаптивность области загрузки (upload-area-responsive.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/styles/upload-area-responsive.scss)

## Назначение
Медиа-переопределения размеров `.upload-area` и её `textarea`. База — в [upload-area-base](upload-area-base.md) и [upload-area-textarea](upload-area-textarea.md).

## Задаваемые стили

### `@media (max-width: 768px)`
*   `.upload-area`: `min-height:200px; border-radius:15px`.
*   `.upload-area textarea`: `padding:15px; font-size:16px`.

### `@media (max-width: 480px)`
*   `.upload-area`: `min-height:150px; border-radius:12px; margin-bottom:15px`.
*   `.upload-area textarea`: `padding:12px; font-size:14px; line-height:1.4`.

## AI-контекст
*   На 768px кегль textarea держат ≥16px, чтобы iOS не зумил поле при фокусе; на 480px — компромисс 14px по высоте.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
