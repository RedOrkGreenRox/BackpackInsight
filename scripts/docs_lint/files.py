"""Файлы репозитория: документы, исходники, ссылки и разрешение путей."""
from __future__ import annotations

import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = "docs"

# REQUIREMENTS.md §2: у каждого такого файла должен быть зеркальный документ.
SRC_EXT = ('.py', '.ts', '.scss', '.js', '.cjs', '.mjs', '.rs', '.sql', '.mako', '.fbs')
SRC_NAMES = {'Cargo.toml', 'rust-toolchain.toml'}
# Сборка, зависимости и код, который генерируют flatc и builder: без зеркала.
SKIP_DIRS = {'.git', 'node_modules', '__pycache__', 'dist', '.arena', '.cache',
             '.pytest_cache', 'target', 'generated', 'docs'}

LINK_RE = re.compile(r'\]\(((?:[^()\s]|\([^()]*\))+)\)')
SIGNATURE = '📌 **Подпись документации:**'


def read(path: str) -> str:
    try:
        with open(path, encoding='utf-8') as fh:
            return fh.read()
    except (OSError, UnicodeDecodeError):
        return ""


def is_source(path: str) -> bool:
    return path.endswith(SRC_EXT) or os.path.basename(path) in SRC_NAMES


def tracked_files() -> list[str]:
    """Файлы под git (без мусора рабочей копии); вне git — обход диска."""
    try:
        out = subprocess.run(['git', 'ls-files', '-z'], cwd=ROOT, capture_output=True,
                             check=True).stdout.decode('utf-8')
        files = [f for f in out.split('\0') if f]
    except (OSError, subprocess.CalledProcessError):
        files = []
        for dp, dn, fn in os.walk('.'):
            dn[:] = [d for d in dn if d not in SKIP_DIRS]
            files += [os.path.relpath(os.path.join(dp, f)) for f in fn]
    return [os.path.normpath(f) for f in files if os.path.exists(f)]


def all_docs() -> list[str]:
    out = []
    for dp, _dn, fn in os.walk(DOCS):
        out += [os.path.normpath(os.path.join(dp, f)) for f in fn if f.endswith('.md')]
    return sorted(out)


def all_sources() -> list[str]:
    return sorted(f for f in tracked_files()
                  if is_source(f) and not SKIP_DIRS.intersection(f.split(os.sep)[:-1]))


CODE_RE = re.compile(r'```.*?```|`[^`\n]*`', re.S)


def link_targets(md: str) -> list[str]:
    """Ссылки документа на файлы (без внешних адресов и примеров в коде, якорь сохраняется)."""
    res = []
    for m in LINK_RE.finditer(CODE_RE.sub('', read(md))):
        t = m.group(1)
        if t.startswith(('http://', 'https://', 'mailto:')):
            continue
        res.append(t)
    return res


def resolve(md: str, target: str) -> str:
    target = target.split('#', 1)[0]
    if not target:
        return md
    if target.startswith('/'):
        return os.path.normpath('.' + target)
    return os.path.normpath(os.path.join(os.path.dirname(md), target))


def h1_target(md: str) -> str | None:
    """Файл, на который ссылается первая строка документа (H1)."""
    first = read(md).split('\n', 1)[0]
    m = LINK_RE.search(first) if first.startswith('# ') else None
    if not m or m.group(1).startswith('http'):
        return None
    return resolve(md, m.group(1))


def doc_source_map() -> dict[str, str]:
    """Документ → исходник из его H1 (только для файловых документов)."""
    out = {}
    for d in all_docs():
        t = h1_target(d)
        if t and is_source(t):
            out[d] = t
    return out
