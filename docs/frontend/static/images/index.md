# 🖼 Изображения (images/)

## Назначение
Корневой узел всех графических ассетов проекта. Каждая подпапка хранит изображения в двух (а для иконок установки — трёх) форматах: **AVIF** (приоритет) и **WebP** (fallback), разложенных по подпапкам `avif/`/`webp/`. Выбор формата на рантайме делает [ImageFormatService](../../ground/utils/ImageFormatService.md).

## Категории
| Папка | Что внутри | Основные потребители |
| :--- | :--- | :--- |
| [items/](items/index.md) | ~1100 иконок предметов (по 2 формата) | [ImageFormatService](../../ground/utils/ImageFormatService.md), [item/[id].ts](../../functions/item/[id].md) |
| [fonticon/](fonticon/index.md) | Иконки статов/механик/типов для парсера текста | [icon-parser.ts](../../ground/utils/icon-parser.md), [ItemsBranch](../../ground/branches/items/ItemsBranch.md) |
| [heroes/](heroes/index.md) | Портреты героев и их скины (по папке на героя) | [hero-card.ts](../../ground/branches/profile/_profile/heroes/hero-card.md), [ProfileSkinsManager](../../ground/branches/profile/_profile/managers/ProfileSkinsManager.md) |
| [profile/](profile/index.md) | Иконки UI профиля (валюты, лиги, карты редкости, разное) | [header.ts](../../ground/branches/profile/_profile/header/header.md), [stats-bar.ts](../../ground/branches/profile/_profile/header/stats-bar.md) |
| [area/](area/index.md) | 20 фонов зон (area01…area20) | [header.ts](../../ground/branches/profile/_profile/header/header.md), [Shell](../../ground/roots/Shell.md) |
| [404/](404/index.md) | 5 фонов по редкости для страницы ошибки | [Shell](../../ground/roots/Shell.md), [фон 404](../../ground/branches/404/_404/background/background.md) |
| [const/](const/index.md) | Постоянные ассеты: logo, menu, placeholder | [sw.js](../sw.md), [index.html](../../index.html.md) |
| [placeholder/](placeholder/index.md) | Заглушка на случай отсутствия картинки | [ImageFormatService](../../ground/utils/ImageFormatService.md) |
| [templates/](templates/index.md) | Превью/баннеры разделов | [index.html](../../index.html.md) |
| [manifest/](manifest/index.md) | Иконки установки PWA (avif/webp/png, 72…512) | [manifest.json](../manifest.md), [index.html](../../index.html.md) |

## AI-контекст
*   **Двухформатная стратегия (AVIF→WebP)**: не ссылайтесь на конкретный формат вручную — используйте [ImageFormatService](../../ground/utils/ImageFormatService.md), который сам подставит поддерживаемый. Манифест PWA — исключение (нужен ещё PNG для совместимости).
*   Имена файлов предметов/героев — слаги (lowercase, дефисы); согласованы с [SlugService](../../ground/utils/SlugService.md) и [ItemIconService](../../ground/utils/ItemIconService.md).

---

> 📌 **Подпись документации:** создано для папок изображений как узлов-целей ссылок (полное покрытие сети документации).
