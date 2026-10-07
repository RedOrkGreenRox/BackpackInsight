#!/usr/bin/env python3
"""Статичная страница с графом ссылок документации: один HTML-файл без сервера.

Запуск: python3 scripts/docs_graph/build.py [путь/к/файлу.html] [--fragment]
--fragment пишет страницу без <!doctype>/<head> — в таком виде её принимает публикация Artifact.
"""
from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

from docs_lint.files import ROOT, read  # noqa: E402

sys.path.insert(0, HERE)
from collect import collect  # noqa: E402

DEFAULT_OUT = os.path.join('target', 'docs-graph.html')
SCRIPTS = ('sim.js', 'pack.js', 'layers.js', 'view.js', 'panel.js')
HEAD = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<style>body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n')


def page(data: dict, fragment: bool) -> str:
    html = read(os.path.join(HERE, 'page.html'))
    js = '\n'.join(read(os.path.join(HERE, name)) for name in SCRIPTS)
    payload = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c')
    # Скрипты подставляются раньше данных: в тексте документов сами маркеры тоже встречаются.
    body = html.replace('/*SCRIPTS*/', js, 1).replace('/*DATA*/', payload, 1)
    return body if fragment else HEAD + body + '\n</body>\n</html>\n'


def main() -> int:
    os.chdir(ROOT)
    args = [a for a in sys.argv[1:] if a != '--fragment']
    out = args[0] if args else DEFAULT_OUT
    data = collect()
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write(page(data, '--fragment' in sys.argv))
    print(f"{out}: {len(data['nodes'])} узлов, {len(data['edges'])} связей")
    return 0


if __name__ == '__main__':
    sys.exit(main())
