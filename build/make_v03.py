#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v0.2 → v0.3 脚本转换。
  python3 build/make_v03.py seeds  OUTDIR      # 生成 Kimi 批次输入（JSON）
  python3 build/make_v03.py build  [KIMI_DIR]  # 合并 Kimi 输出，写 content/逐页内容脚本.json v0.3 并同步到 19_
依据 plan/主线.md；页序与文字初稿在 build/v03_seed.py。
"""
import json, sys, copy, os, re, glob, datetime
sys.path.insert(0, os.path.dirname(__file__))
import v03_seed as S

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'content', '逐页内容脚本_v0.2.json')   # 冻结的 v0.2 输入（不要读自己的输出）
DST = os.path.join(ROOT, 'content', '逐页内容脚本.json')
SYNC = os.path.join(os.path.dirname(ROOT), '19_逐页内容脚本', '逐页内容脚本.json')
PLAN_IN = os.path.join(ROOT, 'plan', 'pages_plan_v0.2.json')
PLAN = os.path.join(ROOT, 'plan', 'pages_plan.json')

T2L = {'T01': 'L01', 'T02': 'L01', 'T03': 'L07', 'T04': 'L05', 'T05': 'L03', 'T06': 'L04', 'T07': 'L05', 'T08': 'L09',
       'T09': 'L06', 'T10': 'L07', 'T11': 'L06', 'T12': 'L08', 'T13': 'L05', 'T14': 'L07', 'T15': 'L10', 'T16': 'L02',
       'T17': 'L04', 'T18': 'L04'}
CAP_SET = set(S.CAP)

def term(s):
    if not isinstance(s, str): return s
    for a, b in S.TERM_MAP: s = s.replace(a, b)
    return s

def term_deep(x):
    if isinstance(x, str): return term(x)
    if isinstance(x, list): return [term_deep(i) for i in x]
    if isinstance(x, dict): return {k: term_deep(v) for k, v in x.items()}
    return x

def fix_framework(fw, caps=None, stage=None):
    fw = dict(fw or {})
    if 'roles' in fw:
        fw['roles'] = [S.ROLE_MAP.get(r, r) for r in fw['roles']]
    if caps: fw['roles'] = list(caps)
    if 'questions' in fw or caps: fw['questions'] = list(S.NEW_QUESTIONS)
    if stage: fw['stage'] = stage
    fw.pop('three_questions_reference', None)
    if 'embedding' in fw: fw['embedding'] = '内容生成支持情境与产物，角色扮演支持交流与追问，连通管道组织背景与记录。'
    return fw

def blocks_of(seed, srcpage):
    b = seed.get('blocks')
    if b == 'INHERIT' or b == 'INHERIT+':
        out = [[x['label'], x['text']] for x in srcpage['audience']['blocks']]
        out = term_deep(out)
        if b == 'INHERIT+': out += seed.get('extra_blocks', [])
        return out
    return b

def load():
    d = json.load(open(SRC, encoding='utf-8'))
    return d, {p['id']: p for p in d['pages']}

def seq_from(title, sub, blocks, seed):
    seq = [{'step': 1, 'content': '主标题与副标题' if sub else '主标题'}]
    if seed.get('template') in ('T17', 'T18'):
        # 规则二：需求一句 → 三问逐问 → 所以用到
        n = 2
        for lab, txt in blocks:
            seq.append({'step': n, 'content': f'{lab}：{txt}'}); n += 1
    else:
        for i, (lab, txt) in enumerate(blocks):
            seq.append({'step': i + 2, 'content': f'{lab}：{txt}' if lab else txt})
    return seq

def make_page(seed, pg, kimi, module_title):
    pid = seed['id']; src = seed.get('src')
    srcpage = pg.get(src) if src else None
    keepish = seed['mode'] == '沿用' or seed.get('notes_only')
    if keepish and not kimi.get(pid, {}).get('speaker_notes'):
        p = copy.deepcopy(srcpage)
        p['audience'] = term_deep(p['audience'])
        if pid == 'P001' and '4＋3＋3' in p['audience'].get('subtitle', ''): p['audience']['subtitle'] = ''
        pr = p['production']
        for k in ('purpose', 'presentation', 'speaker_notes', 'layout_reference', 'presentation_reference'):
            pr[k] = term(pr.get(k, ''))
        pr['checks'] = term_deep(pr.get('checks', []))
        pr['framework'] = fix_framework(pr.get('framework'))
        if seed.get('note'): pr['presentation'] = seed['note'] + ' ' + pr['presentation']
        p['id'] = pid; p['module'] = seed['module']; p['module_title'] = module_title; p['kind'] = '主线'
        p['v03'] = {'mode': '沿用', 'src': src}
        return p
    # 改写 / 新写 / 合并（或沿用但换备注）
    k = kimi.get(pid, {})
    if keepish:
        p = copy.deepcopy(srcpage); p['audience'] = term_deep(p['audience'])
        pr = p['production']
        for kk in ('purpose', 'presentation', 'layout_reference', 'presentation_reference'): pr[kk] = term(pr.get(kk, ''))
        pr['checks'] = term_deep(pr.get('checks', [])); pr['framework'] = fix_framework(pr.get('framework'))
        pr['speaker_notes'] = k.get('speaker_notes') or term(pr['speaker_notes'])
        p['id'] = pid; p['module'] = seed['module']; p['module_title'] = module_title; p['kind'] = '主线'
        p['v03'] = {'mode': '沿用（备注改写）', 'src': src}
        return p
    base = copy.deepcopy(srcpage) if srcpage else copy.deepcopy(pg['P022'])
    title = k.get('title') or seed['title']
    sub = k.get('subtitle') if 'subtitle' in k else seed.get('sub', '')
    blocks = k.get('blocks') or blocks_of(seed, srcpage)
    foot = k.get('footnote') if 'footnote' in k else seed.get('foot', '')
    tpl = seed.get('template') or base.get('layout')
    layout = T2L.get(tpl, base.get('layout', 'L03'))
    lname = {l['id']: l['name'] for l in LAYOUTS}[layout]
    pr = base['production']
    resources = []
    seen = set()
    for sid in [src] + seed.get('res_from', []):
        if sid and sid in pg:
            for r in pg[sid]['production'].get('resources', []):
                if r['asset_id'] not in seen: seen.add(r['asset_id']); resources.append(copy.deepcopy(r))
    stage = seed.get('stage') or (pr.get('framework', {}).get('stage') if srcpage else None) or '引入、组合或收束'
    fw = fix_framework(pr.get('framework') if srcpage else {}, caps=seed.get('caps'), stage=stage)
    if not seed.get('caps'): fw.pop('roles', None); fw.pop('embedding', None)
    checks = ['上屏文字与脚本 audience 字段逐字一致；制作说明只保留在备注中。', '示例、真实记录与生成内容的标识不混淆。']
    if tpl in ('T17', 'T18'):
        checks.append('案例卡按规则二：需求一句 → 三问逐问揭示 → 所以用到；只列实际用到的能力，不把三问与能力一一对应。')
    if '【待' in json.dumps([title, sub, blocks, foot], ensure_ascii=False): checks.append('本页含【待用户提供/待核】占位，制作前需替换。')
    newpr = {
        'purpose': seed.get('purpose', pr.get('purpose', '')),
        'presentation': seed.get('image', '') or term(pr.get('presentation', '')),
        'previous': '', 'next': '',
        'speaker_notes': k.get('speaker_notes') or seed.get('notes') or (term(pr.get('speaker_notes', '')) if srcpage else ''),
        'resources': resources, 'checks': checks,
        'blueprint_function': '委托' if tpl in ('T17', 'T18') else pr.get('blueprint_function', '方法'),
        'previous_page': {}, 'next_page': {},
        'sequence_note': pr.get('sequence_note', '按主线顺序推进；演示时间包含在模块时间内。'),
        'source_links': pr.get('source_links', []) if srcpage else [],
        'screen_sequence': seq_from(title, sub, blocks, seed),
        'layout_constraints': pr.get('layout_constraints', ''), 'handoff_rule': pr.get('handoff_rule', ''),
        'framework': fw,
        'production_readiness': pr.get('production_readiness', ''),
        'presentation_reference': f'采用 {tpl}；{seed.get("image", "")}',
        'layout_reference': pr.get('layout_reference', ''),
        'layout_decision': dict(pr.get('layout_decision', {}), content_focus=title, reference_type=f'{layout} {lname}'),
    }
    p = {
        'id': pid,
        'audience': {'title': title, 'subtitle': sub, 'blocks': [{'label': l, 'text': t} for l, t in blocks], 'footnote': foot},
        'production': newpr, 'module': seed['module'], 'module_title': module_title, 'kind': '主线',
        'layout': layout, 'layout_name': lname, 'pace': seed.get('pace', base.get('pace', '停讲')),
        'blueprint_title': title, 'asset_ids': [r['asset_id'] for r in resources],
        'v03': {'mode': seed['mode'], 'src': src, 'srcs': seed.get('srcs', []), 'template': tpl, 'kimi': bool(k)},
    }
    return p

def make_backup(bp, kimi):
    pid = bp['id']; ov = S.BACKUP_OVERRIDES.get(pid)
    p = copy.deepcopy(bp)
    p['audience'] = term_deep(p['audience'])
    pr = p['production']
    for kk in ('purpose', 'presentation', 'speaker_notes', 'layout_reference', 'presentation_reference'): pr[kk] = term(pr.get(kk, ''))
    pr['checks'] = term_deep(pr.get('checks', [])); pr['framework'] = fix_framework(pr.get('framework'))
    p['v03'] = {'mode': '沿用', 'src': pid}
    if ov:
        k = kimi.get(pid, {})
        p['audience'] = {'title': k.get('title') or ov['title'], 'subtitle': k.get('subtitle', ov['sub']),
                         'blocks': [{'label': l, 'text': t} for l, t in (k.get('blocks') or ov['blocks'])],
                         'footnote': k.get('footnote', ov['foot'])}
        pr['framework'] = fix_framework(pr.get('framework'), caps=ov.get('caps'))
        if k.get('speaker_notes'): pr['speaker_notes'] = k['speaker_notes']
        pr['screen_sequence'] = seq_from(p['audience']['title'], p['audience']['subtitle'], [[b['label'], b['text']] for b in p['audience']['blocks']], {})
        p['blueprint_title'] = p['audience']['title']
        p['v03'] = {'mode': '改写', 'src': pid, 'kimi': bool(k)}
    return p

def link(pages):
    mains = [p for p in pages if p['kind'] == '主线']
    for i, p in enumerate(mains):
        pr = p['production']
        if i > 0:
            q = mains[i - 1]; pr['previous_page'] = {'id': q['id'], 'title': q['audience']['title']}
            pr['previous'] = f'承接{q["id"]}「{q["audience"]["title"]}」。'
        else:
            pr['previous_page'] = {}; pr['previous'] = '开场。'
        if i < len(mains) - 1:
            q = mains[i + 1]; pr['next_page'] = {'id': q['id'], 'title': q['audience']['title']}
            pr['next'] = f'进入{q["id"]}「{q["audience"]["title"]}」。'
        else:
            pr['next_page'] = {}; pr['next'] = '结束。'

def modules(mains):
    out = []; n = 1
    for mid, mt in S.MODULES:
        ids = [p for p in mains if p['module'] == mid]
        out.append({'id': mid, 'title': mt, 'minutes': None, 'count': len(ids), 'start': n, 'end': n + len(ids) - 1}); n += len(ids)
    return out

LAYOUTS = None

def build(kimi_dir=None):
    global LAYOUTS
    d, pg = load(); LAYOUTS = d['layouts']
    kimi = {}
    if kimi_dir:
        for f in sorted(glob.glob(os.path.join(kimi_dir, '*.json'))):
            for item in json.load(open(f, encoding='utf-8')):
                kimi[item['id']] = item
    mt = dict(S.MODULES)
    mains = [make_page(sd, pg, kimi, mt[sd['module']]) for sd in S.SEED]
    backs = [make_backup(p, kimi) for p in d['pages'] if p['kind'] == '备选' and p['id'] not in S.BACKUP_DROP]
    for b in backs: b['module_title'] = mt.get(b['module'], b['module_title'])
    pages = mains + backs
    link(pages)
    mods = modules(mains)
    old_min = {m['id']: m.get('minutes') for m in d['modules']}
    for m in mods: m['minutes'] = old_min.get(m['id'])
    out = copy.deepcopy(d)
    out.update({'version': '0.3', 'date': datetime.date.today().isoformat(),
                'counts': {'main': len(mains), 'backup': len(backs)}, 'modules': mods, 'pages': pages})
    out['authorship'] = {'draft': 'v0.2：Pi CLI · deepseek-flash；v0.3：主控按 plan/主线.md 重排合并，中文润色与讲者备注由 Kimi K3（pi kimi-coding/k3）并行完成',
                         'editorial': '主控逐页审校；沿用页文字只做术语替换（见 build/v03_seed.py TERM_MAP）', 'note': '备选页 B05–B08 升入主线（P042F/P042D/P042B/P042H）。'}
    out['methodology'] = {'name': '3＋3＋4', 'capabilities': S.CAP, 'questions': S.NEW_QUESTIONS,
                          'stages': ['教学设计', '课堂实施', '教学评价', '教师专业发展'],
                          'source': 'plan/主线.md（七拍＋三条规则）', 'case_card_rule': '需求一句 → 三问逐问揭示 → 所以用到（只列实际用到的能力）'}
    old = json.load(open(SRC, encoding='utf-8'))
    dropped = [p['id'] for p in old['pages'] if p['id'] not in {q['id'] for q in pages} and p['id'] not in [s.get('src') for s in S.SEED]]
    json.dump(out, open(DST, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    if os.path.isdir(os.path.dirname(SYNC)):
        json.dump(out, open(SYNC, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    update_plan(out)
    overview(out)
    print('v0.3 written:', len(mains), 'main /', len(backs), 'backup; kimi merged:', len(kimi))
    print('modules:', [(m['id'], m['count'], m['start'], m['end']) for m in mods])
    print('dropped (no longer referenced):', dropped)
    pend = [p['id'] for p in pages if '【待' in json.dumps(p['audience'], ensure_ascii=False)]
    print('pages with 【待…】 placeholders:', pend)
    return out

def update_plan(script):
    pl = json.load(open(PLAN_IN, encoding='utf-8'))
    old = {p['id']: p for p in pl['pages']}
    seedmap = {s['id']: s for s in S.SEED}
    pl['templates']['T17'] = {'name': '案例卡（需求→三问逐问→所以用到）', 'sample': 'P023'}
    pl['templates']['T18'] = {'name': '快闪：成果大图60%＋右栏紧凑卡', 'sample': 'P042B'}
    pl['templates']['T16'] = {'name': '3＋3＋4 地图（暗底/亮底，components/map334.js）', 'sample': 'P095'}
    new = []
    for p in script['pages']:
        sd = seedmap.get(p['id'])
        src = (sd or {}).get('src') or p['id']
        e = copy.deepcopy(old.get(p['id']) or old.get(src) or {})
        keep = bool((sd and (sd['mode'] == '沿用' or sd.get('notes_only'))) or (p['kind'] == '备选' and p['id'] not in S.BACKUP_OVERRIDES))
        has_html = os.path.exists(os.path.join(ROOT, 'pages', p['id'] + '.html'))
        tpl = (sd or {}).get('template') or e.get('template', '')
        entry = {
            'id': p['id'], 'module': p['module'], 'kind': p['kind'], 'pace': p['pace'], 'title': p['audience']['title'],
            'layout_ref': p['layout'], 'template': tpl,
            'executor': 'existing' if keep and has_html else 'cloud',
            'existing_page': bool(keep and has_html),
            'src_page': src if src != p['id'] else None,
            'cat1_images': e.get('cat1_images', []), 'cat2_reveal': e.get('cat2_reveal', []),
            'cat3_embeds': e.get('cat3_embeds', []), 'cat4_animation': e.get('cat4_animation'),
            'note': ((sd or {}).get('note') or (sd or {}).get('image') or e.get('note', '')),
            'batch': e.get('batch', '') if keep else 'V3',
            'v03_mode': (sd or {}).get('mode', '沿用' if p['kind'] == '备选' else ''),
        }
        if tpl in ('T17', 'T18', 'T06'):
            entry['cat2_reveal'] = [b['label'] for b in p['audience']['blocks'] if b['label'].startswith(('①', '②', '③'))]
        if tpl == 'T16': entry['cat4_animation'] = entry.get('cat4_animation') or 'map334'
        new.append(entry)
    pl['pages'] = new
    pl['meta']['version'] = 'v2 2026-09-15（v0.3）'
    pl['meta']['page_count'] = len(new)
    pl['meta']['source'] = 'content/逐页内容脚本.json v0.3 ＋ plan/主线.md'
    pl['meta']['decisions_2026-09-15'] = {
        'D1': '方法论改为 3＋3＋4：三类能力（内容生成/连通管道/角色扮演）→ 三问（目标设定/验收标准/上下文构建）→ 四环节；components/map433.js 改为 map334.js，顺序 能力→三问→环节。',
        'D2': '案例卡 T17：环节作页眉语境；上栏典型需求一句；中栏三问逐问揭示（data-step 1/2/3）；底栏"所以用到：…"只列实际用到的能力。',
        'D3': '案例分两档：全推导（植物单元 P026A、四季 P039、喀什 P058、沉与浮 P070）用 T17；快闪（磁场/光路/几何/生态岛/望庐山/共读角/四季轨迹/纸质记录）用 T18 一页。',
        'D4': '上屏文字不含元信息（不出现"本页""接下来""示例模板"等）；材料性质说明限于脚注一句。',
        'D5': '新页与改写页统一在 batch V3 制作；沿用页只做术语替换与定位条更新，不重做。',
    }
    pl['batches'] = dict(pl.get('batches', {}), V3='cloud · v0.3 新页/改写页/合并页（按 build/cloud_brief.md 分批）')
    json.dump(pl, open(PLAN, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    import collections
    print('plan templates:', collections.Counter(e['template'] for e in new).most_common())
    print('plan executors:', collections.Counter(e['executor'] for e in new))

def seeds(outdir):
    """生成 Kimi 输入：每页一条 {id, mode, purpose, layout, title, subtitle, blocks, footnote, verbatim, old_notes, notes_hint, stage, caps, prev, next}"""
    global LAYOUTS
    d, pg = load(); LAYOUTS = d['layouts']
    mt = dict(S.MODULES)
    items = []
    order = [sd['id'] for sd in S.SEED]
    for i, sd in enumerate(S.SEED):
        if not sd.get('kimi'): continue
        src = sd.get('src'); sp = pg.get(src) if src else None
        blocks = blocks_of(sd, sp) if sd['mode'] != '沿用' else [[b['label'], b['text']] for b in term_deep(sp['audience']['blocks'])]
        prev_t = S.SEED[i - 1]['title'] if i > 0 and 'title' in S.SEED[i - 1] else (pg[S.SEED[i - 1]['id']]['audience']['title'] if i > 0 else '')
        nxt = S.SEED[i + 1] if i + 1 < len(S.SEED) else None
        next_t = (nxt.get('title') or pg.get(nxt['id'], {}).get('audience', {}).get('title', '')) if nxt else ''
        item = {
            'id': sd['id'], 'module': f"{sd['module']} {mt[sd['module']]}", 'mode': sd['mode'],
            'purpose': sd.get('purpose', sp['production']['purpose'] if sp else ''),
            'layout': sd.get('image', ''),
            'title': sd.get('title', sp['audience']['title'] if sp else ''),
            'subtitle': sd.get('sub', term(sp['audience']['subtitle']) if sp else ''),
            'blocks': blocks, 'footnote': sd.get('foot', term(sp['audience']['footnote']) if sp else ''),
            'verbatim': sd.get('verbatim', []),
            'old_notes': term(sp['production']['speaker_notes']) if sp else '',
            'extra_old_notes': [term(pg[x]['production']['speaker_notes']) for x in sd.get('srcs', []) if x in pg and x != src],
            'notes_hint': sd.get('notes_hint', ''), 'stage': sd.get('stage', ''), 'caps': sd.get('caps', []),
            'prev_title': prev_t, 'next_title': next_t,
            'notes_only': bool(sd.get('notes_only')),
        }
        items.append(item)
    for bid, ov in S.BACKUP_OVERRIDES.items():
        sp = pg[bid]
        items.append({'id': bid, 'module': f"{sp['module']} {mt[sp['module']]}", 'mode': '改写', 'purpose': sp['production']['purpose'],
                      'layout': '', 'title': ov['title'], 'subtitle': ov['sub'], 'blocks': ov['blocks'], 'footnote': ov['foot'],
                      'verbatim': ov.get('verbatim', []), 'old_notes': term(sp['production']['speaker_notes']), 'extra_old_notes': [],
                      'notes_hint': '', 'stage': sp['production']['framework'].get('stage', ''), 'caps': ov.get('caps', []),
                      'prev_title': '', 'next_title': '', 'notes_only': False})
    os.makedirs(outdir, exist_ok=True)
    n = 6
    batches = [items[i:i + n] for i in range(0, len(items), n)]
    for bi, b in enumerate(batches, 1):
        json.dump(b, open(os.path.join(outdir, f'in_{bi:02d}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('kimi items:', len(items), 'batches:', len(batches), '->', outdir)

def overview(script, path=None):
    path = path or os.path.join(ROOT, 'plan', '脚本文字速览.txt')
    """重写 plan/脚本文字速览.txt：每页上屏文字速览（起草/核对用，不是校验源）。"""
    out = ['MODULES: ' + repr([(m['id'], m['title']) for m in script['modules']]), '']
    for p in script['pages']:
        a, pr = p['audience'], p['production']
        out.append(f"## {p['id']} [{p['module']} {p.get('pace', '')}] {a.get('title', '')}")
        if a.get('subtitle'): out.append(f"  sub: {a['subtitle']}")
        for b in a.get('blocks', []): out.append(f"  - {b['label']}: {b['text']}")
        if a.get('footnote'): out.append(f"  foot: {a['footnote']}")
        out.append(f"  purpose: {pr.get('purpose', '')}")
        fw = pr.get('framework', {})
        out.append('  fw: ' + json.dumps({k: fw[k] for k in ('stage', 'roles', 'questions') if k in fw}, ensure_ascii=False))
        out.append(f"  res: {[r.get('title', r.get('asset_id', '')) for r in pr.get('resources', [])]}")
        if p.get('v03'): out.append(f"  v03: {p['v03'].get('mode', '')} ← {p['v03'].get('src') or '新'}  模板 {p['v03'].get('template', '')}")
        out.append('')
    open(path, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    print('overview written:', os.path.basename(path), len(script['pages']), 'pages')



if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'build'
    if cmd == 'seeds': seeds(sys.argv[2])
    elif cmd == 'build': build(sys.argv[2] if len(sys.argv) > 2 else None)
    else: print(__doc__)
