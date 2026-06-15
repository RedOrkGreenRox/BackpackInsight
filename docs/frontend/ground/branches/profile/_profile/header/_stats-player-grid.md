# [Грид ресурсов игрока (_stats-player-grid.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/header/_stats-player-grid.scss)

## Назначение
Стили блока ресурсов/валют игрока `.stats-grid` в шапке: иконки валют и числовые значения с адаптивными размерами через `clamp()`.

## Задаваемые стили
### `.profile-header .stats-grid`
*   `display:flex; flex-wrap:wrap; justify-content:center; align-items:center; width:fit-content; height:fit-content; max-width:100%; flex:0 1 auto`.
*   Адаптивные отступы: `gap: clamp(10px,2vmin,20px); padding: clamp(8px,1.5vmin,15px)`.
*   `border-radius:15px; background: rgba(0,0,0,0.5); transition: all 0.3s cubic-bezier(...)`.
*   `:hover`: `box-shadow: 0 0 16px rgba(var(--azure-raw),0.8); transform: translateY(3px)`.
### `.stat-player-card`
*   `display:flex; align-items:center; padding:0 5px`.
### Иконки валют (`picture/img`)
*   `width/height: clamp(20px,4vmin,32px); margin-right:6px; object-fit:contain` (img внутри picture — на 100%).
### `.stat-value`
*   `font-size: clamp(14px,3vmin,20px); font-weight:bold; color:#fff; white-space:nowrap`.

## AI-контекст
*   Все размеры через `clamp()` с единицей `vmin` — намеренно, чтобы и иконки, и цифры масштабировались плавно без гигантизма на больших мониторах.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
