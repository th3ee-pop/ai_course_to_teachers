完成。以下是批 F 的交付报告。

## 1. 分支与提交

- 分支：`pages-v3-f`（worktree `.claude/worktrees/agent-a7190c986ac150044`，未 push、未合并）
- 提交：`9b216e4` —「V3 批F：P044 P045 P051 P058 P064 P066A P068」（只提交了 `pages/`；`index.html` 与 `build/manifest.json` 是 assemble 产物，按任务书未纳入提交）
- 我负责的 7 页：`python3 build/build.py validate` 全部 **0 ERROR**（只有 P068 一条 WARN，见第 3 节说明）

## 2. 每页做法

| 页 | 版面做法 / 素材 / 占位 / 截图 | 遗留 |
|---|---|---|
| **P044** | T03 两栏，沿用已重做的日影＋昼长曲线内联 SVG（真箭头、图内字 ≥24px、右上"示意图"角标），左栏用 `assets/siji_v2_xiazhi_dongzhi.png`；只按 v0.3 更新文字。截图 `build/qa/P044.png` | 无 |
| **P045** | 改走 T18 `.flash`：左 `.blueprint` 放 `assets/pov_01_wanglushan.png`＋`AI生成试样`角标（图占约 58%），右 `.flash-card` 五块，三问 `reveal data-step=1/2/3`、"所以用到" `.row.cap` 第 4 步。截图 `build/qa/P045.png`、初态 `P045_step0.png` | **刻意未放 link-card**：V01 只有本机 mp4，没有合法 config.js 键，不伪造外链 |
| **P051** | T18：左栏 `.slot[data-kind="capture"]` 占位 ＋ `.link-card.unset`／`.qr`（`data-config="observatoryTalkUrl"`，地址现场填），右栏 `.flash-card tight` 三问逐问揭示。`aside.notes` 末尾追加"演示前提："5 句（取自清单第 3 节，未写任何地址／端口／IP）。截图 `P051.png`、`P051_step0.png` | 观察台交流界面截图缺，留占位 |
| **P058** | 7 块塞不进右栏，改结构解决：上半 `.flash`（左图 `assets/img/cap_D08_report.png`＋"报告截图"角标，右卡只放需求＋三问），三条"所以用到"下沉为整幅 `.cc-caps` 结论带（第 4 步）；长图用 `<div class="slot">` 包一层拿到 `object-fit:contain`，不再被结论带切断；补了原本缺失的 `.foot`。截图 `P058.png`、`P058_step0.png` | 无（未缩字号、未新增 class） |
| **P064** | T05 四步真箭头流程（内联 `<marker>`），节点 01–04 ＋ 三个箭头 ＋ 底部虚线回环"进入下一轮"，全部显式 `data-step`（1–5）。截图 `P064.png`、初态 `P064_init.png` | 修过两个坑：`.flow .node.on{color:#fff}` 导致白底白字、无 `data-step` 的元素被 deck.js 排到最后 |
| **P066A** | skeleton→draft；T18：左图位改放 **ANIM_G 轨迹回看**（`class="anim" tabindex="0"`＋重播/重置按钮）——三条带时间戳的操作日志逐条打字，随后"已知事实／仍然不知道"两栏逐栏出现，常显角标"教学示例，不是现场记录"；右栏 `.flash-card tight` 放需求＋三问（1/2/3）＋能力（4）。`aside.notes` 追加"演示前提："5 句（清单第 2 节，回环地址/IP 只做描述不写具体值）。截图 `P066A.png`、动画进行中 `P066A_step0.png` | ① 日志与两栏结论按"上下"排（60% 宽度并排会把正文压到 24px 以下），非备注写的"左右"；② `cap_guanchatai_trace.png` 仓库没有，图位由动画代替，**未再留截图占位**；③ 动画文字沿用 `pages/P066.html` 里同一条轨迹的原文，不新编造 |
| **P068** | map433→**map334**：`data-stage="教学评价" data-caps="连通管道,内容生成,角色扮演" data-show="caps,questions,stages" data-size="compact"`，三栏 label/text 换成 v0.3 新术语（原页 `data-roles="管道,工具,主体"` 旧术语已清除）。因 `build/template_tail.html` 未加载 map334.js，页内写了按需加载的小脚本兜底。截图 `P068.png` | WARN「计划动画但无 .anim」是 validate 把 `cat4_animation='map334'` 当动画，属误报；暗底页眉定位行看不见（deck.css 缺 dark 变体，见下） |

