# 任务：T17 案例卡 / T18 快闪 模板样板（本地，Opus 5）

仓库根目录：`/Users/chensirui/Desktop/【培训】中小学人工智能培训/00_调研计划与总览/23_HTML培训课件_Claude`（分支 round1-copy-draft，直接在这个目录工作，不要 checkout 其他分支，不要 git commit，主控来提交）。
这是 1920×1080 投影用的 HTML 教师培训课件，`index.html` 由 `pages/*.html` 拼成。

## 目标

给两个新模板写统一样式并各做一页样板，之后 8 个并行代理要做 15 页同类页面，**只能用你定义的类，不自创样式**。所以你的产出是：

1. `deck.css` 末尾追加一节 `/* ── T17 案例卡 / T18 快闪 ── */`，定义下面的类。
2. `pages/P026A.html`（T17 样板）与 `pages/P042B.html`（T18 样板）做成 `data-status="draft"`，validate 0 ERROR，截图自查满意。
3. `build/t17_t18_usage.md`：给其他代理看的用法说明，含可直接复制的 HTML 骨架、每个类的用途、禁止事项。

## 先读

- `plan/主线.md` 第 3 节"三条贯穿规则"，规则二、规则三是模板的依据。
- `build/opus_brief.md`（页契约、deck.css 类、红线；其中"审校后页面中间稿.json"与"4＋3＋3"已过时，以 `build/cloud_brief.md` 第五节为准）。
- `design/设计规范_来自ClaudeDesign.md`（颜色、字体、字级）。
- `deck.css` 全文（397 行）、`pages/P023.html`（现有三问卡片写法，钢青卡片＋Barlow 编号＋`.reveal`）、`pages/P013.html`（locator 写法）。
- `pages/P026A.html`、`pages/P042B.html` 现有骨架：上屏文字已就位，**每一个 label 与 text 必须逐字保留**，只重排结构。
- `components/map334.js` 头部注释（能力名的标准写法：内容生成 / 连通管道 / 角色扮演）。

## T17 案例卡（P026A 为样板）

老师的思考顺序：我在哪个环节（页眉 locator 已说明，正文不重复）→ 我有什么需求 → 三问 → 所以用到哪类能力。版面自上而下三段：

- **上栏"典型需求"**：一句话，字号 34–38px，作为整页的"问题"。
- **中栏三问**：三张并排卡（或三行），编号 ①②③ 用 Barlow Condensed 大号，label 用脚本原文（"① 要解决什么问题（目标设定）"等），text 28–30px。三问逐问揭示：三张卡分别 `class="reveal" data-step="1|2|3"`，初态全隐，讲者先让老师说再翻。
- **底栏"所以用到"**：结论区。只列脚本里出现的能力（P026A 三条都有；其他页可能只有一两条，或合在一个块里如 P042B 的"所以用到" text 含两种能力）。每条能力一个标签＋一句 text。能力标签用钢青底或描边，视觉上明显是"结论"。三问与三类能力**不一一对应，不画连线、不用同色暗示对应**。
- "所以用到"是否也分步：作为第 4 步 `data-step="4"` 揭示（三问说完再出结论）。
- 类名建议：`.casecard`（容器）、`.cc-need`、`.cc-qs`、`.cc-q`、`.cc-num`、`.cc-caps`、`.cc-cap`、`.cc-cap .tag`。可复用现有 `.card .label .text .num .tag`，但要在 usage 里写明组合方式。
- 讲者在演示视图看 `aside.notes`，不动。

## T18 快闪（P042B 为样板）

- 左 60% 大图位：`<div class="slot" data-kind="capture"><div class="placeholder"></div></div>` 占位（本页截图【待用户提供】，不伪造），图位下方一张 `link-card`，`data-config="magnetUrl"`（只写 config 键，不写任何真实地址）。看 `deck.css` 里 `.slot .placeholder .link-card` 现有样式与 `deck.js` 里 `[data-config]` 的处理，沿用。
- 右 40% 紧凑卡：需求一句、三问各一句、能力一行，字号 24–26px，五块竖排，不分步（快闪页整页一次出，`reveal` 可保留但不设 `data-step`，或干脆去掉 reveal；二选一并在 usage 写明，推荐去掉分步）。
- 类名建议：`.flash`（容器，两栏 grid 60/40）、`.flash-fig`、`.flash-card`、`.flash-card .row`。
- 右栏五块的 label 文字逐字保留脚本原文。

## 通用要求

- 图内文字与正文 ≥24px，投影可读；不靠缩字号塞内容，宁可调结构。
- 浅色页；深色页兼容不要求，但不要写死颜色，用 deck.css 已有的 CSS 变量（看文件头部 `:root`）。
- 不改 `deck.js`、`components/`、`build/`、其他页面。
- 红线：页面上不出现旧术语（管道、工具、主体、三种角色、4＋3＋3）；不写教师管理地址、密钥、局域网 IP。

## 工作流

每页：写 → `python3 build/build.py validate <ID>`（0 ERROR）→ `python3 build/build.py assemble` → 截图：
`node build/cdp_shot.mjs --url "file://$PWD/index.html?all#<ID>" --out build/qa/<ID>.png --wait 800`
→ 用 Read 看截图：无溢出、无遮挡、字号够、层次清楚、三段关系一眼能读 → 至少改两轮。P026A 再截一次不带 `?all` 的初态和 `#P026A` 按空格翻到第 2 步的状态（cdp_shot 若不支持按键，只截初态即可）。
本机 Chrome 在 /Applications/Google Chrome.app，`cdp_shot.mjs` 会自动找；如失败，设 `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`。

## 最终回复（中文）

1. deck.css 新增了哪些类，每个一句话。
2. 两页样板各做了什么、截图路径、validate 结果。
3. usage 文档路径。
4. 你对脚本文字或模板规则的疑问（只报告，不改 JSON）。
