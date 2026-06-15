#!/usr/bin/env python3
"""
Автоматический линтер сетевой документации BackpackInsight.

Проверяет ОБЪЕКТИВНО (без чтения человеком, переиспользуемо):
  [LINKS]    битые ссылки во всех .md (включая README)
  [TREE]     достижимость каждого дока обходом от README (BFS) — нет «сирот»
  [MIRROR]   у каждого исходника есть зеркальный .md (1:1)
  [STRUCT]   у файловых доков есть H1-ссылка на исходник + ключевые секции
  [COMPLETE] покрытие символов: % функций/классов/селекторов исходника, упомянутых в доке
  [TRUTH]    обратное: символы, которые док УТВЕРЖДАЕТ, но которых НЕТ в исходнике
             (ловит выдуманные методы/селекторы/@use — главный источник лжи)

Выход: отчёт + ненулевой код возврата при наличии FAIL.
"""
from __future__ import annotations
import os, re, sys, json
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
DOCS = "docs"

SRC_EXT = ('.py', '.ts', '.scss', '.js')
IMG_EXT = {'.avif','.webp','.png','.jpg','.jpeg','.gif','.ico','.woff','.woff2','.ttf','.otf'}
SKIP_DIRS = {'.git','node_modules','__pycache__','dist','.arena','.cache','.pytest_cache'}
SKIP_FILES = {'package-lock.json','database.db','.gitignore','.gitattributes'}

def all_docs():
    out=[]
    for dp,dn,fn in os.walk(DOCS):
        for f in fn:
            if f.endswith('.md'): out.append(os.path.normpath(os.path.join(dp,f)))
    return out

def read(p):
    try: return open(p,encoding='utf-8').read()
    except: return ""

LINK_RE = re.compile(r'\]\(([^)]+)\)')

def links_in(md):
    """Возвращает список (target_without_anchor, raw) ссылок-файлов."""
    res=[]
    for m in LINK_RE.finditer(read(md)):
        t=m.group(1).split('#')[0]
        if not t or t.startswith(('http://','https://','mailto:')): continue
        if '_к_документации' in t: continue
        res.append(t)
    return res

def resolve(md, target):
    if target.startswith('/'):
        return os.path.normpath('.'+target)
    return os.path.normpath(os.path.join(os.path.dirname(md), target))

# ---------------- [LINKS] ----------------
def check_links():
    fails=[]
    fileish=('.md','.ts','.py','.scss','.js','.json','.yml','.yaml','.ini','.html','.sql',
             '.mako','.csv','.ps1','.txt','.example','.xml')
    extless={'Dockerfile','README','_headers','.dockerignore','.env','.env.example'}
    for md in all_docs()+['README.md']:
        for t in links_in(md):
            looks = t.endswith(fileish) or os.path.basename(t) in extless
            if not looks: continue
            if not os.path.exists(resolve(md,t)):
                fails.append((md,t))
    return fails

# ---------------- [TREE] ----------------
def check_tree():
    docs=set(all_docs())
    # граф по .md-ссылкам
    adj={d:set() for d in docs}
    for d in docs:
        for t in links_in(d):
            if t.endswith('.md'):
                r=resolve(d,t)
                if r in adj: adj[d].add(r)
    # корни: README + structure.md
    roots=[]
    for t in links_in('README.md'):
        if t.endswith('.md'):
            r=resolve('README.md',t)
            if r in docs: roots.append(r)
    for extra in ('docs/structure.md','docs/DOCS_AUDIT_AND_PLAN.md'):
        if extra in docs: roots.append(extra)
    seen=set()
    q=deque(roots)
    while q:
        n=q.popleft()
        if n in seen: continue
        seen.add(n)
        for m in adj.get(n,()): q.append(m)
    orphans=sorted(docs-seen)
    return orphans, len(seen), len(docs)

# ---------------- [MIRROR] ----------------
def doc_source_map():
    """doc -> исходник, на который ссылается H1 (если есть)."""
    m={}
    for d in all_docs():
        first=read(d).split('\n',1)[0]
        mm=re.search(r'\]\(([^)]+)\)', first)
        if mm:
            t=mm.group(1).split('#')[0]
            if not t.startswith('http'):
                m[d]=resolve(d,t)
    return m

def all_sources():
    out=[]
    for base in ['Backend','Frontend/Web','scripts','tests']:
        for dp,dn,fn in os.walk(base):
            dn[:]=[x for x in dn if x not in SKIP_DIRS]
            if any(x in dp for x in ['/migrations/versions','Profiles','/fixtures']):
                pass
            for f in fn:
                if f.endswith(SRC_EXT): out.append(os.path.normpath(os.path.join(dp,f)))
    return out

