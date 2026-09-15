# 云端制作环境说明（2026-09-15）

本仓库可在没有作者本机文件的环境（Claude Code 云端 / 任何 Linux 克隆）里独立完成页面制作、校验与截图自查。先读 `build/opus_brief.md`（页契约、红线）与 `build/diagram_brief.md`（示意图规则），本文只讲云端差异。

## 一、仓库内已自带的东西

| 本机原路径 | 仓库内替代 | 说明 |
|---|---|---|
| `../19_逐页内容脚本/逐页内容脚本.json` | `content/逐页内容脚本.json` | `build/build.py` 找不到本机路径时自动回退到此副本。**改上屏文字先改这里**（本机同步回 19 目录由主控负责）。 |
| 每页上屏文字 | `plan/脚本文字速览.txt` | 起草/核对时用，勿当作校验源。 |
| `~/Desktop/ppt素材/`（图标库） | `assets/iconlib/`（520 张 512px 透明 PNG，按原文件夹分类） | 页面引用时先把要用的复制到 `assets/img/icons/` 并改英文名，不要直接引用 iconlib 里的中文路径。 |
| 字体 | `assets/fonts/` | 已本地化，无需网络。 |
| 四季循环 v2 | `assets/tools/siji_v2/` | 可离线运行，供 P041 内嵌。 |

## 二、仓库内**没有**、云端拿不到的东西

- `../19_逐页内容脚本/资源预览/*.html` 与 `/Users/chensirui/...` 绝对路径：只出现在 `aside.notes` 的讲者链接里，**保留原样，不要改、不要删、不要"修复"**。
- 需要本机起服务才能截的图（观察台、掌中磁场、掌中实验室、生态岛、WorkBuddy、产品界面）：用 `.slot .placeholder`（`data-kind="capture"|"product"`）占位，等作者补图；不要伪造。
- 任何模型 API：不调用。

## 三、截图自查（Chrome）

`build/cdp_shot.mjs` 现在按顺序找 Chrome：环境变量 `CHROME` → macOS 默认路径 → `google-chrome` / `chromium` 等命令。云端通常需要先装：

```bash
npx --yes @puppeteer/browsers install chrome@stable --path /tmp/chrome
export CHROME=$(find /tmp/chrome -type f -name chrome | head -1)
```

Debian/Ubuntu 若缺共享库：`apt-get install -y libnss3 libatk-bridge2.0-0 libgtk-3-0 libgbm1 libasound2 fonts-noto-cjk`（字体已随仓库自带，`fonts-noto-cjk` 只是保险）。

然后照常：

```bash
python3 build/build.py validate && python3 build/build.py assemble
node build/cdp_shot.mjs --url "file://$PWD/index.html?all#P013" --out build/qa/P013.png --wait 800
```

`build/qa/` 在 `.gitignore` 里，截图不入库；报告里贴关键结论即可。

## 四、提交约定

- 每个制作批次一个分支（如 `pages-w2`、`pages-w4`），只提交 `pages/*.html`、`assets/img/icons/*`、必要时 `content/逐页内容脚本.json` 与 `plan/pages_plan.json`；不改 `deck.css`、`deck.js`、`components/`（需要改时先在报告里提出）。
- 提交信息末尾加 `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`。
- 合并回 `main` 由作者本机审看后进行。

## 五、批次 V3 补充（2026-09-15，JSON v0.3 之后）

- 上屏文字唯一依据是 `content/逐页内容脚本.json`（v0.3，83 主线＋20 备选）；`plan/脚本文字速览.txt` 是它的可读版。`build/opus_brief.md` 里提到的 `审校后页面中间稿.json` 与 "4＋3＋3" locator 已过时，以 v0.3 与现有页面（如 `pages/P013.html`）的写法为准：locator 是 `<b>模块号</b><span class="on">模块标题</span>`。
- 方法论已改为 **3＋3＋4**：三类能力 内容生成／连通管道／角色扮演；三问 ① 要解决什么问题（目标设定）② 最终成功标准是什么（验收标准）③ 如何让AI理解以上两点（上下文构建）；四环节 教学设计／课堂实施／教学评价／教师专业发展。旧称（管道、工具、主体、4＋3＋3）不得出现在页面上。三问与三类能力不一一对应，不画连线。
- 新模板：T17 案例卡（上栏"典型需求"→中栏三问逐问揭示 `.reveal[data-step=1/2/3]`→底栏"所以用到"，只列真正用到的能力）、T18 快闪（左 60% 大图/占位＋右栏紧凑卡）。新组件 `components/map334.js`（`<div class="map334" data-stage="…" data-caps="内容生成,角色扮演" data-show="caps,questions,stages" data-reveal="1" data-size="full|compact">`），旧 map433 仍被未改页引用，不要删。
- 分派表与四条原则见 `plan/v3_cloud_dispatch.md`；每批一个分支 `pages-v3-<a..h>`，从 `origin/round1-copy-draft` 切出，完成后推送分支，不合并。
- 新 ID 的骨架页已生成（`data-status="skeleton"`，上屏文字与讲者备注已就位），只需替换 BODY 并把 data-status 改为 draft。
