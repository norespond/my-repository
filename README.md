# my-repository

本站基于模板：ACG Home ([https://github.com/ChengCheng0v0/ACG-Home](https://github.com/ChengCheng0v0/ACG-Home))。

这是一个以静态 HTML/CSS/JS 为主的小型个人主页仓库，包含主题、本地化第三方库（vendor）、以及通过 `config.json` 驱动的页面配置和内容（Markdown）。

## 主要特性

- 基于静态文件，易于部署到任意静态主机（GitHub Pages / Netlify / Vercel / 自托管）。
- 支持主题与颜色配置（`themes/` 目录）。
- 本地化了关键第三方库以降低对 CDN 的依赖（`assets/vendor/`）。
- 客户端通过 `config.json` 驱动站点内容，支持动态加载 Markdown 页面。

## 快速开始（本地预览）

建议在本地启动一个静态服务器来预览页面。下面给出几种常见方式：

- 如果有 Python 3：

```powershell
# 在仓库根目录运行
python -m http.server 8000
# 然后打开 http://localhost:8000
```

- 使用 Node.js 的 http-server（需先安装 `npm i -g http-server`）：

```powershell
http-server -p 8000
# 或者使用 npx
npx http-server -p 8000
```

打开浏览器访问 [http://localhost:8000](http://localhost:8000) 即可。

## 项目结构（简要）

- `index.html` - 站点入口
- `config.json` - 页面配置（站点标题、个人信息、链接等）
- `assets/` - 图片、样式、脚本、第三方库等静态资源
  - `assets/vendor/` - 本地化的第三方库
  - `assets/scripts/` - 站点脚本，包含 config 加载与主题管理逻辑
- `themes/` - 主题定义与颜色文件
- `assets/markdown/` - 存放可被渲染的 Markdown 页面

## 配置说明

- 站点的主要配置来源于仓库根目录的 `config.json`（页面信息、社交链接、主题选项等）。
- 页面会在加载时通过脚本异步读取 `config.json` 并初始化主题与内容。若想本地调试配置，可直接编辑该文件并刷新页面。

示例（`config.json` 的常见字段）：

```json
{
  "site": { "title": "你的站点标题", "description": "一句话描述" },
  "author": { "name": "你的名字", "avatar": "/path/to/avatar.png" },
  "theme": { "name": "Liora", "color": "moon" },
  "pages": [
    { "file": "/assets/markdown/content-page1.md", "title": "关于我" }
  ]
}
```

## 主题与样式

- 主题文件位于 `themes/` 目录，每个主题包含 `theme.json` 与若干 CSS/颜色文件。
- 主题在页面加载时由脚本（`assets/scripts/theme-loader.js`）解析并注入对应样式。

## 调试与常见问题

- 控制台报错：如果页面在加载时抛出关于 `config` 或 `undefined` 的错误，先确认 `config.json` 是否存在且格式正确。已在项目中添加守护性的默认 `window.config` 以减小初始加载阶段的错误面，但仍推荐检查浏览器控制台以获得具体信息。
- 资源 404：如果某些图片或 Markdown 文件缺失，请检查对应路径或把占位资源放入 `assets/` 下对应位置。

## 贡献与许可

如果你想改进这个模板：

- 提交 Issue 描述你遇到的问题或想要的功能。
- 提交 Pull Request（PR）实现修复或新功能。请尽量包含可复现步骤与简短测试说明。

本仓库遵循 LICENSE 中的许可（请参见根目录的 `LICENSE` 文件）。

## 致谢

- 模板来源：ACG Home 项目（[https://github.com/ChengCheng0v0/ACG-Home](https://github.com/ChengCheng0v0/ACG-Home)）。

---
