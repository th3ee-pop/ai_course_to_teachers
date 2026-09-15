#!/usr/bin/env python3
"""用 pi CLI（deepseek-flash）按批生成静态页正文。
用法：python3 build/gen_pi.py S2            # 整批
      python3 build/gen_pi.py P004 P009     # 指定页
可选：--size 4（每次调用页数）--dry（只写提示词不调用）--force（已 draft/done 也重做）
输出：pages/<ID>.html 正文区被替换、data-status=draft；记录在 build/pi_runs/。
校验失败的页恢复骨架（build/skeleton_backup/）。
"""
import json, re, sys, subprocess, time, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / 'pages'
RUNS = ROOT / 'build' / 'pi_runs'; RUNS.mkdir(exist_ok=True)
BACKUP = ROOT / 'build' / 'skeleton_backup'; BACKUP.mkdir(exist_ok=True)
PLAN = json.load(open(ROOT / 'plan' / 'pages_plan.json', encoding='utf-8'))
MODEL = 'deepseek/deepseek-flash'
BODY_RE = re.compile(r'<!-- BODY:START -->.*?<!-- BODY:END -->', re.S)

RULES = """你是课件页面排版助手。输入是若干页“骨架 HTML”（1920×1080 投影课件的一页），你只需要重写每页 <!-- BODY:START --> 与 <!-- BODY:END --> 之间的正文区，让它按模板要求排版并有分步出现。

硬性规则（违反会被校验脚本退回）：
1. 只输出正文区。不要输出 <section>、.hdr、h2.title、.sub、.foot、<aside class="notes">，也不要改它们。
2. 文字零改写：骨架正文里每个 .label 与 .text 的文字必须逐字保留（不增删字、不改标点、不合并、不翻译）。可以增加的只有很短的视觉标签：“示意图”“示例对话”“AI生成试样”“待放入实拍照片”“角色模拟，非历史人物真实发言”。不得加入骨架里没有的事实、数字、引语、英文。
3. 只用给定的 CSS 类与少量内联样式（flex/grid/gap/margin/max-width/font-size/color 用变量）。不写 <style>、<script>、不引外部图片或外部链接。
4. 图片只用 PLAN 注释 assets 里给出的相对路径；`(capture)` `(codex-svg)` `(img)` 类的路径可以直接 <img src>。路径含 * 的（如 cap_D04_word_*.png）按 _1、_2 展开。`(placeholder)` 类或文件标注“待…”的不放 img，用 <div class="slot"><div class="placeholder">待放入产品截图</div></div>。`(external)` `(link)` 类不是图片：`(link)` 用 <a class="file-card" href="路径">文件名</a>；`(external)` 用 <a class="link-card unset" data-config="observatoryUrl|magnetUrl|labUrl|ecoUrl"><b>系统名</b><span>现场启动后填入地址</span></a>（观察台→observatoryUrl，掌中磁场→magnetUrl，掌中实验室→labUrl，生态岛→ecoUrl）。
5. 分步：PLAN 注释 reveal=[...] 列出的条目按顺序各自加 class="reveal"（同一条目的标签与正文放在同一个 .reveal 容器内）；reveal 为空的页不加 .reveal。不要自创其它动效类。骨架里已有的 .reveal 划分要保留。
6. 结构：正文区最外层固定是 <div class="body">…</div>（可加 style），.cols / .grid-3 / .stack / .dialog 等都作为 .body 的子元素，不要把这些类直接加在 .body 上。图片写法固定为 <div class="fig" style="max-height:…px"><div class="pic"><img src="…" alt=""></div><figcaption class="caption">…</figcaption></div>（figcaption 可省），或 <div class="slot" style="height:…px"><img src="…" alt=""></div>。
7. 尺寸：正文字号 28–40px，行高 1.6 左右；一页正文最多 4 个块；图片用 .slot 或 .fig 包裹并设 max-height，保证在 1080 高度内不溢出（标题区约占 220px，页脚约 80px，正文可用高约 700px）。
8. 输出格式：每页依次
=== P004 ===
<!-- BODY:START -->
...
<!-- BODY:END -->
不要 Markdown 代码围栏，不要任何解释。
"""

