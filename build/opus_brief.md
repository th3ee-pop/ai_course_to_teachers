# Opus 子代理公共说明（课件页制作）

项目根：`/Users/chensirui/Desktop/【培训】中小学人工智能培训/00_调研计划与总览/23_HTML培训课件_Claude/`（下称 ROOT）。所有相对路径以 ROOT 为准，页面文件在 `pages/<ID>.html`，最终由 `python3 build/build.py assemble` 拼进 `index.html`（同一文档、同一 deck.css/deck.js/config.js/components/*.js）。**只允许改动指定的 pages/<ID>.html；不要改 deck.css / deck.js / build/* / 其他页面。** 页面级需要的样式写在本页 BODY 内的 `<style>`（选择器用 `.slide[data-id="PID"] …` 限定），脚本写在 BODY 内的 `<script>`（IIFE，限定在本页 section 内查询元素，不污染全局，可挂一个 `window.__anim_PID`）。

## 页面契约（必须保持）
```html
<!-- PLAN … -->            ← 保留（若原页没有可不加）
<section class="slide[ dark]" data-id="P0xx" data-title="…" data-module="…" data-stage="…" data-kind="主线|备选" data-template="Txx" data-status="draft">
  <div class="hdr"><div class="locator">…</div><span class="pid">P0xx</span></div>   ← 保留原样
  <h2 class="title">…</h2>  <p class="sub">…</p>                                     ← 保留原文
  <!-- BODY:START -->
  <div class="body …">  …你负责的内容…  </div>
  <!-- BODY:END -->
  <div class="foot">…</div>
  <aside class="notes">…</aside>                                                    ← 保留
</section>
```
- 骨架页（data-status="skeleton"）：替换 BODY 标记之间的内容，把 data-status 改为 "draft"。
- 已有页（无 BODY 标记、无 data-kind/data-status、用了行内样式）：改造成上述契约——加 `data-kind="主线"`（B 开头为 "备选"）、`data-template`、`data-status="draft"`、`<!-- BODY:START/END -->` 包住正文；标题区改成 `h2.title` + `p.sub`，locator 保留或改成 `<div class="locator"><b>4＋3＋3</b><span>教学设计</span><span>课堂实施</span><span>教学评价</span><span>教师专业发展</span></div>`；正文尽量改用 deck.css 类，少用行内样式。
- 分辨率固定 1920×1080（deck.js 整体缩放）。标题区约占 200px，正文可用高约 700px，脚注约 60px。正文字号 28–40px，标签 24–26px，不要小于 22px。

## 文字红线
- 页面上的文字（标题、副标题、正文块、脚注）与脚本原文**逐字一致**，不改写、不增删数字。原文来源：`../19_逐页内容脚本/审校后页面中间稿.json`（list，每项 `{id, audience:{title,subtitle,blocks:[{label,text}],footnote}, production:{…}}`），用 `python3 -c` 读你负责的 ID 核对。
- 允许额外出现的只有：功能性 UI 文字（按钮"下一个/重置/播放"）、标注标签（"示意图" "示例对话" "AI生成试样" "教学示例，不是现场记录" "待放入实拍照片" "角色模拟" "理想模型，非实测数据"）、坐标轴/图例文字、config.js 占位提示。
- 已知修正不得带回：KGF24 为完形填空，16,434 条记录，A 5,586 / B 6,617 / C 4,099 / # 132，得分率 24.94%，# 含义未确认；D11 是模拟实录；P072 是标注示例对话；V01 是四镜诗意再现非实拍；UNESCO 只中文概括不加引号；三问不与三种角色一一对应（不画连线）。
- 不写任何教师管理地址、密钥、局域网 IP；外链只通过 config.js 的键（observatoryUrl, observatoryTalkUrl, magnetUrl, labUrl, ecoUrl, resourceUrl）。不调用任何模型 API、不联网取数（页面纯前端、内容固定脚本化）。
- 缺素材不用假资源补：用 `<div class="slot" data-kind="capture|product|schematic|doc"><div class="placeholder"></div></div>`（占位文字由 CSS 自动给出）。

## deck.css 可用类（见 ROOT/deck.css，可 grep 确认）
- 布局：.body（flex 列，margin-top 36px）.stack（竖排）.cols（横排等分；子元素 flex:1；`.vline` 竖线分隔）.grid-2/3/4 .body.cols（横排兜底）
- 文本：.label .text .lead .small .muted .hl .num .kicker .cond .big（196px 大数字）.rule .takeaway .quote-block
- 卡片：.card .card.fill .card.accent .card.role-pipe/.role-tool/.role-subject
- 流程：.flow>.node/.arr；.flow.vertical；.steps>li
- 对话：.dialog>.turn(.ai)>.who/.say；.transcript>.line(.who,.mark)
- 对照：.before-after（.diff .fix）
- 图：.slot（+img 或 .placeholder）.fig>.pic>img + figcaption.caption；.blueprint；.kf
- 标签：.tag .tag.fill .tag.warn .corner-tag
- 入口：`<a class="file-card" href="…">`；`<a class="link-card unset" data-config="observatoryUrl" href="#"><div class="qr"></div><div class="info"><div class="name">…</div><div class="desc">…</div><div class="url"></div></div></a>`（deck.js 依 config 填二维码与地址，未填时显示占位）；`<div class="qr big" data-config="resourceUrl" data-placeholder="…"></div>`；`<div class="embed" data-src="assets/tools/xxx.html"><div class="fallback"><img src="assets/img/cap_xxx.png"></div><div class="hint">…</div></div>`（deck.js 翻到本页时创建 iframe、离开时卸载；iframe 绝对定位铺满 .embed，所以 .embed 需要有确定高度：给它 `style="height:…px"` 或让它在 flex 列里 flex:1 1 auto）
- 动画容器：`.anim`（相对定位、白底、边框，flex:1 1 auto）+ `.anim .controls > button`（`.primary` 强调）
- 分步：给元素加 `class="reveal"`（可 `data-step="n"` 归组），deck.js 按 → 键逐组加 `.on`（最新一组加 `.last`）；全部显示后 section 加 `.all-on`。URL `index.html?all#PID` 一次全显。
- 组件：`<div class="map433" data-stage="设计|实施|评价|教师专业发展" data-roles="管道,工具,主体" data-show="stages,roles,questions" data-reveal="1" data-size="full|compact"></div>`（接口 `Map433.render/set(el,{stage,roles})/all`）；`<div class="cycle" data-nodes="A|B|C" data-on="0" data-center="…" data-size="480"></div>`（`Cycle.render/setActive(el,i)/play(el,ms)/stop(el)`）。组件脚本在 index.html 末尾加载（components/map433.js、cycle.js、qrcode.min.js），页内脚本要在 DOMContentLoaded 后或用 `window.Map433 &&` 判断。
- 颜色变量：--accent #5980a6、--accent-dark #416180、--light-blue #94bce3、--muted、--surface #dfe9f3、--divider；深色页 `.slide.dark` 背景 #1d2d3d。

## deck.js 与页内脚本的衔接
- 当前页 section 有 `.active`；分步计数存于 section 的 `data-rv`（字符串 n）。页内脚本用 `new MutationObserver` 监听本 section 的 `class` 与 `data-rv` 属性变化来启动/暂停/同步动画；离开本页（失去 .active）时停止定时器。
- 快捷键：当焦点在 input/button/a/video/iframe/`.anim[tabindex]` 内时 deck.js 不拦截按键；动画容器给 `tabindex="0"`，并提供键盘可达的按钮（Enter/空格触发原生 button）。每个动画必须有"重置"按钮。
- 视频：`<video src="assets/video/x.mp4" controls preload="metadata" poster="assets/img/x.png"></video>`；翻页 deck.js 自动暂停，无需自写。不要 autoplay。

## 校验
写完后运行（在 ROOT）：
```
python3 build/build.py validate P0xx P0yy      # 需 0 条 ERROR；WARN 可留
python3 build/build.py assemble
node build/cdp_shot.mjs --url "file://$PWD/index.html?all#P0xx" --out build/qa/P0xx.png
```
用 Read 工具看 build/qa/P0xx.png 检查排版：无溢出、无遮挡、字号够大、留白合理；对动画页再截一次不带 ?all 的初态（`file://…/index.html#P0xx`）并可用 `--js` 触发按钮（如 `document.querySelector('.slide.active .anim button').click()`）看中间态。修到满意为止（至少两轮）。
报告：每页一行——做了什么、用了哪些素材、哪些用了占位、校验与截图结果、遗留问题。不要改 build/qa 之外的其他文件。
