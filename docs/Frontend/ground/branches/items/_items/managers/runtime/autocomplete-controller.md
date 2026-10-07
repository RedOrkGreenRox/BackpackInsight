# [Подсказка-автодополнение в поиске (autocomplete-controller.ts)](/Frontend/Web/ground/branches/items/_items/managers/runtime/autocomplete-controller.ts)

## Назначение
`AutocompleteController` — подсказка-«призрак» в поле поиска `#itemSearch`: дописывает серым продолжение набираемого слова, если оно начинает имя героя, редкость или тип. Вызывается из [rich-input-controller](rich-input-controller.md) при вводе.

## Методы
- `handle(container)` — убирает старую подсказку, берёт слово перед кареткой (не короче 2 символов и не начинающееся с `[`, `<`, `{`, `(`), ищет совпадение и вставляет перед кареткой нередактируемый `span.ghost-suggestion` с остатком слова. Регистр остатка повторяет первую букву ввода.
- `hide(container)` — удаляет все подсказки.
- `findBestMatch(query)` — первое слово из `HERO_LIST`, `RARITY_LIST`, `TYPE_LIST` ([items-runtime-types](items-runtime-types.md)), которое начинается с ввода и не равно ему.

Принятие подсказки по клавише обрабатывает [rich-input-controller](rich-input-controller.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
