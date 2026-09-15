批 D 六页全部完成。

## 1. 分支与提交

- 分支：`pages-v3-d`（worktree：`.../.claude/worktrees/agent-a272583e7f4fe22b7`）
- 提交：`f1c320d` 「V3 批D：P017 P020 P021 P022 P023 P024」
- 未 push、未合并。`index.html` 是 assemble 产物，按任务书只 add 了 `pages/` 与 `assets/img/icons/`，故留在工作区未提交。
- `python3 build/build.py validate`：我负责的六页 **0 ERROR / 0 WARN**（全库其余报错与本批无关）。

## 2. 逐页说明

- **P017**（三类能力）：三栏 `.cols`，每栏上图下文。图分别是 ① 四季循环截图 `assets/img/cap_siji_curve_23.png`；② 从 `assets/docs/D04/天气观测活动安排（三年级）.docx` 里真实解出的 `word/document.xml` 片段（等宽字体排版，未编造）；③ 页内内联 SVG 对话框示意（只写"教师／AI"，气泡内用色条占位，不编造对话内容，左下角标"示意图"）。无产品截图、无占位槽。截图 `build/qa/P017.png`、`P017_init.png`。
- **P020**（角色扮演）：沿用原页做得好的三卡＋双向箭头 SVG＋气泡结构，图标沿用 `assets/img/icons/p020_teacher_male.png / p020_teacher_female.png / p020_student.png`，文字按 v0.3 更新；底部保留作者已有的达尔文对话截图 `assets/img/darwin_duihua_liangping.png`，角标"角色模拟，非历史人物真实发言"。把原来压在第三张卡里的"示意图"角标移到卡片行右上方，避免误读成只标第三张。截图 `build/qa/P020.png`、`P020_init.png`。遗留：达尔文截图缩到 244px 高后文字不可读，只能当"有实拍"的佐证。
- **P021**（四个环节）：四卡横排 + 三个 V 形箭头 + 底部"回到设计"的回环箭头（内联 SVG，真 `<marker>`）。新增四枚图标（从 `assets/iconlib/` 挑选后复制改英文名）：`stage_design.png`、`stage_classroom.png`、`stage_evaluation.png`、`stage_growth.png`。每卡底部按脚本 `presentation` 加了一行案例小标（案例：植物单元／情景创设／喀什备考／沉与浮课例），与模块 05–08 的案例一一对应。截图 `build/qa/P021.png`、`P021_init.png`。
- **P022**（三问）：三张竖卡逐问揭示，大号 ①②③ 数字牌 + 问题名 + 细分隔线 + 正文，卡片 `min-height:540px` 撑满正文区。脚注中"第一问只能教师提出，因为问题来自你的教室"用 `.p22key`（左侧粗竖线＋浅蓝底＋深色字）单独强调，作为第 6 拍伏笔。截图 `build/qa/P022.png`、`P022_init.png`。
- **P023**（第一次完整推导）：按批次备注作废 PLAN 里的缩略图要求，用**纯 T17 案例卡**——`.casecard` / `.cc-need`（典型需求，不 reveal）→ `.cc-qs` 三张 `.cc-q`（①②③，data-step 1/2/3）→ `.cc-caps`（data-step 4，两条"所以用到：内容生成／角色扮演"，`.tag fill`）。标题用 `title sm`，**未自创任何案例卡样式、无页内 style**。无缩略图、无占位。截图 `build/qa/P023.png`、`P023_init.png`（初态只显示典型需求，版面不跳）。
- **P024**（3＋3＋4 总图，暗色 T16）：左 62% 放 `components/map334.js` 总图（`data-show="caps,questions,stages"`，渲染顺序即 能力→三问→环节，组件本身不画能力—三问连线），右 38% 四条 label+text 逐条揭示，并用 `justify-content:space-between` 让"三类能力／三个问题／四个环节"分别与左图三行大致齐平，"老师这样用"落在底部并加左侧强调条。截图 `build/qa/P024.png`、`P024_init.png`。

## 3. 本地待办新增项

**需作者提供的截图与信息**
- 无新增。本批六页没有用到任何 `.slot` 占位，也没有留【待用户提供】。

**作者 AIGC / 已有素材**
- P017：`assets/img/cap_siji_curve_23.png`（四季循环截图）、D04 docx 真实 XML 片段——已用，无需补。
- P020：`assets/img/darwin_duihua_liangping.png` 已带"角色模拟，非历史人物真实发言"角标；**建议作者提供一张更简洁、字号更大的两三轮对话截图**，现图缩到卡片下方后正文不可读（仅 P020）。

**需要改公共文件的需求（我没有改，按红线只动了自己的页）**
1. `build/template_tail.html` 只加载了 `qrcode.min.js` / `map433.js` / `cycle.js`，**没有 `components/map334.js`**。P024 目前是在自己页内用一小段 IIFE 动态插入 `<script src="components/map334.js">`（带 id 去重、已渲染则调 `Map334.all()`）。建议在 template_tail 里正式加一行 `<script src="components/map334.js"></script>`，然后把 P024 里的注入脚本删掉。（P024）
2. `deck.css:68` `.locator .on { color: var(--dark) }` **在暗色页上等于隐形**，页眉模块名整条看不见。受影响的不止我这页（`class="slide dark"` 的还有 P001、P000A、P036、P068、P078、P079、P081、P095、P096…）。我在 P024 页内加了一条 `.slide[data-id="P024"] .locator .on { color: var(--light-blue) }` 临时救场，建议在 deck.css 里补一条全局 `.dark .locator .on { color: var(--light-blue) }`，之后把我这条删掉。（P024，影响全部暗色页）
3. `build/build.py:249` 的动画检查是字面匹配 `class="anim`，对"用组件实现的动画"不友好。P024 因此把类名写成 `class="anim-map334 map334"` 才消掉 WARN。建议改成匹配 `anim` 这个类或读 PLAN 的 `anim=` 值对应的组件名。（P024）

## 4. 脚本文字本身的问题（只报告，未改 JSON、未改页面文字）

1. **P021 的 `speaker_notes` 与 P017 完全一样**（讲的是三类能力"内容生成、连通管道、角色扮演"），和本页"四个环节"的内容对不上，应是复制粘贴遗留，建议重写。
2. **P023 的 `presentation` 与 `speaker_notes` 与批次备注冲突**：JSON 里写"右侧 cap_D04_word_1/2 两页并排大图"、备注里有"右边是这次委托实际得到的两份Word成品，大家可以对照标准看一看"。我按批次备注做成了纯 T17 案例卡、不放缩略图，于是**备注里"右边是……"这句在页面上没有对应物**，讲的时候会指空。建议把这句改成"这两份成品我们放在后面 P026／P027 一起看"，或者恢复缩略图——需要作者定夺。
3. P023 脚注"委托表达为教学示例；现有成品包括活动安排与学生记录表"——"委托表达为教学示例"读起来像半句话（"委托表达"是名词还是动宾不清），建议改成"此处的委托表达为教学示例"。
4. P024 的 PLAN 注释 `reveal=['先明确任务','再安排协作','形成成果并使用','检查并改进']` 是旧版四步的残留，与 v0.3 的四个 block（三类能力／三个问题／四个环节／老师这样用）完全不一致；我按 JSON 做的 reveal。建议同步更新 PLAN 注释。
5. P020 副标题"这里的角色指任务中的参与身份"——JSON 已按新术语改好，但 PLAN 注释、`aside.notes` 里仍留着旧术语"主体"（"主体在这里指它能进入任务、回应与协商"）。备注不上屏、且红线要求原样保留链接，我没有动；但作者念稿时会念出旧术语，建议更新备注。