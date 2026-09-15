#!/usr/bin/env python3
"""生成本地并行制作的 8 份任务书 build/v3_batches/local_<X>.md（2026-09-15 晚，替代云端版 A–H.md）。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WT = ROOT / '.claude' / 'worktrees'

BATCHES = {
    'A': dict(wt='agent-adc17a4fa44fb9164',
              pages='P001 P000A P000B P002 P003 P003A P003B P003D P003F',
              note="""开场＋科普一。
- P001 是沿用页，只做一件事：撤下副行"4＋3＋3：四个环节 · 三种角色 · 三个问题"（v0.3 subtitle 为空），标题不动。
- P000A/P000B 个人信息保留【待用户提供：…】原文；P000B 照片位用 `.slot[data-kind=capture]` 占位。
- P002 政策截图只有 assets/img/cap_fjjyt_zhengce.png、cap_unesco_guidance.png、B04_zhengce_word_preview.png 可用，其余占位，文号不伪造。
- P003D **要做动画 ANIM_A**（见页头 PLAN 的 anim 字段）：优先移植 pages/P012.html 已有的逐符号生成交互，改文字为本页语境；容器加 `class="anim"`。纯前端、固定脚本、不调模型。"""),
    'B': dict(wt='agent-a91a135e309839285',
              pages='P004 P005 P005A P009 P015',
              note="""科普二。
- P005/P005A 产品截图用 `.slot[data-kind=product]` 占位，不伪造界面。
- P015 **要做动画 ANIM_D 反馈环**（见页头 PLAN 的 anim 字段）：执行→核对→修订 三节点环形＋中心"第 n 轮"计数，第一轮示例错误标红、第二轮通过、"教学适切性"三项勾选后才亮"进入课堂"。可基于 components/cycle.js 扩展或页内自写 JS，容器加 `class="anim"`。这一页是"教师身份与思维变化"独立一页，正文文字按 v0.3。"""),
    'C': dict(wt='agent-ae215cc3a5c85dc5e',
              pages='P011A P011B P011C P014A P014B',
              note="""符号与 Agent。
