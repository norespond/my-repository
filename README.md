# my-repository

一个基于 [ACG Home](https://github.com/ChengCheng0v0/ACG-Home) 的个人静态站点，适合部署到 GitHub Pages。

## 主要特性

- 配置驱动，站点内容主要来自 `config.json`
- 首页支持文章展示、主题切换、公告、一言，以及图集和音乐入口
- 图集和音乐都已经做成独立页面，入口拆成了两个小卡片
- 图集数据从 `assets/img.json` 加载，支持搜索、筛选、排序和预览
- 音乐数据从 `assets/song.json` 加载，使用 APlayer 播放器并以封面卡片形式展示
- 使用本地化资源和主题资源，尽量减少对外部 CDN 的依赖
- 当前主题为 `assets/themes/Yuki`，带有偏落雪的视觉风格和夜间配色

## 快速开始

建议使用本地静态服务器预览，不要直接双击打开文件。

```powershell
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

如果你更习惯 Node.js，也可以使用：

```powershell
npx http-server -p 8000
```

## 项目结构

- `index.html` - 站点入口
- `config.json` - 站点配置
- `assets/scripts/` - 页面脚本，包含配置加载、主题管理、图集和音乐逻辑
- `assets/styles/` - 全局样式
- `assets/markdown/` - 首页正文和说明内容
- `assets/img.json` - 图集数据源
- `assets/song.json` - 音乐数据源
- `assets/themes/` - 主题文件
- `assets/vendor/` - 本地化第三方资源
- `music/music.css` - 音乐页样式

## 当前页面说明

- 左侧栏包含个人信息、公告、一言、图集入口、音乐入口和主题切换
- 右侧内容区展示 Markdown 文章
- 点击图集或音乐入口后，都会在当前页面切换到对应的独立视图
- 夜间主题会自动使用更适合当前场景的背景和深色卡片样式

## 配置说明

- 站点的大部分内容都可以在 `config.json` 中调整，例如：
- 网站标题和描述
- 头像、站长信息和社交链接
- 页面头部文案
- 主题默认值和可选配色
- ICP 备案信息

如果你只是想修改个人信息，通常先改 `config.json` 就够了。

## 主题说明

- 主题位于 `assets/themes/`
- 当前使用的主题目录是 `assets/themes/Yuki`
- `Yuki` 主题包含日间和夜间配色，并针对首页、图集、音乐和移动端做了适配
- 如果你要新增主题，可以参考 `assets/themes/Yuki` 的目录结构

## 开发提示

- 如果首页内容没有显示，先检查 `config.json` 是否正常加载
- 如果图集不显示，先确认 `assets/img.json` 的路径和内容格式
- 如果音乐播放有问题，先确认 `assets/song.json` 的音频地址是否可访问
- `node_modules/` 已加入 `.gitignore`，不会被提交到仓库

## 致谢

模板来源：[ACG Home](https://github.com/ChengCheng0v0/ACG-Home)
