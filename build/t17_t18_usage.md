# T17 案例卡 / T18 快闪 用法说明

面向做 T17/T18 页面的并行代理。**只用本文列出的类，不自创案例卡样式，不改 `deck.css`。**
样式已在 `deck.css` 末尾一节 `/* ── T17 案例卡 / T18 快闪 ── */`（第 399 行起）定义好。
样板页：`pages/P026A.html`（T17）、`pages/P042B.html`（T18）——照抄骨架，只换文字。

---

## 一、先选型（一句话判断）

| 情况 | 用哪个 |
|---|---|
| 脚本块里有「典型需求 / ①②③ 三问 / 所以用到」，且**不需要配图** | **T17 案例卡** |
| 脚本块同上，但**这页要放大截图 / 成品缩略 / 对照表** | **T18 快闪**（左图右卡） |
| 脚本或批次备注写了「紧凑卡」「快闪」 | **T18 快闪** |

判断依据是**有没有图**，不是案例重不重要：T17 的三段是满幅文字排版，硬塞图会挤爆；
T18 的 `.flash` 本来就是「左边一块图位、右边一张五块卡」，配图页一律走它。

底层思考顺序（`plan/主线.md` 规则二）两个模板都一样：
**我在哪个环节（页眉 locator 已说明，正文不重复）→ 我有什么需求 → 三问 → 所以用到哪类能力。**

---

## 二、T17 案例卡：可直接复制的骨架

```html
  <!-- BODY:START -->
  <div class="body">
    <div class="casecard">

      <!-- 上栏：典型需求（整页的问题，不分步） -->
      <div class="cc-need">
        <div class="label">典型需求</div>
        <p class="text">脚本里"典型需求"那一句，逐字照抄。</p>
      </div>

      <!-- 中栏：三问逐问揭示（讲者先让老师说，再翻） -->
      <div class="cc-qs">
        <div class="cc-q reveal" data-step="1">
          <div class="cc-num">①</div>
          <div class="label">要解决什么问题（目标设定）</div>
          <p class="text">脚本第一问的 text，逐字照抄。</p>
        </div>
        <div class="cc-q reveal" data-step="2">
          <div class="cc-num">②</div>
          <div class="label">最终成功标准是什么（验收标准）</div>
          <p class="text">脚本第二问的 text，逐字照抄。</p>
        </div>
        <div class="cc-q reveal" data-step="3">
          <div class="cc-num">③</div>
          <div class="label">如何让AI理解以上两点（上下文构建）</div>
          <p class="text">脚本第三问的 text，逐字照抄。</p>
        </div>
      </div>

      <!-- 底栏：所以用到（第 4 步，三问说完再出结论） -->
      <div class="cc-caps reveal" data-step="4">
        <div class="cc-cap">
          <div class="label"><span class="pre">所以用到：</span><span class="tag fill">角色扮演</span></div>
          <p class="text">这一条能力对应的一句话。</p>
        </div>
        <div class="cc-cap">
          <div class="label"><span class="pre">所以用到：</span><span class="tag fill">连通管道</span></div>
          <p class="text">这一条能力对应的一句话。</p>
        </div>
        <div class="cc-cap">
          <div class="label"><span class="pre">所以用到：</span><span class="tag fill">内容生成</span></div>
          <p class="text">这一条能力对应的一句话。</p>
        </div>
      </div>

    </div>
  </div>
  <!-- BODY:END -->
```

配合 `<h2 class="title sm">`（36px 标题），正文才放得下三段。

### T17 类表

| 类 | 用途 |
|---|---|
| `.casecard` | 容器，竖向三段（上栏需求 / 中栏三问 / 底栏结论），自动撑满正文高度。 |
| `.cc-need` | 上栏"典型需求"：浅灰底＋左侧钢青粗边，label 与 text 同一行基线对齐。 |
| `.cc-need > .label` | 固定宽、不换行的小标题，**固定写"典型需求"**。 |
| `.cc-need > .text` | 需求正文 36px——整页的"问题"，一句话说完。 |
| `.cc-qs` | 中栏：三等分并排网格，一问一列，列间 32px。 |
| `.cc-q` | 一张问题卡：1px 钢青描边，内部竖排 编号 → label → 正文。 |
| `.cc-num` | 卡内 ①②③，Barlow Condensed 54px 钢青——把编号从 label 里拆出来放大，DOM 文字顺序不变。 |
| `.cc-q > .label` | 问题名，脚本原文（去掉开头的 ①②③ 与空格），字距收紧到 `.06em` 保证三行都不折行。 |
| `.cc-q > .text` | 问题正文 30px。 |
| `.cc-caps` | 底栏"所以用到"结论区：顶部 3px 钢青粗线＋浅灰底，1–3 条能力自动等分宽度。 |
| `.cc-cap` | 一条能力块：一行 label（"所以用到："＋标签）＋一句 text。 |
| `.cc-cap .pre` | label 里的"所以用到："前缀，灰色 24px，视觉上让位给标签。 |
| `.cc-cap .tag` | 能力名标签，复用全局 `.tag`；**统一用 `.tag.fill`（钢青实底白字）**，不要一页里混描边和实底。 |
| `.cc-cap > .text` | 这条能力做了什么，26px 一句话。 |

