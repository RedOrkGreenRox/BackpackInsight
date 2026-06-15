# [Никнейм в шапке (_nickname.scss)](../../../../../../../Frontend/Web/ground/branches/profile/_profile/header/_nickname.scss)

## Назначение
Стили заголовка-никнейма игрока `.profile-header h4` (плашка-таблетка с hover-свечением и адаптивом).

## Задаваемые стили
### `.profile-header h4`
*   `position:relative; z-index:2; width:fit-content; margin-left:0`.
*   `font-size:2em; font-weight:300; color:white`.
*   Плашка: `background-color: rgba(0,0,0,0.7); padding:10px; border-radius:20px 10px 20px 10px` (асимметричное скругление).
*   `overflow:hidden; transition: all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)`.
### `:hover`
*   `box-shadow: 0 0 16px var(--azure); transform: translateY(2px)`.
### Адаптив
*   `≤768px`: `font-size:1.5em; padding:8px`.
*   `≤480px`: `font-size:1.2em; padding:6px; border-radius:15px 8px 15px 8px`.

## AI-контекст
*   Асимметричный `border-radius` — намеренный фирменный приём шапки; hover-свечение завязано на `--azure`.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
