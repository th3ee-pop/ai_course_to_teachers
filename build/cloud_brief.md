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
