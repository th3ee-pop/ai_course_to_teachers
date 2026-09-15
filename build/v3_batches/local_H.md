# 批 H（本地并行，Opus 5）——课件页面制作

你是课件页面制作代理。工作目录（已是 git worktree，分支 `pages-v3-h`，基于 `round1-copy-draft`，直接在里面工作）：
`/Users/chensirui/Desktop/【培训】中小学人工智能培训/00_调研计划与总览/23_HTML培训课件_Claude/.claude/worktrees/agent-a0690cb3ee77af354`
先 `cd` 进去；`git status` 应当是干净的。**不要 checkout 别的分支、不要 push、不要合并**；做完在本分支 commit 即可。
这是 1920×1080 投影用的 HTML 教师培训课件，`index.html` 由 `pages/*.html` 拼成。本机 Chrome 已装，`node build/cdp_shot.mjs` 直接可用。

## 先读（按顺序）
1. `plan/主线.md`：全课七拍逻辑与三条贯穿规则（规则二案例卡栏序、规则三全推导/快闪两档）。
2. `build/cloud_brief.md` 第五节（3＋3＋4 术语、T17/T18、map334）；`build/opus_brief.md`（页契约、deck.css 类、红线；其中"审校后页面中间稿.json"与"4＋3＋3"已过时）；`build/diagram_brief.md`（示意图规则）。
3. **`build/t17_t18_usage.md`** 与样板页 `pages/P026A.html`（T17 案例卡）、`pages/P042B.html`（T18 快闪）：凡是块里出现"典型需求 / ①②③ 三问 / 所以用到"的页一律用 T17 的类和骨架，凡是备注写"紧凑卡"的页一律用 T18；**只用 deck.css 已有的类，不自创案例卡样式**。
4. `design/设计规范_来自ClaudeDesign.md`（颜色字体字级）；`pages/P013.html`、`pages/P023.html` 看现有页写法。
5. 你负责的每页：`pages/<ID>.html` 头部 PLAN 注释（模板、layout_ref、reveal、anim、素材）、`plan/脚本文字速览.txt`（按顺序排列，前后页也读，保证过渡逻辑）、`content/逐页内容脚本.json`（上屏文字唯一依据）。

## 你负责的页面
P095 P095A P096 B10 B20

批次备注：
收束与备选。
- P095 **要做动画 ANIM_I 总图收束**（见页头 PLAN 的 anim 字段，但把其中"map433 / 三角色"改为 **map334 / 三类能力**，文字以 v0.3 JSON 为准）：暗底总图，四环节依次亮 → 三类能力落位 → 三问浮现 → "进入下一轮"箭头闪一次；按 → 推进、"播放"自动、"重置"回初态；三问与三类能力不连线。容器加 `class="anim"`。可读 components/map334.js 的 set()/render() 接口驱动。
- P095A 多米诺"第一推"内联 SVG（第一块由教师的手推倒），图标库只作手势点缀。
- P096 大对话输入框占 60%（"发送"按钮只是图形）＋ `qr big[data-config=resourceUrl]`。
- B10、B20 沿用页，只按 v0.3 更新变动的文字块，结构改为 T17 案例卡。
- **讲者备注补演示前提**：沿用页 P090（观察台"同意记录/仅体验"）与 B13（分类器需网络与摄像头）只改 aside.notes 末尾，追加"演示前提："2–3 句，取自 plan/演示前提清单.md 第 2、8 节。

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
全部完成后：`python3 build/build.py validate`（你的页 0 ERROR，其他页的错误不用管）；`git add pages/ assets/img/icons/`；`git commit -m "V3 批H：<页面ID列表>"`（如提交被拦，分成多次简单的 `git commit -m` 提交）。不要 push，不要合并。

## 报告（最终回复，中文）
1. 分支名与提交号。
2. 每页一行：版面做法、用了哪些素材/图标、哪里用了占位、validate 与截图路径、遗留问题。
3. 本地待办新增项，分三类：需作者提供的截图与信息 / 作者 AIGC 内容 / 需要改公共文件的需求，带页面 ID。
4. 脚本文字本身的逻辑或语病问题（只报告）。