### T17 分步规则

- 三张问题卡 `class="reveal" data-step="1|2|3"`，底栏 `data-step="4"`。**初态整页只剩"典型需求"**，讲者先让老师自己说，再按空格逐问翻出来，最后出结论。
- `.reveal` 只改 `opacity`／`transform`，不改 `display`——分步不会让版面跳动，放心用。
- `.cc-need` **不要**加 `reveal`：它是整页的题面，必须第一眼就在。

### T17 常见变体

- **只有一条或两条能力**：`.cc-caps` 里少写几个 `.cc-cap` 即可，剩下的会自动等分整行宽度，不用改任何样式。
- **两种能力合在一句话里**（脚本的"所以用到"只有一个块、text 里同时提到两类能力）：写成**一个** `.cc-cap`，label 里并排两个 `<span class="tag fill">`，text 照抄那一句。
- **正文特别长**：先把话说短不行的话，就改用 T18（左右两栏比上下三段能装的字多）。**不要把字号往 24px 以下缩**。

---

## 三、T18 快闪：可直接复制的骨架

```html
  <!-- BODY:START -->
  <div class="body">
    <div class="flash">

      <!-- 左 60%：大图位（截图待用户提供时用 slot 占位，不伪造）＋ 下方链接卡 -->
      <div class="flash-fig">
        <div class="blueprint">
          <span class="corner tl"></span><span class="corner tr"></span>
          <span class="corner bl"></span><span class="corner br"></span>
          <div class="slot" data-kind="capture"><div class="placeholder"></div></div>
        </div>
        <a class="link-card unset" data-config="labUrl" data-placeholder="地址现场填写（config.js）" href="#">
          <div class="qr" data-config="labUrl" data-placeholder="现场填写 config.js"></div>
          <div class="info">
            <div class="name">作品名</div>
            <div class="desc">参与者入口</div>
            <div class="url"></div>
          </div>
        </a>
      </div>

      <!-- 右 40%：紧凑卡，五块竖排，整页一次出（不分步） -->
      <div class="flash-card">
        <div class="row">
          <div class="label">典型需求</div>
          <p class="text">脚本"典型需求"那一句。</p>
        </div>
        <div class="row">
          <div class="label">① 要解决什么问题（目标设定）</div>
          <p class="text">脚本第一问的 text。</p>
        </div>
        <div class="row">
          <div class="label">② 最终成功标准是什么（验收标准）</div>
          <p class="text">脚本第二问的 text。</p>
        </div>
        <div class="row">
          <div class="label">③ 如何让AI理解以上两点（上下文构建）</div>
          <p class="text">脚本第三问的 text。</p>
        </div>
        <div class="row cap">
          <div class="label">所以用到</div>
          <p class="text">脚本"所以用到"那一句（可以同时含两类能力）。</p>
        </div>
      </div>

    </div>
  </div>
  <!-- BODY:END -->
```

仓库里**已经有**这页的截图时，把 `.slot` 整个换成
`<img src="assets/img/xxx.png" alt="…">`（`.blueprint` 和四个 `.corner` 保留），其余不动。
AI 生成的图另加角标，规则见 `build/diagram_brief.md`。

### T18 类表

