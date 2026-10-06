"""Сверка текста документа с кодом: полнота упоминаний и «ложь» о несуществующих символах."""
from __future__ import annotations

import os
import re

from .files import all_sources, doc_source_map, h1_target, is_source, link_targets, read, resolve
from .symbols import source_symbols

COMPLETE_MIN = 0.5
CODE_SPAN_RE = re.compile(r'`([^`\n]+)`')
SIGNATURE_LINE_RE = re.compile(r'> 📌 \*\*Подпись.*')
HASH_RE = re.compile(r'^[0-9a-f]{7,40}$')
FILE_EXT_RE = re.compile(r'^\.[a-z]{1,5}$')
# Слова, которые в обратных кавычках обычно означают не символ кода, а термин или значение.
COMMON = {'true', 'false', 'null', 'none', 'self', 'json', 'html', 'string', 'number', 'boolean',
          'void', 'const', 'return', 'import', 'export', 'from', 'default', 'error', 'main',
          'test', 'tests', 'cache', 'list', 'dict', 'utils', 'http', 'https', 'post', 'api',
          'node', 'vite', 'then', 'catch', 'async', 'await'}
SYM_IGNORE = {'describe', 'it', 'expect', 'beforeEach', 'afterEach', 'vi', 'test', 'init',
              'destroy', 'constructor', 'render', 'mount', 'unmount', 'main', 'tests'}


# Внешние имена (API браузера, типы Leptos и std, утилиты), которых нет в коде проекта дословно.
EXTERNAL = {'DocumentFragment', 'textarea', 'replaceState', 'arrayBuffer', 'Display', 'EitherOf3',
            'prefetch_lazy_fn_on_server', 'flatc', 'rustc', 'cargo', 'RUST_LOG'}


def snake(token: str) -> str:
    """camelCase → snake_case: имя поля JSON и его поле в Rust (serde rename_all)."""
    return re.sub(r'(?<=[a-z0-9])([A-Z])', lambda m: '_' + m.group(1).lower(), token)


def appears(code: str, token: str) -> bool:
    """Мягкое вхождение для TRUTH: часть составного имени (`.rarity-common`, префикс `items_`)
    или snake_case-форма camelCase-имени тоже считается."""
    bare = token.lstrip('.#')
    tail = '' if bare.endswith('_') else r'(?![a-z0-9])'
    return any(re.search(r'(?<![A-Za-z0-9$])' + re.escape(t) + tail, code)
               for t in {bare, snake(bare)})


def mentions(text: str, token: str) -> bool:
    """Символ встречается как отдельное слово, а не как часть другого имени."""
    return re.search(r'(?<![\w$-])' + re.escape(token) + r'(?![\w-])', text) is not None


def related_sources(doc: str, own: str) -> list[str]:
    """Исходник документа, исходники из его ссылок и исходники документов, на которые он ссылается."""
    found = [own]
    for t in link_targets(doc):
        target = resolve(doc, t)
        if is_source(target):
            found.append(target)
        elif target.endswith('.md') and os.path.exists(target):
            linked = h1_target(target)
            if linked and is_source(linked):
                found.append(linked)
    return [f for f in dict.fromkeys(found) if os.path.exists(f)]


def claimed_tokens(text: str) -> set[str]:
    """Имена, классы и id, которые документ показывает как код."""
    text = SIGNATURE_LINE_RE.sub('', text)
    tokens = set()
    for raw in CODE_SPAN_RE.findall(text):
        t = raw.strip()
        if HASH_RE.match(t) or FILE_EXT_RE.match(t):
            continue
        ident = re.fullmatch(r'([A-Za-z_]\w{3,})(?:\(\))?', t)
        css = re.fullmatch(r'[.#][A-Za-z][\w-]+', t)
        if ident and ident.group(1).lower() not in COMMON:
            tokens.add(ident.group(1))
        elif css:
            tokens.add(t)
    return tokens


def check() -> tuple[list[tuple[str, int, int, list[str]]], list[tuple[str, str, list[str]]]]:
    """(неполные документы, документы с символами, которых нет нигде в коде)."""
    defined: set[str] = set()
    for src in all_sources():
        defined |= source_symbols(src)
    everywhere = '\n'.join(read(s) for s in all_sources())
    incomplete, suspicious = [], []
    for doc, src in sorted(doc_source_map().items()):
        if not os.path.exists(src):
            continue
        text = read(doc)
        symbols = source_symbols(src) - SYM_IGNORE
        missed = sorted(s for s in symbols if not mentions(text, s))
        if len(symbols) >= 3 and len(missed) > len(symbols) * (1 - COMPLETE_MIN):
            share = round(100 * (len(symbols) - len(missed)) / len(symbols))
            incomplete.append((doc, share, len(symbols), missed[:8]))
        code = '\n'.join(read(s) for s in related_sources(doc, src))
        bad = sorted(t for t in claimed_tokens(text)
                     if not appears(code, t) and t.lstrip('.#') not in defined | EXTERNAL
                     and not appears(everywhere, t))
        if bad:
            suspicious.append((doc, src, bad[:12]))
    return incomplete, suspicious