CSS_REF = """可用 CSS 类（deck.css）：
- 布局：.body（正文容器，flex 列）.stack（竖排 gap 28）.cols（横排等分，子元素 flex:1；可放 <div class="vline"></div> 分隔线）.cols.tight .grid-2 .grid-3 .grid-4
- 文本：.label（小标题，26px 强调色）.text（32px）.lead（36px）.small（26px 灰）.muted .hl（强调色加粗）.num（等宽序号，配合 .label 使用：<span class="num">01</span>）.kicker（24px 字距大）.serif .cond .big（196px 大数字）.rule（分隔线）.takeaway（结论行）.quote-block（大引文）
- 卡片：.card（边框卡；内含 .label 与 <p>）.card.fill（灰底）.card.accent（强调边）.card.role-pipe/.card.role-tool/.card.role-subject（角色配色）
- 流程：.flow > .node（每步一格，含 .label 与 <p>）与 .arr（<div class="arr">→</div>）；.flow.vertical 竖排；.steps > li（带 01 02 序号的列表，<b> 为要点）
- 对话：.dialog > .turn（.who + .say）；AI 一方加 .turn.ai；.transcript > .line（.who + 文本，.mark 高亮）
- 对照：.before-after（两栏网格，每栏 <div>，内用 .label + p；.diff 标记差异，.fix 标记修正）
- 图片：.slot（居中容器，img 自适应；内可放 <div class="placeholder">待放入…</div>）.fig（图＋<figcaption class="caption">）.blueprint（蓝图边框）.kf（关键帧格）
- 标签：.tag（小标签）.tag.fill .tag.warn；.corner-tag（角标）
- 入口：.file-card（文件卡片链接）.link-card（外链卡片，配 data-config）.embed（内嵌 iframe 容器：<div class="embed" data-src="路径"><div class="hint">点击加载</div></div>）
- 组件：<div class="map433" data-stage="设计|实施|评价|教师专业发展" data-roles="管道,工具,主体" data-show="stages,roles,questions" data-reveal="1" data-size="full|compact"></div>（4＋3＋3 总图，自动渲染）；<div class="cycle" data-nodes="A|B|C|D" data-center="中心字" data-size="480"></div>（环形循环图）
颜色变量：var(--accent) #5980a6、var(--accent-dark) #416180、var(--light-blue) #94bce3、var(--muted) 灰、var(--surface) 浅灰底、var(--divider) 分隔线。
"""

GUIDE = {
 'T05': """模板 T05「机制流程·分步条目」：参考结构：<div class="body"><div class="cols" style="align-items:center;flex:1"><div class="stack" style="flex:1">…reveal 条目…</div><div class="vline"></div><div class="fig" style="flex:0 0 760px;max-height:520px"><span class="tag">示意图</span><div class="pic"><img src="…"></div></div></div></div>。把 reveal 里的各步排成一条流程。步数 ≤4 且每步文字短时用横向 .flow（每步一个 .node.reveal，含 .label 与 <p>，步间 <div class="arr">→</div>）；文字较长时用 .steps 列表或 .stack。若 assets 里有 (codex-svg) 示意图，放在流程上方或左侧的 .fig 里（max-height 约 360px），并加 <span class="tag">示意图</span>。""",
 'T06': """模板 T06「三问任务卡」：三张 .card.reveal 横排（.grid-3），每张含 <span class="num">01</span> 序号、.label 与 <p>；卡片垂直居中（margin:auto 0）。若 assets 里有 (link) 文件，在卡片下方加一行 .file-card；有 (capture) 缩略图可放在卡片右侧或下方（max-height 260px）。""",
 'T15': """模板 T15「责任/决定多栏」：按 reveal 条目数用 .cols（3 栏）或 .grid-4（4 栏）；每栏一个 .reveal 容器，含 .label 与 p.text；栏间用 <div class="vline"></div>。有图片时做成上图下文或左图右文，图用 .fig 并标注 .tag。""",
 'T04': """模板 T04「大图＋任务卡」：.cols 布局，左栏（flex:0 0 520px）是 .stack 的任务卡：每条 .reveal 含 <span class="num">01</span>、.label、p.text；右栏是 .blueprint 或 .slot 大图（img max-height 640px）。若有多张截图（如三张系统截图），右栏改为 .grid-3 缩略图卡片，每张 .fig + figcaption。(external) 系统用 .link-card unset 放在左栏底部。缺图时用 .slot .placeholder 写“待放入实拍照片”或“待截图”。""",
 'T16': """模板 T16「4＋3＋3 地图」：正文主体是一个 <div class="map433" …></div> 组件。按 PLAN note 决定 data-stage（高亮环节）与 data-roles（高亮角色）；note 说“无高亮”则两者留空；“四环节依次亮起”“三行分步”用 data-reveal="1"。reveal 条目如果是环节/角色名，由组件承担分步，不要再重复写卡片；如果 reveal 是其它句子，则把它们放在 map433 下方的 .cols 里各自 .reveal（此时 map433 用 data-size="compact"）。有图片时放在右侧 .slot（宽 520px）。""",
 'T10': """模板 T10「原题—变式配对 / 原文—概括配对」：两栏 .cols，左栏与右栏各是一个 .reveal 块，用 .label 标明“原题节选/变式”“原文/概括”等（标签文字只能用骨架里已有的 .label）；英文题干保持原空格与选项行，用 <p class="cond" style="font-size:36px">。第三个条目（说明/依据）放在右侧灰底 .card.fill 或底部 .takeaway。""",
 'T03': """模板 T03「左右对照」：.cols 两栏，左栏“过去/之前”用 .muted 弱化，右栏“现在/之后”字号更大（36–44px）；两栏之间 <div class="vline"></div>；每栏一个 .reveal。第三条 reveal（结论）放底部 .takeaway。有图片放在右栏 .slot（max-height 520px），note 说“最后一步出现”则图片所在容器单独 .reveal 排最后。""",
 'T14': """模板 T14「识别/表达前后对照」：用 .before-after 两栏或三行（原记录→识别文本→核对后），每行一个 .reveal，含 .label 与 p（38px）；差异处用 <span class="diff">，修正处用 <span class="fix">。右侧可放深色 .card.fill 做“判断”栏（如果骨架有对应条目）。""",
 'T12': """模板 T12「对话页」：.dialog 容器；每一轮对话是 .turn.reveal（.who 写角色名，.say 写内容）；AI/教研员/学伴一方加 .turn.ai。角色名与内容必须来自骨架的 .label / .text。常显 <span class="tag">示例对话</span> 放在对话上方。(placeholder) 产品截图放右侧 .slot .placeholder（宽 560px），写“待放入产品截图”。""",
 'T02': """模板 T02「大字引文」：正文只有 0–3 条；若有 .text 条目，每条 <p class="lead reveal" style="max-width:1400px"> 居中。""",
 'T01': """模板 T01「暗底封面/结束页」：正文放 .stack；二维码位用 <div class="qr big" data-config="resourceUrl"></div> 并配一行 .small 说明“扫码查看本次培训资源”。""",
}

