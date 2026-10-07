"""Импорты Rust: `mod x;` и `use crate::…`/`super::…`/`self::…`/`<крейт>::…` → файлы модулей репозитория."""
from __future__ import annotations

import os
import re

from docs_lint.files import read

RS_MOD_RE = re.compile(r'^\s*(?:pub(?:\([^)]*\))?\s+)?mod\s+(\w+)\s*;', re.M)
RS_USE_RE = re.compile(r'^\s*(?:pub(?:\([^)]*\))?\s+)?use\s+([^;]+);', re.M)
RS_COMMENT_RE = re.compile(r'//[^\n]*|/\*.*?\*/', re.S)


def _first(*paths: str) -> str | None:
    return next((os.path.normpath(p) for p in paths if os.path.isfile(p)), None)


class RustCrates:
    """Крейты репозитория: имя → каталог src, чтобы разбирать `use имя_крейта::…`."""

    def __init__(self, sources: list[str]) -> None:
        self.roots: dict[str, str] = {}
        for toml in (s for s in sources if os.path.basename(s) == 'Cargo.toml'):
            m = re.search(r'^\[package\][^\[]*?^name\s*=\s*"([^"]+)"', read(toml), re.M | re.S)
            src = os.path.join(os.path.dirname(toml), 'src')
            if m and os.path.isdir(src):
                self.roots[m.group(1).replace('-', '_')] = os.path.normpath(src)

    def crate_of(self, path: str) -> str | None:
        return next((r for r in self.roots.values() if path.startswith(r + os.sep)), None)


def _rs_module_dir(src: str) -> str:
    """Каталог подмодулей файла: для lib.rs/main.rs/mod.rs — его папка, иначе папка с именем файла."""
    name = os.path.basename(src)
    return os.path.dirname(src) if name in ('lib.rs', 'main.rs', 'mod.rs') else src[:-3]


def _rs_walk(start: str, parts: list[str]) -> str | None:
    """Самый глубокий файл модуля по пути сегментов (`a::b::C` → a/b.rs, если C — элемент)."""
    best, folder = None, start
    for part in parts:
        hit = _first(os.path.join(folder, part + '.rs'), os.path.join(folder, part, 'mod.rs'))
        if not hit:
            break
        best, folder = hit, os.path.join(folder, part)
    return best


def _rs_paths(tree: str) -> list[list[str]]:
    """`a::{b, c::d}` → [[a, b], [a, c, d]]; вложенные скобки глубже одного уровня берутся по префиксу."""
    tree = re.sub(r'\s+', '', tree)
    m = re.match(r'^(.*?)::\{(.*)\}$', tree)
    if not m:
        return [tree.split('::')]
    head, depth, items, cur = m.group(1).split('::'), 0, [], ''
    for ch in m.group(2) + ',':
        depth += ch == '{'
        depth -= ch == '}'
        if ch == ',' and depth == 0:
            items.append(cur)
            cur = ''
        else:
            cur += ch
    return [head + p for item in items if item for p in _rs_paths(item)]


def rust_imports(src: str, text: str, crates: RustCrates) -> set[str]:
    text = RS_COMMENT_RE.sub('', text)
    out, own, mod_dir = set(), crates.crate_of(src), _rs_module_dir(src)
    for name in RS_MOD_RE.findall(text):
        hit = _first(os.path.join(mod_dir, name + '.rs'), os.path.join(mod_dir, name, 'mod.rs'))
        if hit:
            out.add(hit)
    for tree in RS_USE_RE.findall(text):
        for parts in _rs_paths(tree):
            head, rest = parts[0], parts[1:]
            if head == 'crate' and own:
                start = own
            elif head == 'self':
                start = mod_dir
            elif head == 'super':
                start, rest = os.path.dirname(mod_dir), [p for p in rest if p != 'super']
            elif head in crates.roots:
                start = crates.roots[head]
                out.add(_first(os.path.join(start, 'lib.rs')) or '')
            else:
                continue
            hit = _rs_walk(start, rest)
            if hit:
                out.add(hit)
    # Полные пути в теле кода (`api::serve()`) без `use`, в том числе main.rs к своему lib.rs: связь с корнем крейта.
    for name, root in crates.roots.items():
        if re.search(rf'(?<![\w:]){name}::', text):
            out.add(_first(os.path.join(root, 'lib.rs')) or '')
    out.discard('')
    out.discard(src)
    return out
