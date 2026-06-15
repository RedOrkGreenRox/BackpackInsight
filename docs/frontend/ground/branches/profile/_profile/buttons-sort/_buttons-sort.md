# [Стили кнопок сортировки (_buttons-sort.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/buttons-sort/_buttons-sort.scss)

## Назначение
Стили панели сортировки профиля: контейнер `.sort-controls`, кнопки выбора режима `.sort-btn` и кнопка инверсии `.invert-icon-btn`, включая эффект «расступания» кнопок при наведении.

## Связи (Dependencies)
*   Переменные акцента `--azure-raw` из [_vars](../../../../roots/_roots/_vars.md).
*   Логику кликов/состояний обслуживает [SortController](../sort/SortController.md) (ids `#sortToggle`, `#invertToggle`).
*   Иконки кнопок — из [папки профиля (/images/profile/)](../../../../../static/images/profile/index.md).

## Задаваемые стили
### `.sort-controls`
*   `display:flex; justify-content:center; align-items:center; gap:10px; margin:25px 0; position:relative`.
### `.sort-btn` (Glass UI)
*   `background: rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.2); border-radius:50px; padding:10px 25px; box-shadow:0 5px 15px rgba(0,0,0,0.25)`.
*   Текст: `color:white; font-size:1em; font-weight:600; text-shadow:0 1px 3px rgba(0,0,0,0.6)`.
*   Иконка `picture/img` — `24×24` (`object-fit:contain`).
*   `:hover`: `translateY(-3px)`, azure-свечение `0 0 16px rgba(var(--azure-raw),0.6)`, иконка `scale(1.1)`.
*   `:active`: `translateY(1px)`, свечение слабее.
### `.invert-icon-btn`
*   Голая кнопка `64×64` (без фона/рамки); иконка `brightness(1.4) drop-shadow(... azure)`; hover/active со `scale`.
### Эффект «расступания»
*   `#sortToggle:hover ~ #invertToggle` → `translateX(30px)`; `.sort-controls:has(#invertToggle:hover) #sortToggle` → `translateX(-30px)` — кнопки разъезжаются при наведении на соседнюю (используется `:has()`).
### Адаптив
*   `≤768px`: меньше padding/иконок, `.invert-icon-btn` 56px.
*   `≤480px`: ещё компактнее, `flex-wrap`, эффект «расступания» **отключён** (`translateX(0)`).

## AI-контекст
*   Эффект расступания использует современный CSS `:has()` и комбинатор `~`. На мобильных он намеренно выключен. Все акценты завязаны на `--azure-raw` — не хардкодьте цвет свечения.

---

> 📌 **Подпись документации:** актуализировано при аудите (исправлена фактическая неточность описания стилей).
