"""Принцип 1:1 и правила оформления документов (ARENA.MD §1.2, §1.6, §1.7, §2.1)."""
from __future__ import annotations

import os
import re
from collections import defaultdict

from .files import CODE_RE, SIGNATURE, all_docs, all_sources, doc_source_map, h1_target, read

LINES_WARN = 150
# Генерируемые документы: их длина зависит от дерева проекта, а не от автора.
GENERATED_DOCS = {'docs/structure.md'}
LINES_FAIL = 250
PURPOSE_RE = re.compile(r'^##\s.*Назначение', re.M)
PLANNED_SECTION_RE = re.compile(r'(?i)планир|в разработке|todo|план')
# Обещания в описании текущего поведения: место им только в разделе «Планируется».
PLANNING_RE = re.compile(
    r'(?i)(?<![\w-])(будем|планируем|скоро|в будущем|todo|fixme)(?![\w-])'
    r'|будет (добавлен|реализован|сделан|переписан|перенес[её]н|удал[её]н)')


def check_mirror() -> tuple[list[str], list[tuple[str, list[str]]]]:
    """Исходники без документа, чей H1 ведёт на них, и исходники с несколькими такими документами."""
    owners: dict[str, list[str]] = defaultdict(list)
    for doc, src in doc_source_map().items():
        owners[src].append(doc)
    missing = [s for s in all_sources()
               if s not in owners and os.path.basename(s) != '__init__.py']
    duplicated = sorted((s, sorted(d)) for s, d in owners.items() if len(d) > 1)
    return missing, duplicated


def planning_lines(text: str) -> list[int]:
    """Номера строк с обещаниями вне разделов «Планируется»/«В разработке»."""
    found, section = [], ''
    for number, line in enumerate(text.split('\n'), 1):
        if line.startswith('#'):
            section = line
        if not PLANNED_SECTION_RE.search(section) and PLANNING_RE.search(CODE_RE.sub('', line)):
            found.append(number)
    return found


def check_struct() -> tuple[list[tuple[str, str]], list[tuple[str, str]]]:
    """(ошибки, предупреждения) оформления: H1, «Назначение», подпись, длина, обещания."""
    fails, warns = [], []
    for doc in all_docs():
        text = read(doc)
        lines = text.count('\n') + 1
        target = h1_target(doc)
        if target and not target.endswith('.md') and not PURPOSE_RE.search(text):
            fails.append((doc, 'нет раздела «Назначение»'))
        if SIGNATURE not in text:
            fails.append((doc, 'нет подписи документации'))
        elif SIGNATURE not in '\n'.join(text.rstrip().split('\n')[-2:]):
            fails.append((doc, 'подпись не в конце документа'))
        if doc in GENERATED_DOCS:
            pass
        elif lines > LINES_FAIL:
            fails.append((doc, f'{lines} строк > {LINES_FAIL}'))
        elif lines > LINES_WARN:
            warns.append((doc, f'{lines} строк > {LINES_WARN}'))
        for number in planning_lines(text):
            warns.append((doc, f'строка {number}: план вне раздела «Планируется»'))
    return fails, warns