| 类 | 用途 |
|---|---|
| `.flash` | 容器，60fr / 40fr 两栏网格，栏间 44px，两栏等高。 |
| `.flash-fig` | 左栏：上面图位、下面 `link-card`，图位吃掉剩余高度。 |
| `.flash-fig > .blueprint` | 蓝图外框（四角标记），里面放 `.slot` 或 `<img>`，两者都会自动撑满。 |
| `.slot[data-kind="capture"]` | 截图占位，`.placeholder` 留空即可，CSS 会显示"待放入截图"。**截图待用户提供的页一律用它，不要找别的图顶替。** |
| `.flash-fig > .link-card` | 图位下方的入口卡，已按本模板缩到 `padding:16px 22px`。 |
| `.flash-fig > .link-card .qr` | 二维码位，144px 见方；未配置地址时显示 18px 的占位文字。 |
| `.flash-card` | 右栏紧凑卡：浅灰底，五块竖排并垂直居中。 |
| `.flash-card > .row` | 一块；`.label` 22px 钢青小标题 ＋ `.text` 24px 正文。 |
| `.flash-card > .row.cap` | 第五块"所以用到"，上方加 3px 钢青粗线——和 T17 底栏同一种"结论"视觉语言。 |
| `.flash-card.tight` | **紧缩档**：只在右栏塞不下时加在 `.flash-card` 上（例如"所以用到"一句超过 50 字的 P042H、P066A、P051）。它只收紧行距和间距，正文仍是 24px。**加了还溢出就删字，不许再缩字号。** |

### T18 分步规则

**快闪页整页一次出，不写 `reveal`、不写 `data-step`。** 样板 P042B 就是这么做的，validate 0 WARN。
理由：快闪是"换个场景，同一张卡照样成立"，讲者一句话带过，分步只会拖慢节奏。

例外：如果批次备注明确要求这页做动画或逐条出现（例如 P066A 的 ANIM_G），
可以给 `.flash-card > .row` 单独加 `class="reveal" data-step="n"`；
`.reveal` 只改透明度，版面不会跳动。除此之外不要加。

---

## 四、通用要求

- **每一个 label 与 text 逐字保留 `content/逐页内容脚本.json` v0.3 的原文**，只重排结构，不改标点、不换同义词、不合并句子。
  - T17 里把 `①` 拆进 `.cc-num`、把"所以用到："拆进 `.cc-cap .pre` 是**允许的**（DOM 文字顺序不变）；除此之外不要拆。
- 能力名只用三个标准写法：**内容生成 / 连通管道 / 角色扮演**（见 `components/map334.js` 头注释）。
- 三问与三类能力**不一一对应**：不画连线、不用同色暗示对应关系、不按"一问配一能力"排位置。
- 图内文字与正文 **≥24px**；不靠缩字号塞内容，宁可调结构或删字。
- 浅色页；颜色一律用 `deck.css` `:root` 里的变量，不写死色值。
- 页契约不变：`.hdr`(`.locator`+`.pid`) → `h2.title` → `<!-- BODY:START -->.body<!-- BODY:END -->` → `.foot` → `aside.notes`。`aside.notes` 是讲者提示，**不动**。
- 标题一律 `class="title sm"`；有副标题时正文可用高度再少 45px，注意别撑破。

---

## 五、禁止事项

1. **不自创样式**：不新增 class、不写 `<style>`、不写行内 `style=""`、不改 `deck.css`。缺什么就报告，不要自己加。
2. **不改** `deck.js`、`components/`、`build/`、以及不属于你批次的页面。
3. **不出现旧术语**：管道、工具、主体、三种角色、4＋3＋3。（"连通管道"是三类能力的标准名，属于新术语，可以用；单独的"管道"不行。）
4. **不写教师管理地址、密钥、局域网 IP**。外链一律只写 `data-config="<键名>"`，键名限于 `observatoryUrl / observatoryTalkUrl / magnetUrl / labUrl / ecoUrl / resourceUrl`，真实地址由现场 `config.js` 填。validate 会直接拦 `.env` 和"教师管理"。
5. **不伪造素材**：截图没有就用 `.slot` 占位，不要拿别的图顶替、不要用 AI 生成截图冒充实拍。
6. **不缩字号救版面**：正文低于 24px 一律算不合格。
7. **不改脚本 JSON**：对文字有疑问只在回复里报告。

---

## 六、每页自查流程（照做）

```bash
python3 build/build.py validate <ID>        # 必须 0 ERROR
python3 build/build.py assemble
node build/cdp_shot.mjs --url "file://$PWD/index.html?all#<ID>" --out build/qa/<ID>.png --wait 800
# 然后用 Read 看这张 PNG：无溢出、无遮挡、字号够、三段/五块关系一眼能读
```

T17 页再截一次**不带 `?all`** 的初态，确认初态只剩"典型需求"：

```bash
node build/cdp_shot.mjs --url "file://$PWD/index.html#<ID>" --out build/qa/<ID>_step0.png --wait 900
```

**至少改两轮**，改完重新 validate＋assemble＋截图。
`data-status` 做完改成 `draft`（`skeleton` 会报 WARN）。