def page_ids(args):
    ids = []
    for a in args:
        if re.fullmatch(r'[SO]\d|X0', a):
            ids += [p['id'] for p in PLAN['pages'] if p['batch'] == a and p['executor'] == 'pi']
        else:
            ids.append(a)
    return ids

def plan_of(pid):
    return next(p for p in PLAN['pages'] if p['id'] == pid)

def sample_for(template):
    sid = PLAN['templates'][template]['sample']
    txt = (PAGES / f'{sid}.html').read_text(encoding='utf-8')
    m = re.search(r'<section.*?</section>', txt, re.S)
    body = m.group(0) if m else txt
    body = re.sub(r'<aside class="notes">.*?</aside>', '', body, flags=re.S)
    body = re.sub(r'<!-- PLAN.*?-->', '', body, flags=re.S)
    return body.strip()

def build_prompt(ids):
    templates = sorted({plan_of(i)['template'] for i in ids})
    sysp = RULES + '\n' + CSS_REF + '\n模板要求：\n' + '\n'.join(GUIDE.get(t, '') for t in templates)
    sysp += '\n\n已实现的同模板样页（只看排版气质与密度，不要照抄其文字；样页用了内联样式，你优先用上面的类）：\n'
    for t in templates:
        sysp += f'\n--- 样页 {t} ---\n' + sample_for(t) + '\n'
    user = f'请为以下 {len(ids)} 页重写正文区，按输出格式逐页给出。\n'
    for i in ids:
        txt = (PAGES / f'{i}.html').read_text(encoding='utf-8')
        txt = re.sub(r'<aside class="notes">(.*?)</aside>', lambda m: '<aside class="notes">' + re.sub(r'资源：.*', '', m.group(1), flags=re.S).strip()[:700] + '</aside>', txt, flags=re.S)
        user += f'\n\n##### 页 {i}（模板 {plan_of(i)["template"]}）\n' + txt
    return sysp, user

def parse_out(out):
    out = re.sub(r'```[a-z]*\n?', '', out)
    res = {}
    for m in re.finditer(r'===\s*([PB]\d{2,3})\s*===\s*(<!-- BODY:START -->.*?<!-- BODY:END -->)', out, re.S):
        res[m.group(1)] = m.group(2).strip()
    return res

def validate(ids):
    r = subprocess.run([sys.executable, str(ROOT / 'build' / 'build.py'), 'validate', *ids], capture_output=True, text=True)
    errs = {}
    for line in r.stdout.splitlines():
        m = re.match(r'([PB]\d{2,3}) ERROR (.*)', line)
        if m: errs.setdefault(m.group(1), []).append(m.group(2))
    return errs, r.stdout