def all_linked_sources():
    linked=set()
    for d in all_docs():
        for t in links_in(d):
            if t.endswith(SRC_EXT):
                linked.add(resolve(d,t))
    return linked

def check_mirror():
    documented=all_linked_sources()
    undoc=[s for s in all_sources()
           if s not in documented and os.path.basename(s)!='__init__.py']
    return sorted(undoc)

# ---------------- символы исходника ----------------
def symbols_py(src):
    s=set()
    for m in re.finditer(r'^\s*(?:async\s+)?def\s+([a-zA-Z_]\w*)', src, re.M): s.add(m.group(1))
    for m in re.finditer(r'^\s*class\s+([a-zA-Z_]\w*)', src, re.M): s.add(m.group(1))
    return s

def symbols_ts(src):
    s=set()
    for m in re.finditer(r'\bclass\s+([A-Za-z_]\w*)', src): s.add(m.group(1))
    for m in re.finditer(r'\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_]\w*)', src): s.add(m.group(1))
    for m in re.finditer(r'\bexport\s+(?:const|interface|type|enum)\s+([A-Za-z_]\w*)', src): s.add(m.group(1))
    # методы класса: "name(" в начале строки с отступом, не управляющие конструкции
    for m in re.finditer(r'^\s+(?:public|private|protected|static|readonly|override|\s)*([a-zA-Z_]\w*)\s*\(', src, re.M):
        n=m.group(1)
        if n not in {'if','for','while','switch','catch','return','constructor','function','await','async'}:
            s.add(n)
    return s

def symbols_scss(src):
    s=set()
    for m in re.finditer(r'(?<![\w&-])\.([a-zA-Z][\w-]*)', src): s.add('.'+m.group(1))
    for m in re.finditer(r'(?<![\w&-])#([a-zA-Z][\w-]*)', src): s.add('#'+m.group(1))
    for m in re.finditer(r'@keyframes\s+([\w-]+)', src): s.add(m.group(1))
    return s

def source_symbols(src_path):
    src=read(src_path)
    if src_path.endswith('.py'): return symbols_py(src)
    if src_path.endswith(('.ts','.js')): return symbols_ts(src)
    if src_path.endswith('.scss'): return symbols_scss(src)
    return set()

# токены, которые ДОК упоминает в backticks и которые выглядят как код
SIG_HASH=re.compile(r'^[0-9a-f]{7,40}$')
EXT_NOISE={'.ts','.scss','.js','.py','.json','.md','.d.ts'}
def doc_claimed_tokens(doc_text):
    # выкидываем строку подписи целиком
    doc_text=re.sub(r'> 📌 \*\*Подпись.*', '', doc_text)
    toks=set()
    for m in re.finditer(r'`([^`]+)`', doc_text):
        t=m.group(1).strip()
        if t in EXT_NOISE or SIG_HASH.match(t): continue
        # метод/функция: foo or foo()
        mm=re.fullmatch(r'([A-Za-z_]\w{2,})(?:\(\))?', t)
        if mm: toks.add(('id', mm.group(1)))
        # css class/id
        mm=re.fullmatch(r'([.#][A-Za-z][\w-]+)', t)
        if mm: toks.add(('css', mm.group(1)))
        # @use "x"
        mm=re.search(r'@use\s+"([^"]+)"', t)
        if mm: toks.add(('use', mm.group(1)))
    return toks

