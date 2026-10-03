"""Символы исходников по языкам: что документ должен упомянуть и что может утверждать."""
from __future__ import annotations

import re

from .files import read

TS_KEYWORDS = {'if', 'for', 'while', 'switch', 'catch', 'return', 'constructor', 'function',
               'await', 'async', 'super', 'new', 'typeof'}
# Метод класса: отступ, модификаторы, имя, параметры, необязательный тип и `{` в конце строки.
TS_METHOD_RE = re.compile(
    r'^[ \t]+(?:(?:public|private|protected|static|readonly|override|async|get|set)\s+)*'
    r'([A-Za-z_]\w*)\s*(?:<[^>\n]*>)?\([^;\n]*\)\s*(?::\s*[^;{=\n]+)?\{\s*$', re.M)
RS_COMMENT_RE = re.compile(r'//[^\n]*|/\*.*?\*/', re.S)


def _names(pattern: str, text: str, flags: int = 0) -> set[str]:
    return {m.group(1) for m in re.finditer(pattern, text, flags)}


def symbols_py(src: str) -> set[str]:
    return (_names(r'^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)', src, re.M)
            | _names(r'^\s*class\s+([A-Za-z_]\w*)', src, re.M))


def symbols_ts(src: str) -> set[str]:
    found = (_names(r'\bclass\s+([A-Za-z_]\w*)', src)
             | _names(r'\b(?:export\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_]\w*)', src)
             | _names(r'\bexport\s+(?:const|let|interface|type|enum)\s+([A-Za-z_]\w*)', src)
             | _names(TS_METHOD_RE.pattern, src, re.M))
    return found - TS_KEYWORDS


def symbols_scss(src: str) -> set[str]:
    return ({'.' + n for n in _names(r'(?<![\w&$-])\.([A-Za-z][\w-]*)', src)}
            | {'#' + n for n in _names(r'(?<![\w&$-])#([A-Za-z][\w-]*)(?![^{]*\})', src)}
            | _names(r'@keyframes\s+([\w-]+)', src))


def symbols_rs(src: str) -> set[str]:
    code = RS_COMMENT_RE.sub('', src)
    found = _names(r'\bfn\s+([A-Za-z_]\w*)', code)
    for kind in ('struct', 'enum', 'trait', 'type', 'mod'):
        found |= _names(rf'\b{kind}\s+([A-Za-z_]\w*)', code)
    return found | _names(r'\b(?:const|static)\s+([A-Z_][A-Z0-9_]*)\s*:', code)


def symbols_sql(src: str) -> set[str]:
    return _names(r'(?i)\bcreate\s+(?:unique\s+)?(?:table|index|view)\s+'
                  r'(?:if\s+not\s+exists\s+)?"?([\w.]+)', src)


def symbols_fbs(src: str) -> set[str]:
    return _names(r'^\s*(?:table|struct|enum|union)\s+(\w+)', src, re.M)


def symbols_toml(src: str) -> set[str]:
    return _names(r'^\s*\[+([\w.-]+)\]+', src, re.M)


EXTRACTORS = (
    (('.py',), symbols_py), (('.ts', '.js', '.cjs', '.mjs'), symbols_ts),
    (('.scss',), symbols_scss), (('.rs',), symbols_rs), (('.sql',), symbols_sql),
    (('.fbs',), symbols_fbs), (('.toml',), symbols_toml),
)


def source_symbols(path: str) -> set[str]:
    for exts, extract in EXTRACTORS:
        if path.endswith(exts):
            return extract(read(path))
    return set()
