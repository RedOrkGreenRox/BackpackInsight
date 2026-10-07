"""Проблемы документации для графа: те же проверки, что в check_docs.py, плюс сироты.

Каждая проблема — короткая причина по-русски; узел с хотя бы одной причиной рисуется красным
и уходит в отдельный кластер «Проблемы», где подкластеры — это причины.
"""
from __future__ import annotations

import os
from collections import defaultdict

from docs_lint.files import doc_source_map, h1_target, link_targets, resolve
from docs_lint.graph import check_links, check_tree
from docs_lint.mirror import check_mirror

BROKEN = 'Битые ссылки'
UNREACHABLE = 'Недостижим от README'
ORPHAN = 'Ссылки только из карт'
NO_SOURCE = 'Исходник удалён'
DUPLICATE = 'Два зеркала у файла'
NO_MIRROR = 'Нет зеркального дока'
# Порядок подкластеров внутри «Проблем»: от самых серьёзных.
ORDER = (NO_MIRROR, NO_SOURCE, BROKEN, DUPLICATE, UNREACHABLE, ORPHAN)


def orphans(docs: list[str], hubs: set[str]) -> list[str]:
    """Доки, на которые ссылаются только карты (README и structure.md) — без смысловых входящих ссылок."""
    incoming: dict[str, int] = {d: 0 for d in docs}
    for d in docs:
        if d in hubs:
            continue
        for t in link_targets(d):
            target = resolve(d, t)
            if target in incoming and target != d:
                incoming[target] += 1
    return [d for d, n in incoming.items() if n == 0 and d not in hubs]


def doc_problems(docs: list[str], hubs: set[str]) -> dict[str, list[str]]:
    """Документ → список причин (пустые не попадают)."""
    found: dict[str, list[str]] = defaultdict(list)
    for md, _target in check_links():
        if BROKEN not in found[md]:
            found[md].append(BROKEN)
    for md in check_tree()[0]:
        found[md].append(UNREACHABLE)
    for md in orphans(docs, hubs):
        found[md].append(ORPHAN)
    for md in docs:
        target = h1_target(md) if md.startswith('docs/') else None
        if target and not os.path.exists(target):
            found[md].append(NO_SOURCE)
    for _src, owners in check_mirror()[1]:
        for md in owners:
            found[md].append(DUPLICATE)
    return {md: sorted(set(r), key=ORDER.index) for md, r in found.items() if r}


def missing_mirrors() -> list[str]:
    """Исходники, у которых нет зеркального документа."""
    return check_mirror()[0]


def mirror_index() -> dict[str, str]:
    """Исходник → его зеркальный документ (первый, если их несколько)."""
    out: dict[str, str] = {}
    for doc, src in sorted(doc_source_map().items()):
        out.setdefault(src, doc)
    return out
