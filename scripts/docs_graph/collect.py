"""Данные графа: узлы (доки и исходники без зеркала), связи трёх видов, проблемы и группы для кластеров."""
from __future__ import annotations

import os
import re
from collections import defaultdict

from docs_lint.files import all_docs, all_sources, link_targets, read, resolve
from imports import imports
from problems import NO_MIRROR, doc_problems, mirror_index, missing_mirrors

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


# Связь — битовая маска: ссылка дока на док, импорт в коде (между исходниками их зеркал), или оба сразу.
# Только ссылка или только импорт — место, где документация и код расходятся.
LINK, IMPORT = 1, 2
# Глубина вложенности кластеров: глубже папки сливаются в предка, иначе мелкие подкластеры дробят карту.
MAX_DEPTH = 5
PROBLEMS = 'Проблемы'
STYLES = 'Стили'
# Где у части проекта отделяются стили: папка `style` нового сайта или, у старого фронтенда, где SCSS лежит
# вперемешку с TS, — подкластер «Стили» на втором уровне, рядом с кодом той же части.
STYLE_DIR, STYLE_DEPTH = 'style', 2


def group_of(path: str, problems: list[str], language: str) -> list[str]:
    """Путь кластера: папки дока без `docs/` (у исходника — его папки), стили — в своём подкластере
    рядом с кодом; у проблемного — «Проблемы» и причина."""
    if problems:
        return [PROBLEMS, problems[0]]
    rel = path[len('docs/'):] if path.startswith('docs/') else path
    parts = [p for p in os.path.dirname(rel).split('/') if p]
    if STYLE_DIR in parts:
        parts[parts.index(STYLE_DIR)] = STYLES
    elif language == 'scss':
        parts.insert(STYLE_DEPTH, STYLES)
    return parts[:MAX_DEPTH]


def collect() -> dict:
    docs = all_docs() + ['README.md']
    bad, mirrors, orphan_src = doc_problems(docs, HUBS), mirror_index(), missing_mirrors()
    nodes = []
    for d in docs:
        text, src = read(d), source_of(d)
        nodes.append({'id': d, 'title': title(d, text), 'zone': zone(d), 'lang': lang(src), 'hub': d in HUBS,
                      'src': src, 'text': text, 'bad': bad.get(d, []), 'group': group_of(d, bad.get(d, []), lang(src))})
    for s in orphan_src:
        why = [NO_MIRROR]
        nodes.append({'id': s, 'title': os.path.basename(s), 'zone': zone('docs/' + s), 'lang': lang(s),
                      'hub': False, 'src': s, 'text': '', 'bad': why, 'group': group_of(s, why, lang(s)), 'code': True})
    index = {n['id']: i for i, n in enumerate(nodes)}

    def node_of(path: str) -> int | None:
        return index.get(mirrors.get(path, path))

    edges: dict[tuple[int, int], int] = defaultdict(int)
    for d in docs:
        for t in link_targets(d):
            target = resolve(d, t)
            if target in index and target != d:
                edges[index[d], index[target]] |= LINK
    for src, deps in imports(all_sources()).items():
        a = node_of(src)
        for dep in deps:
            b = node_of(dep)
            if a is not None and b is not None and a != b:
                edges[a, b] |= IMPORT
    return {'nodes': nodes, 'edges': sorted([s, t, k] for (s, t), k in edges.items())}
