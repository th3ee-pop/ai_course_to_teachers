已完成批 E 全部页面并在本分支提交。

## 1. 分支与提交

- 分支：`pages-v3-e`（worktree `.claude/worktrees/agent-a77443430e848015b`）
- 提交号：`e8504b4082b07a5a3807482f4b4c8b34d0822eaf`　`V3 批E：P026 P036 P037A P039 P042D P042F P042H P041`
- 只 `git add pages/`（未动 `assets/img/icons/`，本批没有新增图标）；`index.html`、`build/manifest.json` 为 assemble 产物，按要求未提交。未 push、未合并。
- `python3 build/build.py validate P026 P036 P037A P039 P041 P042D P042F P042H` → **0 error / 0 warning**（全库 96 error 全部落在其他批次的页上）。

## 2. 每页做法

- **P026**（T05，浅色）：三块竖排「教师提出的任务／本班的具体情况／现有条件」，左侧固定 300px 标签列 + 右侧正文列；第二块下方按 presentation 要求补了"笼统→具体"对照小图——页内内联 SVG，左灰块「笼统的委托 · '帮我备一节课'」，真 `<marker>` 箭头，右描边块「具体到本班」，图内文字 24–34px。素材：无外部图，纯 SVG。占位：无。`build/qa/P026.png`、`build/qa/P026_step0.png`。遗留：图内标签文字（"笼统的委托／具体到本班"）是我自拟的，脚本里没有对应文本，需作者确认措辞。
- **P036**（T15/T16，深色）：`components/map334.js` 紧凑版置顶（`data-stage="教学设计"`、`data-caps=""`、`data-show="caps,questions,stages"`、`data-reveal="0"`），下面三栏「学生实做／学情要具体／依据」分步 1-2-3；补了 v0.3 新增副标题。**因 `build/template_tail.html` 没有加载 map334.js，我在页内加了一段作用域内的加载器脚本**（`window.Map334` 不存在时才注入 `components/map334.js`），没有改公共文件。`build/qa/P036.png`、`P036_step0.png`。遗留：深色页页眉的模块名不可见（见第 3 节公共文件项）。
- **P037A**（T04）：骨架页 → draft。五格等宽横排缩略图（高 248px），第 1 格 `assets/img/siji_v2_xiazhi_dongzhi.png`，第 2–5 格 `<div class="slot" data-kind="capture"><div class="placeholder">掌中磁场/掌中光路/掌中几何/生态岛</div></div>` 占位；紧接一行「五个案例」作为五图的共同题注（顺序与图一致），下面三栏问题类别分步 1-2-3。已在 `aside.notes` 末尾追加"演示前提："（通用启动方式＋摄像头/WebGL 前提＋五个兜底录屏名）。`build/qa/P037A.png`、`P037A_step0.png`。遗留：现有 siji 图是 5784×1800（3.2:1）的双联图，塞进缩略格上下会留白，换成单幅参与者界面截图更好看。
- **P039**（T17 案例卡）：严格按 `build/t17_t18_usage.md` 骨架——`.cc-need` 典型需求（不 reveal）＋ `.cc-qs` 三问 ①②③（step 1/2/3）＋ `.cc-caps` 三张「所以用到：内容生成／连通管道／角色扮演」（step 4），`h2.title sm`，页脚"资源：四季循环v2、教学观察台。"。只用 deck.css 既有类，无内联样式、无自创类。`build/qa/P039.png`、`P039_step0.png`（初态只显示典型需求，正确）。遗留：无。
- **P042D / P042F / P042H**（T18 快闪，与 P042B 同构）：左 60% `.flash-fig` = `.blueprint` 四角 + `capture` 占位，下接 `a.link-card.unset`，`data-config` 分别为 `labUrl` / `labUrl` / `ecoUrl`（QR 同键）；右 40% `.flash-card` 五行，末行 `.row.cap`；P042H 用 `.flash-card tight` 容纳超长"所以用到"。三页均 `h2.title sm`、无 reveal/data-step、`data-status` 改 draft，并各追加了"演示前提："段（掌中实验室 8770/`#optics/primary`/`#geometry/secondary`、生态岛 WebGL、对应兜底录屏名）。`build/qa/P042D.png`、`P042F.png`、`P042H.png`。遗留：四张参与者界面截图与 config.js 真实地址均留位。
- **P041**（沿用页）：只在 `aside.notes` 末尾追加"演示前提："（观察台本机/局域网启动、教师链接含管理凭证不投影、先用真机试扫、只有"同意记录"的会话进回看、内存态重启即清空、四季 iframe 兜底截图、兜底录屏 `demo_guanchatai_siji.mp4`/`demo_siji.mp4`），版面、正文、原有链接一字未动。

