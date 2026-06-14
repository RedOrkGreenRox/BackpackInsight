# [Скрытые элементы (visually-hidden.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/zone-styles/visually-hidden.scss)

## Назначение
Утилитарный класс для скрытия элементов (например, невидимого `input type="file"`) так, чтобы они оставались доступными для браузера и скринридеров, но не были видны пользователю.

## Ключевая логика
Использует технику `clip`, `width: 1px`, `height: 1px` для «честного» скрытия без `display: none`.
