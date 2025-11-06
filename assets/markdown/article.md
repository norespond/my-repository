# 前端 CSS 排版与布局实用教程

本文面向有基本 HTML/CSS 知识的前端开发者，目标是在常见的排版与布局场景中做出正确选择并能落地实现。内容涵盖盒模型、文档流、常见布局方式（浮动、定位、Flexbox、Grid）、响应式策略与排版细节（字体、行距、版心），并配有简短示例和最佳实践建议。

## 简短“契约”（inputs / outputs / 成功判定）

- 输入：一个需要布局的网页或组件的 HTML 结构。
- 输出：可维护、响应式并在主流浏览器表现一致的 CSS 布局样式。
- 成功判定：页面在不同视口下没有明显溢出或错位，文本易读且结构语义清晰，样式便于复用与扩展。

## 常见边界与注意点

- 空内容、图片未加载时的占位。
- 动态内容高度导致的回流与性能问题。
- 不同浏览器对默认样式的差异（需要 reset/normalize）。
- 可访问性：可缩放、可读的字体和足够的对比度。

## 1. 盒模型（Box Model）与排版基础

理解 CSS 盒模型是布局的基础：每个元素由 content、padding、border、margin 组成。推荐全局设置：

- 使用 `box-sizing: border-box;` 使 padding 与 border 包含在元素总宽度内，便于计算。通常放在全局：

```css
* { box-sizing: border-box; }
html, body { height: 100%; }
```

- 区分 margin 与 padding 的语义：margin 控制元素之间的间距，padding 控制元素内部空白。

## 2. 文档流与 display

- 默认布局流（normal flow）：块级元素按垂直方向排列，行内元素在同一行流动。

- `display` 常见值：

  - block / inline / inline-block
  - none（隐藏）
  - flex / grid（新布局模型，后文详述）

理解何时使用 `inline-block`（要水平排列但保留块特性）或 `flex`（更灵活的方向与对齐控制）。

## 3. 传统布局工具：浮动（float）与定位（position）

- 浮动（float）曾是两栏/多栏布局常用方案。优点：兼容旧浏览器；缺点：需要清除浮动、语义较弱。现代项目建议尽量用 Flex 或 Grid 替代。

- 定位（position）有四种主要值：static、relative、absolute、fixed（和 sticky）。

  - `position: absolute` 相对于最近的已定位父元素脱离文档流，适合覆盖或浮层。
  - `position: sticky` 可用于实现粘性头部（支持情况较好），比 fixed 更语义友好。

示例（不推荐用于主布局，只作工具使用）：

```html
<div class="card">
  <img src="..." />
  <div class="badge">New</div>
</div>
```

```css
.card { position: relative; }
.badge { position: absolute; top: 8px; right: 8px; }
```

## 4. Flexbox：一维布局的利器

Flexbox 适合一维布局（横向或纵向）。主要属性：

- 容器：`display: flex; flex-direction; flex-wrap; justify-content; align-items; gap;`
- 项目：`flex: 1 1 auto; align-self; order;`

常见场景：水平导航、工具栏、等高列、垂直居中。

示例：水平分布并两端对齐，中间自适应拉伸项：

```css
.toolbar { display: flex; align-items: center; gap: 12px; }
.toolbar .spacer { flex: 1; }
```

Tips：利用 `gap` 替代 margin 调整间距，更直观且不会因子元素换行产生负面影响。

## 5. CSS Grid：二维布局与复杂网格

Grid 适合二维布局（行与列同时控制）。主要特性：`grid-template-columns/rows`, `grid-template-areas`, `gap`, `place-items`, `grid-auto-flow`。

示例：响应式三栏到单栏的典型布局

```css
.grid-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 800px) {
  .grid-layout { grid-template-columns: 1fr; }
}
```

Grid 和 Flex 的选择建议：

- 如果 layout 需要同时控制行和列（比如 dashboard、多列卡片并跨行跨列的元素），优先考虑 Grid。
- 如果只是单一方向的分布与对齐（toolbars、菜单、列表项），优先 Flex。

## 6. 响应式布局策略

- 移动优先（Mobile-first）：先写小屏样式，再用 media queries 扩展到大屏。
- 推荐使用 `min-width` 的 media queries：

```css
/* mobile base */
.container { padding: 16px; }
@media (min-width: 768px) {
  .container { padding: 32px; }
}
```

- 使用相对单位：`rem` / `em` / `%` / `vw`，避免大量使用 px。字体尺寸用 `rem`，组件内间距可用 `em`（相对于字体尺寸）。

## 7. 排版（Typography）要点

- 字体选择：优先使用系统字体栈以提升性能与一致性；必要时加载 web fonts 并设置字体回退。
- 行高（line-height）：通常设置为 1.4–1.8 之间，确保可读性；为标题和正文分别设置合适的行高。
- 字距与字重：避免滥用 letter-spacing，必要时微调来改善大号标题的视觉。
- 基线网格（vertical rhythm）：通过统一的行高与间距步长（例如 4px 或 8px）来保持一致的垂直节奏。

示例：基础排版样式

```css
:root { --base-size: 16px; }
html { font-size: 100%; }
body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; font-size: 1rem; line-height: 1.6; color: #222; }
h1 { font-size: 2rem; line-height: 1.25; }
p { margin: 0 0 1em 0; }
```

## 8. 可访问性与性能考量

- 可访问性：保证足够的颜色对比度、字体可缩放、语义化 HTML（使用 `<main>`, `<header>`, `<nav>` 等），避免仅用颜色传达信息。
- 性能：尽量使用系统字体或按需加载 webfont，避免在关键渲染路径阻塞字体加载；限制复杂选择器与过多重排的 JavaScript 操作。

## 9. 实用模式与示例（组合案例）

1) 响应式头部（logo + nav + 动态按钮）——Flex

2) 卡片网格（等宽列、自动换行）——Grid 或 `grid-auto-rows` + `auto-flow`

3) 两列布局（主内容 + 侧边栏）——Grid 更简单：

```css
.layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
@media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
```

## 10. 快速查错清单

- 检查是否忘记 `box-sizing: border-box`。
- 使用浏览器开发者工具查看元素是否脱离文档流（position/float）。
- 检查是否在子元素使用了固定宽度导致不可预期换行或溢出。

## 11. 进阶建议与学习路径

- 深入学习 CSS Grid 与 Flex 的响应式组合用法。
- 了解现代 CSS 单位（ch, ic, vw, vh）与环境变量（safe-area-inset-*）。
- 学习 CSS 自定义属性（变量）与设计系统内的 spacing/typography tokens。

## 参考与延伸阅读

- MDN: CSS Layout
- A Complete Guide to Flexbox — CSS-Tricks
- A Complete Guide to Grid — CSS-Tricks

---

## 可复制示例文件

下面是三个可直接打开并复制的示例文件（位于仓库的 `assets/examples/`）：

- Flex 头部（响应式示例）： `assets/examples/flex-header.html` — 演示使用 Flex 实现的响应式头部（logo + nav + 操作按钮）。
- Grid 卡片网格： `assets/examples/grid-cards.html` — 使用 `auto-fit / minmax` 实现响应式卡片网格。
- 两列布局： `assets/examples/two-column.html` — 使用 Grid 实现主内容 + 固定宽侧边栏，带窄屏回退。

---
