# my-repository

一个基于 ACG Home 的个人静态站点模板，部署在 GitHub Pages 上，主要用于展示首页内容、图集、主题切换、公告和音乐播放器。

## 主要特性

- 静态站点结构，适合直接部署到 GitHub Pages
- 配置驱动，站点信息主要来自 `config.json`
- 首页图集已改为单页切换，不再跳转 `img.html`
- 图集数据从 `assets/img.json` 加载
- 音乐播放器从 `assets/song.json` 加载
- 支持主题与配色切换，当前主题为 `assets/themes/Yuki`
- 内置本地化 vendor 资源，减少对外部 CDN 的依赖

## 快速开始

建议使用本地静态服务器预览，而不是直接双击打开文件。

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

- `index.html` - 站点入口，首页和图集切换都在这里完成
- `config.json` - 站点配置
- `assets/scripts/` - 页面脚本，包括配置加载、主题管理、图集和音乐
- `assets/styles/` - 全局样式
- `assets/markdown/` - 首页右侧展示用的 Markdown 内容
- `assets/img.json` - 图集数据源
- `assets/song.json` - 音乐数据源
- `assets/themes/` - 主题文件
- `assets/vendor/` - 本地化第三方库

## 站点说明

- 首页右侧的图集入口会在当前页面内切换成图集视图
- 图集支持搜索、筛选、排序、加载更多和预览
- 你自定义的 `Yuki` 主题包含雪花效果和偏冷色系的落雪配色
- 背景图、头像、歌曲封面等资源都使用仓库内的静态文件

## 配置说明

站点的主要内容可以在 `config.json` 里调整，例如：

- 站点标题和描述
- 头像与站长信息
- 社交链接
- 页面头部文案
- 主题开关

如果你只是想改个人信息，通常先改 `config.json` 就够了。

## 主题与样式

- 主题位于 `assets/themes/`
- 当前使用的主题目录是 `assets/themes/Yuki`
- 如果要新增主题，可以参考现有主题目录结构
- Yuki 主题里已经有雪花动画和偏冷色系的落雪配色

## 调试建议

- 如果页面空白，先检查 `config.json` 是否能正常加载
- 如果图集不显示，先确认 `assets/img.json` 路径和内容格式
- 如果音乐不播放，先确认 `assets/song.json` 中的音频地址是否可访问
- 站点依赖的静态资源都建议保持仓库内路径一致，避免 GitHub Pages 上出现 404

## 致谢

- 模板来源：[ACG Home](https://github.com/ChengCheng0v0/ACG-Home)
- 感谢你自己对主题、图集和首页结构做的持续整理
