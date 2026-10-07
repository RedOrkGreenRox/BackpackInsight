"""Связность сети: битые ссылки и якоря, достижимость документов, свежесть карты."""
from __future__ import annotations

import importlib.util
import os
import re
from collections import deque

from .files import ROOT, all_docs, link_targets, read, resolve

HEADING_RE = re.compile(r'^#{1,6}\s+(.*?)\s*#*\s*$', re.M)
INLINE_LINK_RE = re.compile(r'\[([^\]]*)\]\([^)]*\)')


def slug(heading: str) -> str:
    """Якорь заголовка по правилам GitHub: нижний регистр, без знаков, пробелы → дефисы."""
    text = INLINE_LINK_RE.sub(r'\1', heading).strip().lower()
    text = re.sub(r'[^\w\- ]', '', text)
    return text.replace(' ', '-')


def anchors(md: str) -> set[str]:
    return {slug(h) for h in HEADING_RE.findall(read(md))}


def check_links() -> list[tuple[str, str]]:
    """Ссылки на несуществующие файлы и на несуществующие якоря в .md."""
    fails = []
    for md in all_docs() + ['README.md']:
        for t in link_targets(md):
            target = resolve(md, t)
            if not os.path.exists(target):
                fails.append((md, t))
            elif '#' in t and target.endswith('.md') and t.split('#', 1)[1] not in anchors(target):
                fails.append((md, t))
    return fails


def check_tree() -> tuple[list[str], int, int]:
    """Документы, недостижимые по ссылкам от README.md и docs/structure.md (REQUIREMENTS.md §2)."""
    docs = set(all_docs())
    roots = [r for r in ('README.md', 'docs/structure.md') if os.path.exists(r)]
    seen: set[str] = set()
    queue = deque(roots)
    while queue:
        node = queue.popleft()
        if node in seen:
            continue
        seen.add(node)
        for t in link_targets(node):
            r = resolve(node, t)
            if r.endswith('.md') and r in docs and r not in seen:
                queue.append(r)
    seen.discard('README.md')
    return sorted(docs - seen), len(seen), len(docs)


def check_fresh() -> bool:
    """`docs/structure.md` совпадает с тем, что сейчас сгенерировал бы generate_structure.py."""
    path = os.path.join(ROOT, 'scripts', 'generate_structure.py')
    spec = importlib.util.spec_from_file_location('generate_structure', path)
    if spec is None or spec.loader is None:
        return False
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.render() == read('docs/structure.md')