def check_complete_and_truth():
    """Возвращает (incomplete[], suspicious[])."""
    dsm=doc_source_map()
    incomplete=[]; suspicious=[]
    # глобальный индекс всех символов кода (для отсева кросс-файловых упоминаний)
    global_ids=set(); global_css=set(); global_text_use=""
    for s in all_sources():
        if s.endswith(('.py','.ts','.js')):
            global_ids|= {x for x in source_symbols(s)}
        if s.endswith('.scss'):
            global_css|= source_symbols(s)
            global_text_use+=read(s)+"\n"
    for doc, src in dsm.items():
        if not src.endswith(SRC_EXT) or not os.path.exists(src): continue
        text=read(doc)
        # объединяем текст ВСЕХ исходников, на которые ссылается док (combined .ts+.scss и пр.)
        linked_srcs={src}
        for t in links_in(doc):
            if t.endswith(SRC_EXT):
                linked_srcs.add(resolve(doc,t))
        srctext_all="\n".join(read(x) for x in linked_srcs if os.path.exists(x))
        syms=source_symbols(src)
        # --- полнота ---
        if syms:
            syms = {x for x in syms if x not in SYM_IGNORE}
        if syms:
            mentioned=sum(1 for s in syms if (s if s[0] in '.#' else s) in text)
            ratio=mentioned/len(syms)
            # барьер: для файлов с >=3 символами ждём >=50% покрытия
            if len(syms)>=3 and ratio<0.5:
                incomplete.append((doc, round(ratio*100), len(syms), sorted(syms-set(s for s in syms if (s) in text))[:8]))
        # --- истинность (символы, заявленные доком, но отсутствующие в исходнике) ---
        claimed=doc_claimed_tokens(text)
        bad=[]
        for kind,tok in claimed:
            if kind=='css':
                naked=tok[1:]
                # id/class может храниться в JS как id="x" / 'x' / "x"
                if (tok in srctext_all or tok in global_css or
                    f'"{naked}"' in srctext_all or f"'{naked}'" in srctext_all):
                    continue
                bad.append(tok)
            elif kind=='use':
                if f'"{tok}"' in srctext_all or f"'{tok}'" in srctext_all: continue
                bad.append('@use "%s"'%tok)
            elif kind=='id':
                if tok in srctext_all: continue
                if tok in global_ids: continue
                if tok.lower() in COMMON or tok in TYPE_NOISE or len(tok)<4: continue
                bad.append(tok)
        if bad:
            suspicious.append((doc, src, bad[:12]))
    return incomplete, suspicious

COMMON={'true','false','null','none','async','await','await','this','self','json','html','class',
        'string','number','boolean','void','const','return','import','export','from','data','item',
        'items','name','type','types','value','default','error','init','main','base','test','tests',
        'cache','list','dict','args','kwargs','util','utils','http','https','post','get','api','url',
        'uid','css','scss','dom','svg','png','webp','avif','node','bun','vite','then','catch'}
CSS_NOISE=set()
SYM_IGNORE={'describe','it','expect','beforeEach','afterEach','vi','test','addListener',
 'init','destroy','setTimeout','clearTimeout','func','constructor','render','getHtml','getMeta',
 'mount','unmount'}
TYPE_NOISE={'HTMLCollection','SessionStorage','LocalStorage','HTMLElement','Promise','Map','Set',
 'Array','Object','Image','Blob','File','FileReader','Document','Element','Event','IntersectionObserver',
 'i18next','readAsText','document','paths','clamp','delay','display','func','static','draft','submit',
 '_profile','_mobile','textarea','promise','finally','spy'}

def main():
    print("="*70); print("ЛИНТЕР ДОКУМЕНТАЦИИ BackpackInsight"); print("="*70)
    rc=0

    bl=check_links()
    print(f"\n[LINKS] битые ссылки: {len(bl)}")
    for md,t in bl[:50]: print(f"   FAIL {md} -> {t}")
    if bl: rc=1

    orph,seen,total=check_tree()
    print(f"\n[TREE] достижимо от README/structure: {seen}/{total}; сирот: {len(orph)}")
    for o in orph[:50]: print(f"   ORPHAN {o}")
    if orph: rc=1

    und=check_mirror()
    print(f"\n[MIRROR] исходников без дока (искл. __init__): {len(und)}")
    for u in und[:50]: print(f"   MISSING {u}")
    if und: rc=1

    inc, susp = check_complete_and_truth()
    print(f"\n[COMPLETE] доков с покрытием символов <50%: {len(inc)}")
    for doc,pct,n,miss in inc[:50]:
        print(f"   WARN {doc}  {pct}% ({n} симв.) напр. не упомянуты: {miss}")

    print(f"\n[TRUTH] доков с подозрительными (отсутствующими в исходнике) символами: {len(susp)}")
    for doc,src,bad in susp[:80]:
        print(f"   CHECK {doc}\n         символы не найдены в {os.path.basename(src)}: {bad}")

    print("\n"+"="*70)
    print(f"ИТОГ: LINKS={'OK' if not bl else 'FAIL'}  TREE={'OK' if not orph else 'FAIL'}  "
          f"MIRROR={'OK' if not und else 'FAIL'}  COMPLETE_warn={len(inc)}  TRUTH_check={len(susp)}")
    print("="*70)
    sys.exit(rc)

if __name__=='__main__':
    main()
