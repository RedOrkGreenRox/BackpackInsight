# 🖼 Заглушка изображения (images/placeholder/)

## Назначение
Единая картинка-заглушка (`placeholder.avif`/`.webp`), показываемая, когда иконка предмета/героя не найдена или ещё не загрузилась.

## Связи (Dependencies)
*   Путь к заглушке отдаёт `ImageFormatService.placeholderSrc()` — см. [ImageFormatService](../../../ground/utils/ImageFormatService.md).
*   Используется при инициализации UI ([ui_init.ts](../../../ground/roots/_roots/shell/ui_init/ui_init.md)) и в [item/[id].ts](../../../functions/api/item/[id].md).

## AI-контекст
*   Не лежит в подпапках `avif/webp` — оба файла прямо в `placeholder/`. Это намеренно (особый случай в `ImageFormatService`).

---

> 📌 **Подпись документации:** создано для папок изображений как узлов-целей ссылок (полное покрытие сети документации).
