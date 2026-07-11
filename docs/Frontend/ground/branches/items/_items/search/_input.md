# [База rich search input (_input.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/search/_input.scss)

## Назначение
`_input.scss` задаёт базовое поведение `#itemSearch`. После перехода с flex на обычный inline-flow этот файл критичен для возможности ставить каретку между чипами.

## Ключевые правила
- `display: block` вместо `flex`, чтобы inline-чипы не ломали caret.
- `white-space: pre-wrap`, чтобы реальные пробелы и caret-spacer работали как точки ввода.
- `word-break: break-word` для длинных запросов.
- Placeholder через `:empty::before`.

## Связи
- [caret-spacer](./_caret-spacer.md) — физические промежутки между atomic-элементами.
- [rich-token](./_rich-token.md), [rich-group](./_rich-group.md), [rich-operator](./_rich-operator.md).
- [rich-input-controller](../managers/runtime/rich-input-controller.md).

---

> 📌 **Подпись документации:** базовые стили rich input · 2026-06-17
