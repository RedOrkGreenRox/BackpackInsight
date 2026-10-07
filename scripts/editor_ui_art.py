"""Картинки редактора из архивов игры: фоны, иконки кнопок и портреты героев.

Оригиналы не меняются: скрипт читает их прямо из zip-архивов ContentKit,
обрезает и пишет AVIF и WebP в Frontend/Web/static/images/editor/.
Фоны есть только в архиве 3.0, иконки и портреты берутся из 7.0.

    python3 scripts/editor_ui_art.py /mnt/project-files/3.0_ContentKit.zip /mnt/project-files/7.0ContentKit.zip
"""

import io
import sys
import zipfile
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent.parent / 'Frontend' / 'Web' / 'static' / 'images' / 'editor'

# Рамка с сеткой 9 × 6 без досок по бокам. Сетка внутри обрезки: x 21..664, y 21..448,
# клетка ≈ 71.4 px; отступы рамки в клетках записаны в style/branches/editor/_field.scss.
FRAME = (180, 2, 867, 466)

# Фоны из архива 3.0: имя на выходе → (путь внутри архива, обрезка или None).
BACKGROUNDS = {
    'inventory': ('ui/GameElements/Inventory.png', FRAME),
    'inventory-bag-mode': ('ui/GameElements/InventoryBagMode.png', FRAME),
    'storage': ('ui/Backgrounds/Storage.png', None),
}

# Иконки кнопок из архива 7.0: имя на выходе → путь внутри архива.
ICONS = {
    'reset': 'ui/Icons/System/arrows-undo.png',
    'bag-mode': 'ui/Icons/System/Bag.png',
    'stash-list': 'ui/Icons/System/bars.png',
    'stash-gravity': 'ui/Icons/System/caret-down.png',
    'info': 'ui/Icons/System/InfoIcon.png',
}

# Портреты героев из архива 7.0 (Shared — значок «герой не выбран»).
HEROES = 'FontIconAssets/HeroIcons/'


def find(archive: zipfile.ZipFile, tail: str) -> str:
    """Полное имя файла в архиве по концу пути (корневая папка у архивов разная)."""
    for name in archive.namelist():
        if name.endswith(tail):
            return name
    raise SystemExit(f'нет {tail} в архиве')


def save(image: Image.Image, out: Path) -> None:
    """Пишет AVIF и WebP рядом и печатает размер."""
    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out.with_suffix('.avif'), quality=70)
    image.save(out.with_suffix('.webp'), quality=85, method=6)
    print(f'{out.relative_to(OUT)}: {image.width}×{image.height}')


def read(archive: zipfile.ZipFile, name: str) -> Image.Image:
    return Image.open(io.BytesIO(archive.read(name))).convert('RGBA')


def main(kit3: str, kit7: str) -> None:
    with zipfile.ZipFile(kit3) as archive:
        for out, (tail, box) in BACKGROUNDS.items():
            image = read(archive, find(archive, tail))
            save(image.crop(box) if box else image, OUT / out)
    with zipfile.ZipFile(kit7) as archive:
        for out, tail in ICONS.items():
            save(read(archive, find(archive, tail)), OUT / 'icons' / out)
        for name in archive.namelist():
            if HEROES in name and name.endswith('.png'):
                hero = Path(name).stem.lower()
                save(read(archive, name), OUT / 'heroes' / hero)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('использование: editor_ui_art.py <ContentKit 3.0 .zip> <ContentKit 7.0 .zip>')
    main(sys.argv[1], sys.argv[2])
