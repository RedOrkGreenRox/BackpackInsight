# [Фоны редактора из архива игры (editor_ui_art.py)](../../scripts/editor_ui_art.py)

## Назначение
Делает фоны страницы «Редактор» из картинок игры: рамку инвентаря с каменной сеткой 9 × 6, её оранжевый вариант для режима сумок и фон склада. Оригиналы не меняются: скрипт читает их прямо из zip-архива ContentKit 3.0 (в архивах 4.0–7.0 этих картинок нет) и пишет AVIF и WebP в `Frontend/Web/static/images/editor/` ([папка](/docs/Frontend/static/images/editor/index.md)).

## Запуск
`python3 scripts/editor_ui_art.py /mnt/project-files/3.0_ContentKit.zip`

## Ключевая функциональность
- `OUT` — папка на выходе.
- `FRAME` = `(180, 2, 867, 466)` — обрезка рамки без досок по бокам. Сетка внутри обрезки: x 21..664, y 21..448, клетка ≈ 71.4 px. Отступы рамки в клетках записаны в [_field.scss](/docs/RBackend/crates/branches/style/branches/editor/_field.md) (`.ed-frame`); при смене обрезки их надо пересчитать.
- `SOURCES` — имя на выходе → путь в архиве и обрезка: `inventory` (`ui/GameElements/Inventory.png`), `inventory-bag-mode` (`ui/GameElements/InventoryBagMode.png`), `storage` (`ui/Backgrounds/Storage.png`, без обрезки).
- `find(archive, tail)` — полное имя файла по концу пути: корневая папка у архивов разная.
- `main(kit)` — режет и сохраняет оба формата, печатает размеры.

## Связи
- Картинки предметов делает крейт [art](/docs/RBackend/crates/art/src/main.md); там же «открытые» сумки (`Medium Bag open`), которые редактор показывает на поле.

---
> 📌 **Подпись документации:** по исходнику · 2026-10-07
