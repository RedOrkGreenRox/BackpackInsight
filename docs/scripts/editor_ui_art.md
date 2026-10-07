# [Картинки редактора из архивов игры (editor_ui_art.py)](../../scripts/editor_ui_art.py)

## Назначение
Делает картинки страницы «Редактор» из картинок игры: рамку инвентаря с каменной сеткой 9 × 6, её оранжевый вариант для режима сумок, фон склада, иконки кнопок и портреты героев. Оригиналы не меняются: скрипт читает их прямо из zip-архивов ContentKit — фоны из 3.0 (в архивах 4.0–7.0 их нет), иконки и портреты из 7.0 — и пишет AVIF и WebP в `Frontend/Web/static/images/editor/` ([папка](/docs/Frontend/static/images/editor/index.md)).

## Запуск
`python3 scripts/editor_ui_art.py /mnt/project-files/3.0_ContentKit.zip /mnt/project-files/7.0ContentKit.zip`

## Ключевая функциональность
- `OUT` — папка на выходе.
- `FRAME` = `(180, 2, 867, 466)` — обрезка рамки без досок по бокам. Сетка внутри обрезки: x 21..664, y 21..448, клетка ≈ 71.4 px. Отступы рамки в клетках записаны в [_field.scss](/docs/RBackend/crates/branches/style/branches/editor/_field.md) (`.ed-frame`); при смене обрезки их надо пересчитать.
- `BACKGROUNDS` — имя на выходе → путь в архиве 3.0 и обрезка: `inventory` (`ui/GameElements/Inventory.png`), `inventory-bag-mode` (`ui/GameElements/InventoryBagMode.png`), `storage` (`ui/Backgrounds/Storage.png`, без обрезки).
- `ICONS` — иконки кнопок из 7.0 (`ui/Icons/System/`) в `icons/`: `reset` (`arrows-undo`), `bag-mode` (`Bag`), `stash-list` (`bars`), `stash-gravity` (`caret-down`), `info` (`InfoIcon`).
- `HEROES` — круглые значки героев 7.0 (`FontIconAssets/HeroIcons/`, 48 × 48) в `heroes/<герой>`; `shared` — значок «герой не выбран».
- `find(archive, tail)` — полное имя файла по концу пути: корневая папка у архивов разная.
- `read(archive, name)` — картинка из архива в RGBA; `save(image, out)` — пишет AVIF и WebP и печатает размер.
- `main(kit3, kit7)` — все три группы.

## Связи
- Картинки предметов делает крейт [art](/docs/RBackend/crates/art/src/main.md); там же «открытые» сумки (`Medium Bag open`), которые редактор показывает на поле.

---
> 📌 **Подпись документации:** по исходнику · 2026-10-07
