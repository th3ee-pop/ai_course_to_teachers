# 23_HTML培训课件_Claude · 中小学教师 AI 培训课件（120 页）

96 页主线（P001–P096）＋ 24 页备选（B01–B24），一个 `index.html` 直接投影。内容取自《逐页内容脚本 v0.2》的 `audience` 层，讲者信息在讲者视图与每页 `<aside class="notes">`，听众屏不显示。备选页放在 P096 之后独立分组，目录可跳。

- 顶层设计与分派：`plan/120页制作分派_顶层设计.md`（第 9 节是用户决定）、`plan/pages_plan.json`
- 制作过程与待办：`records/制作记录_20260914.md`
- 设计规范：`design/设计规范_来自ClaudeDesign.md`（来源 https://claude.ai/design/p/845e7100-07c7-4315-a571-5363b63da43c ）

## 打开方式

双击 `index.html` 即可（file:// 下视频、图片、内嵌工具、字体都是相对路径）。个别浏览器限制 file:// 下的 iframe 时，起一个本地服务：

```bash
cd "/Users/chensirui/Desktop/【培训】中小学人工智能培训/00_调研计划与总览/23_HTML培训课件_Claude" && python3 -m http.server 8080
```

然后访问 http://localhost:8080/ 。

URL 形式：`index.html#P047` 定位到某页；`index.html?all#P022` 全显该页所有分步（审看、打印用）。

## 投影流程

1. 打开 `index.html`，按 **N** 弹出讲者视图（浏览器拦截弹窗时允许后再按）。
2. 讲者视图放笔记本屏，课件窗口放投影屏，按 **F** 全屏。
3. 任一窗口按键、翻页器都同步；讲者视图显示当前页、下一页、备注、资源入口、计时。
4. 内嵌工具页（四季 v2、潜水器、月相、气象站看板、分类器工坊）翻到时才加载；鼠标点进 iframe 后按键交给工具，点回页面空白处再翻页。
5. 二维码页（P041 P052 P055 P096、B05–B08 B23）的地址来自 `config.js`，未填时显示占位。

## 快捷键

| 键 | 作用 |
|---|---|
| → 空格 PageDown ↓ | 下一步；本页步骤走完后翻到下一页 |
| ← PageUp Backspace ↑ | 上一步 / 上一页 |
| A | 一次显示本页全部步骤 |
| Home / End | 首页 / 末页 |
| 数字 + Enter | 跳到第 N 页（1–120） |
| T | 目录（按模块分组，显示 ID、标题、高亮环节，主线与备选分开） |
| N | 讲者视图 |
| F | 全屏 / 退出 |
| V | 播放 / 暂停本页视频（翻页时自动暂停） |
| I / L / K | 显示或隐藏 页面 ID / 定位行 / 关键帧 |
| H 或 ? | 快捷键帮助；Esc 关闭弹层或退出全屏 |

焦点在视频、链接、输入框、iframe、可操作动画（`.anim[tabindex]`）里时，按键不翻页。鼠标移动时出现底部 HUD（页码、目录、帮助）。

## config.js

```js
window.DECK_CONFIG = {
  observatoryUrl: "",     // 教学观察台 参与者入口（P041）
  observatoryTalkUrl: "", // 观察台 对话/口语页（P052）
  magnetUrl: "",          // 掌中磁场（P055 B07）
  labUrl: "",             // 掌中实验室（P055 B05 B06 B23）
  ecoUrl: "",             // 生态岛（P055 B08 B23）
  resourceUrl: ""         // 培训资源包入口（P096 结束页）
};
```

只放参与者/听众可访问的地址，**不要把教师管理地址写进来**。部署到 TencentOS 后填好即可，课件自动生成二维码。

## 目录结构

| 路径 | 说明 |
|---|---|
| `index.html` | 120 页课件本体，由 `pages/` 合成，**不要直接改**，改 `pages/` 后重新 assemble |
| `pages/P001.html … P096.html`、`B01 … B24` | 每页一个文件（section.slide 契约见制作记录） |
| `presenter.html` | 讲者视图（postMessage 同步） |
| `deck.css` / `deck.js` / `config.js` | 样式、运行时、现场地址 |
| `components/` | `map433.js` 4＋3＋3 总图、`cycle.js` 循环图、`qrcode.min.js`；用法见 `components/README.md` |
| `assets/tools/` | 复制进来的产物：四季 v2、月相、潜水器、气象站看板、班级天气看板、眼球光路、错题扫描仪、分类器工坊 |
| `assets/video/`、`assets/*.mp4` | 望庐山瀑布 15 秒、尺子、恐龙导入、气象站 5 秒 |
| `assets/docs/D01 … D15` | 教案、方案、实录、模板（讲者备注里保留原路径） |
| `assets/img/` | 截图 `cap_*.png`、视频封面、关键帧拼图 |
| `assets/svg/` | codex 生成的 12 张示意图 |
| `assets/fonts/` | Noto Sans SC / Noto Serif SC / Barlow Condensed 本地子集，断网可用 |
| `build/` | `build.py`（validate / assemble）、`gen_pi.py`（pi 分派与模板）、`cdp_shot.mjs`（截图）、`manifest.json`、各执行器日志、`qa/` 截图与联络表 |
| `plan/`、`design/`、`content/`、`records/` | 计划、规范、页面表、制作记录 |

## 修改与重新生成

改某一页：编辑 `pages/<ID>.html`，然后：

```bash
python3 build/build.py validate
```

```bash
python3 build/build.py assemble
```

批量截图审看（先起本地服务）：

```bash
node build/cdp_shot.mjs --url "http://localhost:8080/index.html?all#P022" --out build/qa/P022.png
```

或 `--jobs build/qa/jobs.json`（`[{url,out,js,wait}]`）。

## 已知限制与待办

- **占位待补**（页面上显示“待放入…”，不用生成图冒充）：教学观察台 4 张截图、掌中磁场 1 张、掌中实验室 2 张、生态岛 1 张（需本机启动服务采集，只截参与者界面）；P005 / P030 真实 AI 产品对话截图；P084 三张实拍照片。目标文件名见 `plan/pages_plan.json` 的 assets 表。
- **需要联网的工具**：B13 分类器工坊（TensorFlow.js / Teachable Machine）与错题扫描仪（tesseract.js）从 jsDelivr 加载，无网时改讲截图。其余内嵌工具与字体均本地可用。
- **二维码**：`config.js` 未填前是占位。
- **数据口径**：喀什 KGF24 只用聚合数字（16,434 条；A 5,586 / B 6,617 / C 4,099 / # 132；得分率 24.94%，# 含义未确认），原始 CSV 不在本目录；P063 与 J-K1-01 不声称测量等值。
- **示例角标常显**：P071 模拟实录、P072 标注示例对话、P088 12.8→128 说明性示例、V01 诗意再现非实拍、D12 周报不证明健康效果、天气 48/45 人口径不混用。
- **直接引语**只有“将人工智能技术融入教育教学全要素全过程”一句；UNESCO 只做中文概括。
- **状态**：`build/manifest.json` 中 120 页均为 draft，已通过 validate 与截图审看，尚未逐页由用户审校。
- 不要把本目录整体打包上传；`.env`、密钥、教师管理地址、含学生信息的文件都不应出现在这里。