## 3. 本地待办新增项

**（a）需作者提供的截图与信息**
- P037A：掌中磁场、掌中光路、掌中几何、生态岛各 1 张参与者界面截图（M4）；另建议补 1 张四季探究的单幅参与者界面截图替换现有超宽双联图。
- P042D / P042F / P042H：各 1 张参与者界面截图（现为 capture 占位）。
- config.js 的 `labUrl`、`ecoUrl`（以及 P041 的 `observatoryUrl`）现场真实参与者地址；link-card 现为 `.unset` 显示"地址现场填写（config.js）"。
- 兜底录屏尚未在 `assets/video/`：`demo_siji.mp4`、`demo_cichang.mp4`、`demo_guanglu.mp4`、`demo_jihe.mp4`、`demo_shengtaidao.mp4`、`demo_guanchatai_siji.mp4`（备注里已按清单点名）。
- P026 对照小图的图内用词（"笼统的委托／具体到本班"）请确认或给定稿文字。

**（b）作者 AIGC 内容**
- 本批没有需要新生成的 AIGC 图；P026 的对照小图是页内 SVG（示意图，非 AIGC），未加"AI生成试样"角标。若日后想用 AIGC 插图替换，需按规则补角标。

**（c）需要改公共文件的需求**
1. `build/template_tail.html`：缺 `<script src="components/map334.js"></script>`（现在只加载 map433.js/cycle.js/qrcode/config/deck.js）。P036 靠页内动态注入临时绕过，建议在公共模板补一行，后续用 map334 的页就不必各自写加载器。
2. `deck.css` 第 68 行 `.locator .on { color: var(--dark); }`：深色页上与 `--dark` 背景同色，导致 P036 等所有 `.slide.dark` 页眉的模块名完全看不见。建议补 `.dark .locator .on { color: var(--light-blue); }`。
3. P026 / P036 / P039 的 `aside.notes` 仍是 v0.2 讲稿（例如 P036 备注还在讲"依据/材料/分工"三块、P026 备注还在讲"三问"旧版），与 v0.3 上屏文字已经对不上。红线禁止改备注正文，需要统一由脚本侧回灌 v0.3 的 `speaker_notes`。

## 4. 脚本文字本身的问题（只报告，未改）

1. **P037A 第三块搭配不当**：「手势、转动、切一刀，让抽象概念有了身体经验。」——"概念"不能"有身体经验"，主语错位，宜作"让学生对抽象概念有身体经验"。
2. **P037A 前三块不同类**：「看不见的关系」「受时空限制」是困难，「用身体去操作」是解决方式，三者并列呈现会让人误以为是三类问题；讲者备注自己也写成"第三类解决方式是…"，与"归为三类（问题）"自相矛盾。
3. **P037A 脚注与现状不符**：「截图为参与者界面」，但现有唯一一张 `siji_v2_xiazhi_dongzhi.png` 是工具界面截图（其余四张待补），脚注要等真实参与者界面截图到位才成立。
4. **P036 三个 label 体例不一致**：「学生实做」「依据」是名词短语，「学情要具体」是主谓短句；建议统一。
5. **P036 副标题与第一块重复**：副标题"教师决定哪些交给AI，哪些留给学生"与第一块"…留给学生，整理与制作材料交给AI"是同一句话的两种说法。
6. **P039 ③ 的"视角"歧义**：「提供学段、教学难点、需要控制的变量、视角、设备条件和可用课时。」中的"视角"在没有上下文时可读作"看问题的角度"，实指三维模型的观察视角，建议写明。
7. **P026 第二块两个分句主语跳变**：「学生能辨认…；他们需要学习怎样固定测量起点并记录日期。」前半"学生"后半"他们"，同一句内换指代略生硬；另"学习怎样固定测量起点"中"怎样"可省。