## 3. 本地待办新增项

**需作者提供的截图与信息**
- P051：`assets/img/cap_guanchatai_talk.png`（教学观察台·语言文化交流参与者界面截图）——现留 capture 占位。
- P051：`config.js` 的 `observatoryTalkUrl` 现场填写（link-card 与二维码都是 unset 占位）。
- P066A：`assets/img/cap_guanchatai_trace.png`（四季回看界面截图）——本页已用动画代替图位，若仍要真实界面截图需另排版面。
- P045：V01《望庐山瀑布》15 秒视频只有本机 mp4，没有可用的 config.js 键；现场要播需自备入口。

**作者 AIGC 内容（已用并加角标）**
- P045：`assets/pov_01_wanglushan.png` →「AI生成试样」。
- P058：`assets/img/cap_D08_report.png` →「报告截图」。
- P044：`assets/siji_v2_xiazhi_dongzhi.png` ＋ 页内 SVG →「示意图」「理想模型，非实测数据」。

**需要改公共文件（我没改，按红线只报告）**
1. `build/template_tail.html` 缺 `<script src="components/map334.js"></script>`（只加载了 map433.js）→ 所有 T16/map334 页都拿不到组件。P068 内已写按需加载兜底，建议模板补一行后删掉页内脚本。
2. `deck.css` 第 68 行 `.locator .on { color: var(--dark) }` 没有暗底变体 → 暗底页（P068 等）页眉定位行几乎不可见，只剩模块号。建议加 `.dark .locator .on { color: var(--light-blue); }`。
3. `deck.css` `.flash-fig > .blueprint > img` 没有 `object-fit` → 长图必然溢出/被裁。我用 `<div class="slot">` 包一层绕开，建议规则里直接加 `object-fit: contain`。
4. `deck.css` `.flow .node.on { background: var(--accent); color: #fff }` 把底色与字色绑死 → 任何自定义节点底色的页都会白底白字。建议拆开。
5. `build/build.py` validate：T16 页的 `cat4_animation='map334'` 被算作"计划动画"，无 `.anim` 就 WARN（P068）。建议把 map334/map433 排除在动画检查外。

## 4. 脚本文字本身的问题（只报告，未改动一字）

1. **P058** 能力条"扮演追问者，请学生说明为什么选 time"——`time` 是 D08 初三第 24 题的选项，页面上没有任何交代，单独投影看不懂；建议脚本补一句题干指代。
2. **P058** 正文写"16,434 条作答记录"，脚注写"数据为脱敏聚合结果"，精确条数与脱敏口径并置，建议核对说法是否一致。
3. **P066A** 与 `pages/P066.html`（同题「一次操作轨迹，能说明什么？」、同一条轨迹、同两句结论）高度重复；P066 目前**不在 index.html 的装配序列里**（manifest 未收），请确认它是否作废——我在 P066A 的动画里沿用了它的原文以保持一致。
4. **P051** 三问③"提供共读角位置、借阅规则、交流对象和学生语言水平；只依据这些事实展开交流"——后半句缺主语（应是 AI），单独上屏容易被读成对学生的要求。
5. **备注与 v0.3 不同步**：P045/P051/P058/P064/P068 的 `aside.notes` 仍是 v0.2 的"讲述时依次说明：…"泛稿，与 JSON 的 `speaker_notes` 不一致；其中 P045 备注里还留着旧术语"工具"（"AI作为生成与落地的工具"）。按红线我只在末尾追加了指定页的"演示前提："段，正文一字未动。