- P011A 从 assets/tools/siji_v2/seasons-stage.js 截 20–25 行真实代码片段（等宽字体，不伪造）。
- P011B 用 python zipfile 解 assets/docs/D04/*.docx 取 word/document.xml 真实片段。
- P011C 用 assets/pov_01_wanglushan.png ＋"AI生成试样"角标。
- P014A 内联 SVG（大脑/手/脚）；P014B 内联 HTML 对话框分步，这是"角色扮演"在科普段的原理落点，对话内容用脚本原文。"""),
    'D': dict(wt='agent-a272583e7f4fe22b7',
              pages='P017 P020 P021 P022 P023 P024',
              note="""3＋3＋4 方法论模块。
- P017 三栏各配一张前面见过的实例缩略：四季截图 cap_siji_curve_23.png / docx XML 片段 / 对话框示意；不用产品截图。
- P020 沿用 assets/img/icons/p020_*.png。P021 四卡横排。
- P022 三问竖卡逐问揭示；脚注里"第一问只能由教师提出"那句要显眼，它是第 6 拍的伏笔。
- P023 是全场第一次完整推导：用纯 T17 案例卡（典型需求→三问逐问→所以用到），**不放缩略图**（cap_D04 成果图在后面 P026/P027 出现）；PLAN 注释里的缩略图要求作废。
- P024 用 components/map334.js 总图（能力→三问→环节），不用 map433。"""),
    'E': dict(wt='agent-a77443430e848015b',
              pages='P026 P036 P037A P039 P042D P042F P042H',
              note="""教学设计与课堂实施案例。P026A 与 P042B 已由样板代理做好，**不要动**，照抄它们的结构。
- P039 为 T17 案例卡。P036 用 map334 紧凑版高亮教学设计。
- P037A 五张缩略横排：siji_v2_xiazhi_dongzhi.png 现有，其余四张 capture 占位。
- P042D/F/H 为 T18 快闪页，与 P042B 完全同构：左 60% capture 占位＋ link-card data-config 分别为 labUrl / labUrl / ecoUrl，右栏紧凑卡。
- **讲者备注补演示前提**：P037A、P042D、P042F、P042H 以及沿用页 P041（只改它的 aside.notes，别的不动）在 aside.notes 末尾追加一段"演示前提："，内容从 plan/演示前提清单.md 对应节压缩为 3–5 句（启动方式、前提、兜底视频名）。"""),
    'F': dict(wt='agent-a7190c986ac150044',
              pages='P044 P045 P051 P058 P064 P066A P068',
              note="""课堂实施与教学评价。
- P044 沿用已重做的日影 SVG，只改文字。
- **P045 / P051 / P058 是带图的案例页**：按 usage 第一节规则改走 T18 `.flash` 两栏（左图右卡），三问要逐问揭示就把 `reveal data-step` 加在右栏 `.row` 上（需求不分步，三问 1/2/3，所以用到 4）。P045 左图 assets/pov_01_wanglushan.png 加"AI生成试样"角标；P051 左图观察台截图 capture 占位；P058 左图 assets/img/cap_D08_report.png。右栏"所以用到"过长时用 `.flash-card.tight`。
- P064 四步真箭头流程。
- P066A **要做动画 ANIM_G 轨迹回看**（见页头 PLAN 的 anim 字段）：左侧操作日志三条逐条打印（带时间戳，角标"教学示例，不是现场记录"），右侧"已知事实 / 仍然不知道"两栏逐条出现；右栏用 T18 紧凑卡放三问与能力。容器加 `class="anim"`。截图位 capture 占位。
- P068 map334 高亮教学评价。
- **讲者备注补演示前提**：P051、P066A 的 aside.notes 末尾追加"演示前提："3–5 句，内容取自 plan/演示前提清单.md 第 2、3 节。"""),
    'G': dict(wt='agent-a88a7c34cc7f83dda',
              pages='P070 P076 P078 P079 P087 P089',
              note="""教师专业发展与 AI 边界。
- P070、P089 都用标准 T17 案例卡（P089 的 PLAN 说"三问竖卡＋底部两行"，统一按 T17 三卡并排＋底栏处理，底部两行放进 `.cc-caps`）。
- P076 三栏卡＋右下 assets/img/baitian_yueliang_ai_shiyitu.png 小图加"生成示意图"角标。P078 map334 高亮教师专业发展。
- P079 四环节底图（map334 或内联 SVG）上放材料缩略：模拟器用 assets/img/guanglu_jinshi_vs_daijing.png，其余占位。
- P087 T18 快闪：左 60% 三行对照表（原记录 / 识别文本 / 核对后），右栏紧凑卡。
- **讲者备注补演示前提**：P087 及沿用页 P086（只改它的 aside.notes）末尾追加"演示前提："3–5 句，取自 plan/演示前提清单.md 第 7 节（错题扫描仪 OCR 首次联网、只提取文字不诊断）。"""),
    'H': dict(wt='agent-a0690cb3ee77af354',
              pages='P095 P095A P096 B10 B20',
              note="""收束与备选。
- P095 **要做动画 ANIM_I 总图收束**（见页头 PLAN 的 anim 字段，但把其中"map433 / 三角色"改为 **map334 / 三类能力**，文字以 v0.3 JSON 为准）：暗底总图，四环节依次亮 → 三类能力落位 → 三问浮现 → "进入下一轮"箭头闪一次；按 → 推进、"播放"自动、"重置"回初态；三问与三类能力不连线。容器加 `class="anim"`。可读 components/map334.js 的 set()/render() 接口驱动。
- P095A 多米诺"第一推"内联 SVG（第一块由教师的手推倒），图标库只作手势点缀。
- P096 大对话输入框占 60%（"发送"按钮只是图形）＋ `qr big[data-config=resourceUrl]`。
- B10、B20 沿用页，只按 v0.3 更新变动的文字块，结构改为 T17 案例卡。
- **讲者备注补演示前提**：沿用页 P090（观察台"同意记录/仅体验"）与 B13（分类器需网络与摄像头）只改 aside.notes 末尾，追加"演示前提："2–3 句，取自 plan/演示前提清单.md 第 2、8 节。"""),
}

TEMPLATE = """# 批 {B}（本地并行，Opus 5）——课件页面制作

你是课件页面制作代理。工作目录（已是 git worktree，分支 `pages-v3-{b}`，基于 `round1-copy-draft`，直接在里面工作）：
`{WT}`
先 `cd` 进去；`git status` 应当是干净的。**不要 checkout 别的分支、不要 push、不要合并**；做完在本分支 commit 即可。
这是 1920×1080 投影用的 HTML 教师培训课件，`index.html` 由 `pages/*.html` 拼成。本机 Chrome 已装，`node build/cdp_shot.mjs` 直接可用。

## 先读（按顺序）
1. `plan/主线.md`：全课七拍逻辑与三条贯穿规则（规则二案例卡栏序、规则三全推导/快闪两档）。
2. `build/cloud_brief.md` 第五节（3＋3＋4 术语、T17/T18、map334）；`build/opus_brief.md`（页契约、deck.css 类、红线；其中"审校后页面中间稿.json"与"4＋3＋3"已过时）；`build/diagram_brief.md`（示意图规则）。
3. **`build/t17_t18_usage.md`** 与样板页 `pages/P026A.html`（T17 案例卡）、`pages/P042B.html`（T18 快闪）：凡是块里出现"典型需求 / ①②③ 三问 / 所以用到"的页一律用 T17 的类和骨架，凡是备注写"紧凑卡"的页一律用 T18；**只用 deck.css 已有的类，不自创案例卡样式**。
4. `design/设计规范_来自ClaudeDesign.md`（颜色字体字级）；`pages/P013.html`、`pages/P023.html` 看现有页写法。
5. 你负责的每页：`pages/<ID>.html` 头部 PLAN 注释（模板、layout_ref、reveal、anim、素材）、`plan/脚本文字速览.txt`（按顺序排列，前后页也读，保证过渡逻辑）、`content/逐页内容脚本.json`（上屏文字唯一依据）。

## 你负责的页面
{PAGES}

批次备注：
{NOTE}

## 四条原则
1. 上屏文字（标题、副标题、每个 block 的 label 与 text、脚注）与 JSON **逐字一致**，`validate` 会逐字校；版面按模板与 layout_ref；示意图用页内内联 SVG/HTML（真箭头 `<marker>`，图内文字 ≥24px，图占正文 55–65%），图标从 `assets/iconlib/` 挑，复制到 `assets/img/icons/` 改英文名后引用。
2. **外部演示资源不做**：iframe 嵌入、参与者界面截图、视频、产品截图、config.js 真实地址一律留位。页内动画只做批次备注点名的那几处，其余不新开发。
3. **截图与作者个人信息**：用 `<div class="slot" data-kind="capture|product"><div class="placeholder"></div></div>` 占位，或保留【待用户提供：…】原文；绝不伪造截图、姓名、单位、日期、文号。
4. **作者的 AIGC 内容**：仓库内已有的图（assets/pov_01_wanglushan.png、assets/img/baitian_yueliang_ai_shiyitu.png、assets/siji_v2_xiazhi_dongzhi.png、assets/img/cap_*.png 等）可用并加角标（"AI生成试样"／"生成示意图"／"示例对话"），没有的留占位并在报告里标记。

## 红线
- 页面上不出现旧术语：单独的"管道"、"工具"（指旧的"三种角色"之一时）、"主体"、"三种角色"、"4＋3＋3"；"连通管道"是新术语可用，"3＋3＋4"是现行写法可用；三问与三类能力不一一对应，不画连线、不用同色暗示。能力名只用：内容生成 / 连通管道 / 角色扮演。
- 不写教师管理地址、密钥、局域网 IP；外链只用 config.js 键（link-card / qr 的 data-config）。不调用模型 API，不联网取数。
- `aside.notes` 里的 `../19_逐页内容脚本/...` 与 `/Users/chensirui/...` 链接原样保留；备注只允许在末尾追加"演示前提："段（仅批次备注点名的页）。
- 只改 `pages/<你的ID>.html` 与 `assets/img/icons/*`；不改 deck.css、deck.js、components/、build/、其他页面。发现必须改公共文件的需求写进报告。
- 脚本文字冻结：发现语病或逻辑问题只报告，不改 JSON，也不改页面上的文字去"修正"它。
- 骨架页把 data-status="skeleton" 改为 "draft"；沿用旧页保留原有做得好的 SVG/组件，只按 v0.3 更新文字与结构。

## 工作流
每页：写 → `python3 build/build.py validate <ID>`（必须 0 ERROR）→ `python3 build/build.py assemble` → `node build/cdp_shot.mjs --url "file://$PWD/index.html?all#<ID>" --out build/qa/<ID>.png --wait 800` → 用 Read 看截图：无溢出、无遮挡、字号够大、图文比例合理、逻辑顺序对 → 修到满意（至少两轮）。有分步 reveal 或动画的页再截一次不带 `?all` 的初态。
全部完成后：`python3 build/build.py validate`（你的页 0 ERROR，其他页的错误不用管）；`git add pages/ assets/img/icons/`；`git commit -m "V3 批{B}：<页面ID列表>"`（如提交被拦，分成多次简单的 `git commit -m` 提交）。不要 push，不要合并。

## 报告（最终回复，中文）
1. 分支名与提交号。
2. 每页一行：版面做法、用了哪些素材/图标、哪里用了占位、validate 与截图路径、遗留问题。
3. 本地待办新增项，分三类：需作者提供的截图与信息 / 作者 AIGC 内容 / 需要改公共文件的需求，带页面 ID。
4. 脚本文字本身的逻辑或语病问题（只报告）。
"""

for B, spec in BATCHES.items():
    out = TEMPLATE.format(B=B, b=B.lower(), WT=WT / spec['wt'], PAGES=spec['pages'], NOTE=spec['note'])
    (ROOT / 'build' / 'v3_batches' / f'local_{B}.md').write_text(out, encoding='utf-8')
    print('wrote', f'local_{B}.md', len(out))
