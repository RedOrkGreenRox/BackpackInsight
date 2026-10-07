#!/usr/bin/env python3
"""Статичная страница с графом ссылок документации: один HTML-файл без сервера.

Запуск: python3 scripts/docs_graph/build.py [путь/к/файлу.html] [--fragment]
--fragment пишет страницу без <!doctype>/<head> — в таком виде её принимает публикация Artifact.
"""
from __future__ import annotations

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

from docs_lint.files import ROOT, all_docs, link_targets, read, resolve  # noqa: E402

DEFAULT_OUT = os.path.join('target', 'docs-graph.html')
SCRIPTS = ('sim.js', 'view.js', 'panel.js')
# Зона документа по началу пути: (префикс, ключ зоны). Первое совпадение побеждает.
ZONES = (
    ('docs/Backend/', 'rust'), ('docs/Frontend/', 'ts'),
    ('docs/scripts/', 'tools'), ('docs/data/', 'tools'),
)
# Язык исходника по расширению; доки без файла и доки папок — «doc», остальное — «data».
LANGS = {'rs': 'rust', 'ts': 'ts', 'js': 'ts', 'cjs': 'ts', 'scss': 'scss', 'py': 'py', 'ps1': 'py'}
# Карты, которые ссылаются почти на всё: по умолчанию их связи скрыты, иначе граф слипается в ком.
HUBS = {'docs/structure.md', 'README.md'}
H1_RE = re.compile(r'^#\s+(.*)$', re.M)
LINK_TEXT_RE = re.compile(r'\[([^\]]*)\]\([^)]*\)')


def zone(path: str) -> str:
    return next((z for prefix, z in ZONES if path.startswith(prefix)), 'meta')


def lang(src: str | None) -> str:
    if not src or os.path.isdir(src):
        return 'doc'
    name = os.path.basename(src)
    return LANGS.get(name.rsplit('.', 1)[-1], 'data') if '.' in name.lstrip('.') else 'data'


def title(path: str, text: str) -> str:
    """Текст H1 без ссылки; без H1 — имя файла."""
    m = H1_RE.search(text)
    raw = LINK_TEXT_RE.sub(r'\1', m.group(1)).strip() if m else ''
    return raw or os.path.basename(path)


def source_of(path: str) -> str | None:
    """Файл, на который ведёт ссылка в H1 (исходник или папка)."""
    first = read(path).split('\n', 1)[0]
    m = re.search(r'\]\(([^)\s]+)\)', first) if first.startswith('# ') else None
    if not m or m.group(1).startswith('http'):
        return None
    return resolve(path, m.group(1))


def collect() -> dict:
    docs = all_docs() + ['README.md']
    index = {d: i for i, d in enumerate(docs)}
    nodes, edges = [], set()
    for d in docs:
        text = read(d)
        src = source_of(d)
        nodes.append({'id': d, 'title': title(d, text), 'zone': zone(d), 'lang': lang(src), 'hub': d in HUBS,
                      'src': src, 'text': text})
        for t in link_targets(d):
            target = resolve(d, t)
            if target in index and target != d:
                edges.add((index[d], index[target]))
    return {'nodes': nodes, 'edges': sorted(edges)}


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
    print(f"{out}: {len(data['nodes'])} документов, {len(data['edges'])} связей")
    return 0


if __name__ == '__main__':
    sys.exit(main())
