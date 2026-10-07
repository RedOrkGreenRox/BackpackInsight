"""Импорты кода: какой исходник подключает какой. Разбор по регулярным выражениям, без компиляторов.

Rust — в rust_imports.py; TS и JS — `import … from`, `export … from`,
`import()` и `require()`; SCSS — `@use`, `@forward`, `@import`; Python — `import x` и `from .x import y`.
Ссылки на внешние пакеты отбрасываются: остаются только пары файлов из репозитория.
"""
from __future__ import annotations

import os
import re

from docs_lint.files import read
from rust_imports import RustCrates, rust_imports

TS_RE = re.compile(r'''(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|^\s*import\s+)['"](\.{1,2}/[^'"]+)['"]''', re.M)
SCSS_RE = re.compile(r'''@(?:use|forward|import)\s+['"]([^'"]+)['"]''')
PY_RE = re.compile(r'^\s*(?:from\s+(\.*[\w.]*)\s+import\s+([\w, ]+)|import\s+([\w.]+))', re.M)


def _first(*paths: str) -> str | None:
    return next((os.path.normpath(p) for p in paths if os.path.isfile(p)), None)


def _ts(src: str, text: str) -> set[str]:
    out = set()
    for spec in TS_RE.findall(text):
        base = os.path.join(os.path.dirname(src), spec)
        stem = re.sub(r'\.(js|mjs|cjs)$', '', base)
        hit = _first(base, stem + '.ts', stem + '.js', base + '.ts', base + '.js', os.path.join(base, 'index.ts'))
        if hit:
            out.add(hit)
    return out


def _scss(src: str, text: str) -> set[str]:
    out = set()
    for spec in SCSS_RE.findall(text):
        if spec.startswith(('sass:', 'http')):
            continue
        head, name = os.path.split(os.path.join(os.path.dirname(src), spec))
        stem = re.sub(r'\.s?css$', '', name)
        hit = _first(*(os.path.join(head, p + stem + e) for p in ('', '_') for e in ('.scss', '.css')),
                     os.path.join(head, stem, '_index.scss'))
        if hit:
            out.add(hit)
    return out


def _py(src: str, text: str) -> set[str]:
    out, here = set(), os.path.dirname(src)
    for rel, names, plain in PY_RE.findall(text):
        mod = rel or plain
        dots = len(mod) - len(mod.lstrip('.'))
        base = here
        for _ in range(max(dots - 1, 0)):
            base = os.path.dirname(base)
        roots = [base] if dots else [here, os.path.dirname(here)]
        parts = [p for p in mod.lstrip('.').split('.') if p]
        for root in roots:
            path = os.path.join(root, *parts)
            hit = _first(path + '.py', os.path.join(path, '__init__.py'))
            subs = [_first(os.path.join(path, n.strip() + '.py')) for n in names.split(',')] if names else []
            found = [h for h in [hit, *subs] if h and h != src]
            if found:
                out.update(found)
                break
    return out


def imports(sources: list[str]) -> dict[str, set[str]]:
    """Исходник → множество исходников репозитория, которые он подключает."""
    crates, known, result = RustCrates(sources), set(sources), {}
    for src in sources:
        text, ext = read(src), src.rsplit('.', 1)[-1]
        if ext == 'rs':
            found = rust_imports(src, text, crates)
        elif ext in ('ts', 'js', 'mjs', 'cjs'):
            found = _ts(src, text)
        elif ext == 'scss':
            found = _scss(src, text)
        elif ext == 'py':
            found = _py(src, text)
        else:
            continue
        found &= known
        if found:
            result[src] = found
    return result
