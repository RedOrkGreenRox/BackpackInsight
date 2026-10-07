#!/usr/bin/env python3
"""Линтер сетевой документации BackpackInsight (правила — REQUIREMENTS.md §2–3).

Проверки, которые валят запуск (код возврата 1):
  [LINKS]  ссылки на несуществующие файлы и якоря;
  [TREE]   документы, недостижимые от README.md и docs/structure.md;
  [FRESH]  docs/structure.md отстаёт от scripts/generate_structure.py;
  [MIRROR] исходник без документа, чей H1 ведёт на него (1:1);
  [STRUCT] нет «Назначения» у файлового документа, нет подписи в конце, длина > 250 строк.
Предупреждения (с --strict тоже валят запуск):
  [MIRROR] несколько документов на один исходник; [STRUCT] длина > 150, обещания вне «Планируется»;
  [COMPLETE] документ упоминает меньше половины символов исходника;
  [TRUTH]  документ показывает как код имя, которого нет ни в его исходниках, ни где-либо в коде.
"""
from __future__ import annotations

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from docs_lint import graph, mirror, truth  # noqa: E402
from docs_lint.files import ROOT  # noqa: E402

LIMIT = 60


def section(title: str, rows: list[str]) -> None:
    print(f"\n[{title}] {len(rows)}")
    for row in rows[:LIMIT]:
        print(f"   {row}")
    if len(rows) > LIMIT:
        print(f"   … и ещё {len(rows) - LIMIT}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split('\n', 1)[0])
    parser.add_argument('--strict', action='store_true', help='предупреждения тоже валят запуск')
    args = parser.parse_args()
    os.chdir(ROOT)

    links = [f"{md} -> {t}" for md, t in graph.check_links()]
    orphans, reached, total = graph.check_tree()
    fresh = graph.check_fresh()
    missing, duplicated = mirror.check_mirror()
    struct_fails, struct_warns = mirror.check_struct()
    incomplete, suspicious = truth.check()

    fails = {
        'LINKS битые ссылки и якоря': links,
        f'TREE сироты (достижимо {reached}/{total})': orphans,
        'FRESH structure.md устарел': [] if fresh else ['запустите scripts/generate_structure.py'],
        'MIRROR исходники без зеркального документа': missing,
        'STRUCT ошибки оформления': [f"{d}: {why}" for d, why in struct_fails],
    }
    warns = {
        'MIRROR несколько документов на исходник': [f"{s}: {', '.join(d)}" for s, d in duplicated],
        'STRUCT предупреждения': [f"{d}: {why}" for d, why in struct_warns],
        'COMPLETE покрытие символов < 50%': [f"{d} {p}% из {n}, не упомянуты: {m}"
                                            for d, p, n, m in incomplete],
        'TRUTH символы, которых нет в коде': [f"{d} ({os.path.basename(s)}): {b}"
                                             for d, s, b in suspicious],
    }
    print("ЛИНТЕР ДОКУМЕНТАЦИИ BackpackInsight")
    for title, rows in {**fails, **warns}.items():
        section(title, rows)
    failed = sum(len(r) for r in fails.values())
    warned = sum(len(r) for r in warns.values())
    print(f"\nИТОГ: ошибок {failed}, предупреждений {warned}{' (строгий режим)' if args.strict else ''}")
    return 1 if failed or (args.strict and warned) else 0


if __name__ == '__main__':
    sys.exit(main())
