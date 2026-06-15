# [Поле ввода поиска (_input.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/search/_input.scss)

## Назначение
Стили инпута поиска `.search-input` (таблетка с центрированным текстом и azure-фокусом). Обёртка — в [_container](_container.md).

## Задаваемые стили
### `.search-input`
*   `width:100%; padding:15px 25px; border-radius:50px; text-align:center; outline:none`.
*   Стекло: `background: rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.2)`.
*   Текст: `color: var(--text-default-color); font-size:1.2rem; font-family:'Signika'; text-shadow:0 1px 2px rgba(0,0,0,0.5)`.
*   `&::placeholder`: `color: rgba(255,255,255,0.5)`.
*   `&:focus`: `border-color: var(--azure); box-shadow: 0 0 15px rgba(var(--azure-raw),0.3)`.
*   `transition: border-color 0.3s ease, box-shadow 0.3s ease`.

## AI-контекст
*   Адаптивные размеры — в [_tablet](../responsive/_tablet.md)/[_mobile](../responsive/_mobile.md). Фокус-свечение завязано на `--azure-raw`.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
