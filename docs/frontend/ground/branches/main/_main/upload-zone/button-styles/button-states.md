# [Состояния кнопки (button-states.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/button-styles/button-states.scss)

## Назначение
Интерактивные состояния `:hover`/`:active` кнопки `.button-view-profile` с неоновым свечением azure.

## Задаваемые стили

### `.button-view-profile:hover`
*   Неоновое свечение: `box-shadow: 0 0 20px var(--azure), inset 0 0 10px rgba(255,255,255,0.1)`.
*   Движение: `transform: translateY(-2px)`.
*   Подсветка: `background: rgba(0,0,0,0.7)`; `border-color: rgba(var(--azure-raw),0.6)`.

### `.button-view-profile:active`
*   `transform: translateY(2px)` — эффект нажатия.
*   `box-shadow: 0 0 10px var(--azure)`; `filter: brightness(0.9)`.

## AI-контекст
*   Свечение завязано на `--azure`/`--azure-raw`. Базовые размеры/типографику не трогает — только состояния.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
