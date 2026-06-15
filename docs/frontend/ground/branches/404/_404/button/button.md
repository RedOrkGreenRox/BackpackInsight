# [Кнопка 404: рендер + стили (button.ts / button.scss)](../../../../../../../Frontend/Web/ground/branches/404/_404/button/button.ts)

> Два файла: [button.ts](../../../../../../../Frontend/Web/ground/branches/404/_404/button/button.ts) (HTML) и [button.scss](../../../../../../../Frontend/Web/ground/branches/404/_404/button/button.scss) (стили).

## Назначение
Кнопка возврата на главную: `ButtonRenderer` генерирует разметку, `.btn-404` оформляет её в стиле «тёмное стекло».

## Связи (Dependencies)
*   [Локализация (i18n)](../../../../localization/i18n.md): текст `t('not_found_button')`.
*   Поведение клика навешивает [NavigationManager](../navigation/navigation.md) по `id="homeBtn"`.

## Логика (button.ts)
*   `static render(): string` → `<button id="homeBtn" class="btn-404">{перевод}</button>`.

## Стили (button.scss) — `.btn-404`
*   Геометрия: `padding:14px 45px; border-radius:50px; display:inline-block`.
*   Стекло: `background: rgba(0,0,0,0.8)`; `border:2px solid rgba(255,255,255,0.5)`.
*   Текст: `color: var(--text-default-color); font-size:1.1em; font-weight:bold; text-transform:uppercase; letter-spacing:2px`.
*   `box-shadow:0 5px 15px rgba(0,0,0,0.3); transition: all 0.2s ease-out`.
*   `&:hover`: фон `rgba(255,255,255,0.15)`, `border-color:#fff`, `translateY(-2px) scale(1.02)`, свечение `0 0 20px rgba(255,255,255,0.4)`.
*   `&:active`: `translateY(1px) scale(0.98)`, внутренняя тень `inset 0 2px 5px rgba(0,0,0,0.5)`.

## AI-контекст
*   `id="homeBtn"` — контракт с навигацией. Цвет текста — через переменную дизайна, не hex.

---

> 📌 **Подпись документации:** создано/актуализировано при рефактор-документировании (приоритет по глубине; объединены `.ts` и `.scss` одного компонента).
