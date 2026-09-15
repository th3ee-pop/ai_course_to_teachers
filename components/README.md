# 公共组件

无依赖、非 ES module，样式由脚本注入（`#map433-css` / `#cycle-css`），不必改模板。
在页面末尾加 `<script src="components/map433.js"></script>`、`<script src="components/cycle.js"></script>` 即可；
脚本加载与 DOMContentLoaded 时各扫描一次，自动渲染未渲染的元素。浅色页与 `.slide.dark` 深色页均适配。

## map433.js —— 4＋3＋3 总图

```html
<div class="map433" data-stage="课堂实施" data-roles="工具,主体"
     data-show="stages,roles,questions" data-reveal="1" data-size="full"></div>
```

- `data-stage` 高亮一个环节（其余压淡），支持简称 设计/实施/评价/教师专业发展；空则同权重。
- `data-roles` 逗号分隔，高亮若干角色。
- `data-show` 显示哪些行（默认三行；顺序固定 环节→角色→三问）。
- `data-reveal="1"` 给三行各加 `reveal`，交给 deck.js 分步显示。
- `data-size` `full`（约 620px）/ `compact`（约 300px）。
- 接口：`Map433.render(el)`、`Map433.set(el, {stage, roles})`（0.35s 过渡，用于动画页切换高亮）、`Map433.all()`。
- 三问与三种角色不作一一对应，组件不画连线、不用同色暗示。

## cycle.js —— 循环图

```html
<div class="cycle" data-nodes="观察|预测|操作|解释|记录"
     data-on="1" data-center="课堂实施" data-size="520"></div>
```

- 节点均匀分布于圆环，弧形箭头顺时针；`data-on` 高亮第 n 个（0 起），其余压淡，缺省则同权重；`data-center` 圆心文字可空。
- 接口：`Cycle.render(el)`、`Cycle.setActive(el, i)`、`Cycle.play(el, ms=1400)`、`Cycle.stop(el)`。
- 点击节点即 `setActive` 到该节点，并停止自动循环。

预览：直接打开 `components/_test.html`。
