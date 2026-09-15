import re
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""120页课件构建脚本
用法（在课件目录运行）：
  python3 build/build.py skeleton [--force] [ID ...]   从脚本 JSON 生成 pages/<ID>.html 骨架（已存在则跳过，--force 覆盖）
  python3 build/build.py assets                        复制素材：plan/pages_plan.json 的 assets 与脚本资源文件 → assets/
  python3 build/build.py assemble                      pages/*.html → index.html（主线按脚本顺序，备选独立分组）
  python3 build/build.py validate [ID ...]             校验：听众文字逐字、必需属性、资源存在、禁用内容
  python3 build/build.py all                           skeleton + assets + assemble + validate
"""
import json, os, re, sys, shutil, html as htmlmod
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT.parent / '19_逐页内容脚本' / '逐页内容脚本.json'
if not SCRIPT.exists():  # 云端/克隆环境：使用仓库内副本
    SCRIPT = ROOT / 'content' / '逐页内容脚本.json'
PLAN = ROOT / 'plan' / 'pages_plan.json'
PAGES = ROOT / 'pages'
STAGES = ['教学设计', '课堂实施', '教学评价', '教师专业发展']
DOC_EXT = {'.md', '.docx', '.pdf', '.xlsx', '.html', '.htm', '.json', '.png', '.jpg', '.jpeg', '.txt'}
DENY_SUBSTR = ['.env', '教师管理']
DENY_EXT = {'.csv'}          # 原始数据不复制
DARK_TEMPLATES = {'T01', 'T16'}

def load():
    s = json.loads(SCRIPT.read_text(encoding='utf-8'))
    p = json.loads(PLAN.read_text(encoding='utf-8'))
    modules = {m['id']: m for m in s['modules']}
    pages = {x['id']: x for x in s['pages']}
    plan = {x['id']: x for x in p['pages']}
    return s, p, modules, pages, plan

def esc(t):
    return htmlmod.escape(str(t or ''), quote=True)

def rel_preview(path):
    """资源预览绝对路径 → 相对课件根目录"""
    if not path: return ''
    m = re.search(r'19_逐页内容脚本/(.*)$', path)
    return '../19_逐页内容脚本/' + m.group(1) if m else 'file://' + path

def doc_target(asset_id, path):
    p = Path(path)
    return f'assets/docs/{asset_id}/{p.name}'

def copyable(path):
    p = Path(path)
    if not p.is_file(): return False
    if p.suffix.lower() in DENY_EXT: return False
    if any(d in str(p) for d in DENY_SUBSTR): return False
    if p.suffix.lower() not in DOC_EXT: return False
    if p.stat().st_size > 40 * 1024 * 1024: return False
    return True

# ────────────────────────── 骨架 ──────────────────────────
def default_body(pg, pl):
    a = pg['audience']; blocks = a.get('blocks', [])
    t = pl['template']
    out = []
    if t == 'T06' and len(blocks) == 3:
        out.append('  <div class="body"><div class="grid-3 reveal-group" style="margin-top:auto;margin-bottom:auto">')
        for b in blocks:
            out.append(f'    <div class="card reveal"><div class="label">{esc(b["label"])}</div><p>{esc(b["text"])}</p></div>')
        out.append('  </div></div>')
    elif t == 'T02':
        out.append('  <div class="body" style="justify-content:center">')
        for b in blocks:
            out.append(f'    <p class="text reveal" style="max-width:1400px"><span class="hl">{esc(b["label"])}</span>　{esc(b["text"])}</p>')
        out.append('  </div>')
    else:
        out.append('  <div class="body stack" style="justify-content:center">')
        for b in blocks:
            lab = f'<div class="label">{esc(b["label"])}</div>' if b.get('label') else ''
            out.append(f'    <div class="reveal">{lab}<p class="text">{esc(b["text"])}</p></div>')
        out.append('  </div>')
    return '\n'.join(out)

def notes_html(pg, pl, plan_assets):
    pr = pg['production']; a = pg['audience']
    parts = [f'【{pg["pace"]}】' + esc(pr.get('speaker_notes', ''))]
    if pr.get('purpose'): parts.append('作用：' + esc(pr['purpose']))
    links = []
    for r in pr.get('resources', []):
        aid = r.get('asset_id', '')
        if r.get('preview_path'):
            links.append(f'<a href="{esc(rel_preview(r["preview_path"]))}">{esc(aid)} {esc(r.get("name",""))}</a>')
        for name, path in r.get('links', []):
            if path.startswith('http'):
                links.append(f'<a href="{esc(path)}">{esc(name)}</a>')
            elif copyable(path):
                links.append(f'<a href="{esc(doc_target(aid, path))}">{esc(name)}</a>')
            else:
                links.append(f'<a href="file://{esc(path)}" title="原路径，仅本机有效">{esc(name)}</a>')
    if links: parts.append('资源：' + ' '.join(links))
    return '\n    '.join(parts)

def skeleton(pg, pl, plan_assets, modules):
    a = pg['audience']; pr = pg['production']
    mod = modules[pg['module']]
    stage = pr.get('framework', {}).get('stage', '')
    stage = stage if stage in STAGES else ''
    dark = ' dark' if pl['template'] in DARK_TEMPLATES else ''
    kind = pg.get('kind', '主线')
    replaces = f' data-replaces="模块{pg["module"]} {esc(mod["title"])}"' if kind == '备选' else ''
    assets_c = []
    for aid in pl.get('cat1_images', []) + [e['asset'] for e in pl.get('cat3_embeds', [])]:
        A = plan_assets.get(aid)
        if A: assets_c.append(f'{aid} → {A.get("target") or A.get("source")} ({A.get("type")}) {A.get("note","")}')
    plan_c = (f'PLAN template={pl["template"]} executor={pl["executor"]} pace={pg["pace"]} layout_ref={pl["layout_ref"]}\n'
              f'     reveal={pl.get("cat2_reveal")}\n     embeds={json.dumps(pl.get("cat3_embeds"), ensure_ascii=False)}\n'
              f'     anim={json.dumps(pl.get("cat4_animation"), ensure_ascii=False)}\n     note={pl.get("note","")}\n'
              + ('     assets:\n       ' + '\n       '.join(assets_c) if assets_c else ''))
    sub = f'\n  <p class="sub reveal-none">{esc(a.get("subtitle"))}</p>' if a.get('subtitle') else ''
    foot = f'\n  <div class="foot">{esc(a.get("footnote"))}</div>' if a.get('footnote') else ''
    return f'''<!-- {plan_c} -->
<section class="slide{dark}" data-id="{pg["id"]}" data-title="{esc(a["title"])}" data-module="{pg["module"]} {esc(mod["title"])}" data-stage="{stage}" data-kind="{kind}"{replaces} data-template="{pl["template"]}" data-status="{"draft" if pl["template"]=="T02" else "skeleton"}">
  <div class="hdr">
    <div class="locator"><b>{pg["module"]}</b><span class="on">{esc(mod["title"])}</span></div>
    <span class="pid">{pg["id"]}</span>
  </div>
  <h2 class="title">{esc(a["title"])}</h2>{sub}
  <!-- BODY:START -->
{default_body(pg, pl)}
  <!-- BODY:END -->{foot}
  <aside class="notes">{notes_html(pg, pl, plan_assets)}</aside>
</section>
'''

def cmd_skeleton(args):
    force = '--force' in args; ids = [x for x in args if not x.startswith('--')]
    s, p, modules, pages, plan = load()
    PAGES.mkdir(exist_ok=True)
    n = 0
    for pg in s['pages']:
        if ids and pg['id'] not in ids: continue
        f = PAGES / f'{pg["id"]}.html'
        if f.exists() and not force: continue
        f.write_text(skeleton(pg, plan[pg['id']], p['assets'], modules), encoding='utf-8')
        n += 1
    print(f'skeleton: wrote {n} page(s)')

# ────────────────────────── 素材 ──────────────────────────
def cmd_assets(args):
    s, p, modules, pages, plan = load()
    copied = skipped = missing = 0
    log = []
    for aid, A in p['assets'].items():
        src, tgt, typ = A.get('source', ''), A.get('target', ''), A.get('type', '')
        if typ not in ('img', 'video', 'iframe') or not src or not tgt: continue
        sp, tp = Path(src), ROOT / tgt
        if not sp.exists(): missing += 1; log.append(f'MISSING {aid}: {src}'); continue
        if tp.exists(): skipped += 1; continue
        tp.parent.mkdir(parents=True, exist_ok=True)
        if sp.is_dir():
            dest = tp.parent if tp.suffix else tp
            shutil.copytree(sp, dest, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.env*', '*.csv', '.git*', 'node_modules'))
        else: shutil.copy2(sp, tp)
        copied += 1
    docs = {}
    for pg in s['pages']:
        for r in pg['production'].get('resources', []):
            aid = r.get('asset_id', '')
            for name, path in r.get('links', []):
                if path.startswith('http') or not copyable(path): continue
                tgt = ROOT / doc_target(aid, path)
                docs[str(tgt)] = path
                if tgt.exists(): continue
                tgt.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, tgt); copied += 1
    (ROOT / 'assets' / 'docs' / 'index.json').write_text(json.dumps({os.path.relpath(k, ROOT): v for k, v in docs.items()}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'assets: copied {copied}, existing {skipped}, missing {missing}, docs {len(docs)}')
    for l in log: print('  ' + l)

# ────────────────────────── 组装 ──────────────────────────
def cmd_assemble(args):
    s, p, modules, pages, plan = load()
    head = (ROOT / 'build' / 'template_head.html').read_text(encoding='utf-8')
    tail = (ROOT / 'build' / 'template_tail.html').read_text(encoding='utf-8')
    order = [x['id'] for x in s['pages'] if x.get('kind') != '备选'] + [x['id'] for x in s['pages'] if x.get('kind') == '备选']
    body = []; manifest = []; miss = []
    for pid in order:
        f = PAGES / f'{pid}.html'
        if not f.exists(): miss.append(pid); continue
        t = f.read_text(encoding='utf-8')
        m = re.search(r'<section class="slide[\s\S]*?</section>', t)
        if not m: miss.append(pid); continue
        sec = m.group(0)
        st = re.search(r'data-status="([^"]*)"', sec)
        manifest.append({'id': pid, 'status': st.group(1) if st else 'unknown', 'kind': pages[pid].get('kind'), 'executor': plan[pid]['executor']})
        body.append(f'<!-- ═══════════════ {pid} {pages[pid]["audience"]["title"]} ═══════════════ -->\n{sec}\n')
    out = head + '<div id="stage">\n\n' + '\n'.join(body) + '\n</div><!-- /#stage -->\n\n' + tail.split('</div><!-- /#stage -->')[-1].lstrip('\n') if '</div><!-- /#stage -->' in tail else head + '<div id="stage">\n\n' + '\n'.join(body) + '\n</div><!-- /#stage -->\n\n<!-- ═══ 运行时界面 ═══ -->\n<div id="jump"></div>\n' + tail
    (ROOT / 'index.html').write_text(out, encoding='utf-8')
    (ROOT / 'build' / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding='utf-8')
    from collections import Counter
    print(f'assemble: {len(body)} pages → index.html; missing {miss}; status {dict(Counter(m["status"] for m in manifest))}')

# ────────────────────────── 校验 ──────────────────────────
def strip_text(h):
    h = re.sub(r'<aside class="notes">[\s\S]*?</aside>', '', h)
    h = re.sub(r'<!--[\s\S]*?-->', '', h)
    h = re.sub(r'<(script|style)[\s\S]*?</\1>', '', h)
    h = re.sub(r'<[^>]+>', '', h)
    h = htmlmod.unescape(h)
    return norm(h)

def norm(t):
    """去空白与标点（含全角、破折号、引号），只比字与数字，用于逐字比对"""
    import unicodedata
    return ''.join(c for c in t if not (c.isspace() or unicodedata.category(c)[0] in 'PSZ'))

def cmd_validate(args):
    ids = [x for x in args if not x.startswith('--')]
    s, p, modules, pages, plan = load()
    errors = 0; warns = 0
    for pg in s['pages']:
        pid = pg['id']
        if ids and pid not in ids: continue
        f = PAGES / f'{pid}.html'
        if not f.exists(): print(f'{pid} ERROR 缺少页面文件'); errors += 1; continue
        raw = f.read_text(encoding='utf-8')
        sec = re.search(r'<section class="slide[\s\S]*?</section>', raw)
        if not sec: print(f'{pid} ERROR 没有 section.slide'); errors += 1; continue
        sec = sec.group(0)
        probs = []
        for attr in ('data-id', 'data-title', 'data-module'):
            if f'{attr}="' not in sec: probs.append(f'缺少 {attr}')
        if f'data-id="{pid}"' not in sec: probs.append('data-id 不符')
        if '<aside class="notes">' not in sec: probs.append('缺少讲者备注 aside.notes')
        if f'class="pid"' not in sec and pid not in sec.split('</h')[0]: probs.append('缺少页码 .pid')
        text = strip_text(sec)
        a = pg['audience']
        for label, val in [('标题', a.get('title'))] + [(f'块「{b.get("label")}」', b.get('text')) for b in a.get('blocks', [])] + [('页脚', a.get('footnote'))]:
            if not val: continue
            if norm(val) not in text:
                # 允许长文本被拆成若干句（每句都要在）
                sents = [norm(x) for x in re.split(r'(?<=[。；！？\n])', val) if norm(x)]
                if not sents or not all(x in text for x in sents):
                    probs.append(f'{label} 文字未逐字出现')
        for d in DENY_SUBSTR:
            if d in sec: probs.append(f'含禁用内容 {d}')
        for m in re.finditer(r'(?:src|href|data-src|poster|data-fallback)="([^"]+)"', sec):
            u = m.group(1)
            if u.startswith(('http', 'file://', '#', 'mailto', 'data:', 'javascript')): continue
            if not (ROOT / u.split('#')[0].split('?')[0]).exists(): probs.append(f'资源不存在 {u}')
        pl = plan[pid]
        if pl.get('cat2_reveal') and not re.search(r'class="[^"]*\breveal\b', sec) and 'data-reveal=' not in sec: probs.append('WARN 计划分步但无 .reveal')
        if pl.get('cat4_animation') and 'class="anim' not in sec: probs.append('WARN 计划动画但无 .anim')
        st = re.search(r'data-status="([^"]*)"', sec)
        if st and st.group(1) == 'skeleton': probs.append('WARN 仍是骨架')
        for pr in probs:
            if pr.startswith('WARN'): warns += 1
            else: errors += 1
            print(f'{pid} {pr}')
    print(f'validate: {errors} error(s), {warns} warning(s)')
    return errors

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'all'; rest = sys.argv[2:]
    if cmd == 'skeleton': cmd_skeleton(rest)
    elif cmd == 'assets': cmd_assets(rest)
    elif cmd == 'assemble': cmd_assemble(rest)
    elif cmd == 'validate': sys.exit(1 if cmd_validate(rest) else 0)
    elif cmd == 'all': cmd_skeleton(rest); cmd_assets(rest); cmd_assemble(rest); cmd_validate(rest)
    else: print(__doc__)