def run_group(ids, tag, dry=False, feedback=None):
    sysp, user = build_prompt(ids)
    if feedback: user += '\n\n上一次输出被校验退回，问题如下，请修正后重新输出全部页：\n' + feedback
    stamp = time.strftime('%H%M%S')
    base = RUNS / f'{tag}_{"_".join(ids)}_{stamp}'
    base.with_suffix('.prompt.txt').write_text(sysp + '\n\n' + user, encoding='utf-8')
    if dry: print('dry', base); return {}
    t0 = time.time()
    cmd = ['pi', '-p', '--no-session', '-nt', '--model', MODEL, '--system-prompt', sysp, user]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=240)
        out = r.stdout; rc = r.returncode; err = r.stderr
    except subprocess.TimeoutExpired as e:
        out = (e.stdout or b'').decode('utf-8', 'ignore') if isinstance(e.stdout, bytes) else (e.stdout or '')
        rc = -9; err = 'TIMEOUT 240s'
        print('   timeout', flush=True)
    base.with_suffix('.out.txt').write_text(out + ('\n[stderr]\n' + err if err.strip() else ''), encoding='utf-8')
    bodies = parse_out(out)
    rec = {'ids': ids, 'model': MODEL, 'seconds': round(time.time() - t0, 1), 'returned': sorted(bodies), 'rc': rc}
    # 写入
    for i in ids:
        if i not in bodies: continue
        p = PAGES / f'{i}.html'
        if not (BACKUP / f'{i}.html').exists(): shutil.copy(p, BACKUP / f'{i}.html')
        txt = (BACKUP / f'{i}.html').read_text(encoding='utf-8')
        if not BODY_RE.search(txt): print(i, '骨架缺 BODY 标记，跳过'); continue
        new = BODY_RE.sub(lambda m: bodies[i], txt, count=1)
        new = new.replace('data-status="skeleton"', 'data-status="draft"', 1)
        p.write_text(new, encoding='utf-8')
    errs, vout = validate([i for i in ids if i in bodies])
    rec['errors'] = errs
    base.with_suffix('.run.json').write_text(json.dumps(rec, ensure_ascii=False, indent=1), encoding='utf-8')
    return {'bodies': bodies, 'errors': errs, 'vout': vout}

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    size = 4
    for a in sys.argv[1:]:
        if a.startswith('--size'): size = int(a.split('=')[1] if '=' in a else sys.argv[sys.argv.index(a) + 1])
    dry = '--dry' in sys.argv; force = '--force' in sys.argv
    ids = page_ids([a for a in args if not a.isdigit()])
    if not force:
        ids = [i for i in ids if 'data-status="skeleton"' in (PAGES / f'{i}.html').read_text(encoding='utf-8')]
    if not ids: print('无待处理页'); return
    tag = args[0] if re.fullmatch(r'[SO]\d|X0', args[0]) else 'adhoc'
    groups = [ids[k:k + size] for k in range(0, len(ids), size)]
    summary = {'ok': [], 'fail': []}
    for g in groups:
        print('>>', g, flush=True)
        res = run_group(g, tag, dry)
        if dry: continue
        missing = [i for i in g if i not in res['bodies']]
        bad = list(res['errors'])
        if missing or bad:
            fb = '\n'.join(f'{i}: ' + '；'.join(res['errors'][i]) for i in bad) + ('\n未返回：' + ','.join(missing) if missing else '')
            print('   retry:', fb[:300], flush=True)
            res2 = run_group(g, tag + 'r', dry, feedback=fb)
            for i in g:
                ok = i in res2['bodies'] and i not in res2['errors']
                if not ok and (i in res['bodies'] and i not in res['errors']):
                    ok = True  # 第一次已通过，第二次未覆盖或失败则保留第一次
                    if i in res2['bodies'] and i in res2['errors']:
                        # 第二次写坏了，恢复第一次结果
                        txt = (BACKUP / f'{i}.html').read_text(encoding='utf-8')
                        new = BODY_RE.sub(lambda m: res['bodies'][i], txt, count=1).replace('data-status="skeleton"', 'data-status="draft"', 1)
                        (PAGES / f'{i}.html').write_text(new, encoding='utf-8')
                if ok: summary['ok'].append(i)
                else:
                    summary['fail'].append(i)
                    if (BACKUP / f'{i}.html').exists(): shutil.copy(BACKUP / f'{i}.html', PAGES / f'{i}.html')
        else:
            summary['ok'] += g
        print('   ', 'ok:', [i for i in g if i in summary['ok']], 'fail:', [i for i in g if i in summary['fail']], flush=True)
    print('SUMMARY', json.dumps(summary, ensure_ascii=False))
    (RUNS / f'summary_{tag}_{time.strftime("%H%M%S")}.json').write_text(json.dumps(summary, ensure_ascii=False), encoding='utf-8')

if __name__ == '__main__':
    main()
