"""Фоны редактора из архива игры: инвентарь, инвентарь в режиме сумок, склад.

Оригиналы не меняются: скрипт читает их прямо из zip-архива ContentKit 3.0
(в новых архивах этих картинок нет), обрезает и пишет AVIF и WebP в
Frontend/Web/static/images/editor/.

    python3 scripts/editor_ui_art.py /mnt/project-files/3.0_ContentKit.zip
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

# Имя на выходе → (путь внутри архива, обрезка или None).
SOURCES = {
    'inventory': ('ui/GameElements/Inventory.png', FRAME),
    'inventory-bag-mode': ('ui/GameElements/InventoryBagMode.png', FRAME),
    'storage': ('ui/Backgrounds/Storage.png', None),
}


def find(archive: zipfile.ZipFile, tail: str) -> str:
    """Полное имя файла в архиве по концу пути (корневая папка у архивов разная)."""
    for name in archive.namelist():
        if name.endswith(tail):
            return name
    raise SystemExit(f'нет {tail} в архиве')


def main(kit: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(kit) as archive:
        for out, (tail, box) in SOURCES.items():
            image = Image.open(io.BytesIO(archive.read(find(archive, tail)))).convert('RGBA')
            if box:
                image = image.crop(box)
            image.save(OUT / f'{out}.avif', quality=70)
            image.save(OUT / f'{out}.webp', quality=85, method=6)
            print(f'{out}: {image.width}×{image.height}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('использование: editor_ui_art.py <ContentKit 3.0 .zip>')
    main(sys.argv[1])
