# 批次 V3 云端制作分派（2026-09-15）

依据 `plan/主线.md`、`content/逐页内容脚本.json`（v0.3）、`plan/pages_plan.json`（batch V3）。
`python3 build/build.py validate` 给出的工作清单共 51 页：20 页新 ID（骨架已生成，data-status="skeleton"）＋ 31 页沿用旧页但 v0.3 改了上屏文字（含 P068，只因 map334 高亮变化）。其余 52 页沿用，不动。

## 四条原则（用户 2026-09-15）

1. 云端只关注**内容布局的合理性、内容准确性、整体逻辑顺畅**：上屏文字与脚本逐字一致，版面按模板与 layout_ref 落实，配合图标（`assets/iconlib/` → 复制到 `assets/img/icons/`）画内联 SVG 思路图、示意图。
2. **需要嵌入交互式网页或重新开发交互的页面，云端一律不做**：只做静态版（版面、文字、占位），把交互需求记入报告"本地待办"，作者下飞机后本地做。
3. **需要截图或作者个人信息的**：留 `.slot .placeholder`（`data-kind="capture"|"product"`）或保留脚本里的【待用户提供】原文，不伪造，作者本地补。
4. **呈现我们自己 AIGC 内容的**：仓库里已有的（`assets/pov_01_wanglushan.png`、`assets/img/baitian_yueliang_ai_shiyitu.png`、`assets/siji_v2_xiazhi_dongzhi.png` 等）可先放上并加角标（"AI生成试样"/"生成示意图"）；没有的留占位并在报告里标记，作者下飞机后提供。

执行模型：云端一律用 **Opus 5**，不用 Fable。

## 分批（每批一个分支，基于 `round1-copy-draft`）

| 批 | 分支 | 页面 | 备注 |
|---|---|---|---|
| A | pages-v3-a | P000A P000B P002 P003 P003A P003B P003D P003F | 开场＋科普一。P000A/P000B 个人信息留原文/占位；P002 政策截图只有 `cap_fjjyt_zhengce.png`、`cap_unesco_guidance.png`、`B04_zhengce_word_preview.png` 可用，其余占位；P003D 只允许**移植** `pages/P012.html` 已有的逐符号交互（改文字、不新开发），移植困难则做静态版并记本地待办 |
| B | pages-v3-b | P004 P005 P005A P009 P015 | P005A 产品截图占位（product）；P015 用 `components/cycle.js` 现成组件，ANIM_D 反馈环动画不新开发 |
| C | pages-v3-c | P011A P011B P011C P014A P014B | P011A 从 `assets/tools/siji_v2/seasons-stage.js` 截真实片段；P011B 用 python zipfile 解 `assets/docs/D04/*.docx` 取 word/document.xml 真实片段；P011C 用 `assets/pov_01_wanglushan.png`＋角标 |
| D | pages-v3-d | P017 P020 P021 P022 P023 P024 | P023 用 `assets/img/cap_D04_word_1.png / _2.png`；P024 用 `components/map334.js` |
| E | pages-v3-e | P026 P026A P036 P037A P039 P042B P042D P042F P042H | P037A 四张截图占位（现有 siji 一张可放）；P042B/D/F/H 快闪页：参与者界面截图占位＋ `link-card[data-config=magnetUrl/labUrl/ecoUrl]` |
| F | pages-v3-f | P044 P045 P051 P058 P064 P066A P068 | P045 用 pov 首图＋角标；P051 观察台截图占位；P058 用 `cap_D08_report.png`；P066A 只做静态版（截图占位＋紧凑卡），ANIM_G 轨迹回看记本地待办 |
| G | pages-v3-g | P070 P076 P078 P079 P087 P089 | P076 右下小图 `baitian_yueliang_ai_shiyitu.png`＋"生成示意图"角标；P079 四环节缩略图能用仓库内素材的用，没有的占位 |
| H | pages-v3-h | P095 P095A P096 B10 B20 | P095 只做暗底 map334 静态总图，ANIM_I 收束动画记本地待办；P096 `qr big[data-config=resourceUrl]` |

## 本地待办（云端不做，作者下飞机后处理）

**（2）交互重开发**
- P003D：若 P012 交互移植失败，本地重做逐符号生成交互（ANIM_A）。
- P015：ANIM_D 反馈环（三轮计数、教学适切性勾选）——云端只做 cycle.js 静态循环。
- P066A：ANIM_G 轨迹回看（日志逐条打印＋已知/未知两栏）。
- P095：ANIM_I 总图收束（四环节先亮→三类能力落入→三问浮现→回到设计循环）。
- P041 四季嵌入、B13、错题扫描仪：沿用页，本机验证 iframe/CDN。

**（3）截图与个人信息**
- P000A 主办单位、日期；P000B 姓名、照片、三行简介。
- P002 三份政策的页面截图与文号（现有一张福建省教育厅截图）。
- P005A 用 AI 做课件的产品真实截图（M3）。
- P037A 掌中磁场 1、掌中实验室 2、生态岛 1 截图（M4）。
- P042B/P042D/P042F/P042H 参与者界面大截图；P051 观察台语言交流界面（CAP_S03_TALK）；P066A 观察台四季回看截图。
- `config.js` 六个地址（observatoryUrl, observatoryTalkUrl, magnetUrl, labUrl, ecoUrl, resourceUrl）。
- P084 三张实拍照片（沿用页，旧待办）。

**（4）AIGC 内容**
- P011C、P045：`assets/pov_01_wanglushan.png` 与分镜文字，确认是否替换为更好的一帧。
- P076：`baitian_yueliang_ai_shiyitu.png` 确认。
- P005A、P017、P079 若云端用了占位，补真实产物图。

## 云端报告回填

每批完成后把报告要点追加到本文末尾"## 回报"节（分支名、每页一行、占位清单、本地待办新增项）。

## 回报

（待填）
