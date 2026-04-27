# my-repository

一个基于 [ACG Home](https://github.com/ChengCheng0v0/ACG-Home) 改造的个人静态站点，适合部署到 GitHub Pages 或任意静态托管服务。

## 主要特性

- 配置驱动：站点标题、个人信息、主题和社交链接主要来自 `config.json`
- 单页切换：首页正文、图集页、音乐页都在当前站点内切换展示
- 本地资源优先：常用脚本、样式和 Markdown 内容都已放在仓库内
- 主题扩展友好：主题资源集中放在 `assets/themes/`
- 保留归档区：历史占位页和实验内容统一收纳到 `archive/`

## 快速开始

建议使用本地静态服务器预览，不要直接双击打开 `index.html`。

```powershell
python -m http.server 8000
```

访问：

```text
http://localhost:8000
```

如果你更习惯 Node.js，也可以使用：

```powershell
npx http-server -p 8000
```

## 目录结构

```text
.
├─ index.html                 # 站点入口
├─ config.json                # 站点配置
├─ assets/
│  ├─ images/                 # 头像、背景图等图片资源
│  ├─ markdown/               # 首页正文、公告、说明页 Markdown
│  ├─ scripts/                # 页面逻辑脚本
│  ├─ styles/                 # 全局样式与分页样式
│  │  ├─ pages/               # 图集页、音乐页专用样式
│  │  └─ responsive/          # 响应式样式
│  ├─ loaders/                # 加载页与主题色辅助模板
│  ├─ themes/                 # 主题资源
│  ├─ vendor/                 # 本地第三方库
│  ├─ img.json                # 图集数据源
│  └─ song.json               # 音乐数据源
├─ archive/
│  ├─ placeholder-pages/      # 占位页、未完成页、历史页面
│  └─ README.md               # 归档说明
├─ live2d/                    # Live2D 挂件源码与构建产物
└─ package.json               # 校验和 lint 脚本
```

## 关键文件说明

- `index.html`：页面骨架与资源入口，负责挂载主站内容
- `config.json`：站点名称、头像、社交链接、主题默认项等核心配置
- `assets/scripts/`：首页、图集、音乐页、Markdown 渲染和主题切换逻辑
- `assets/styles/`：站点公共样式；`assets/styles/pages/` 用于独立内容页样式
- `assets/loaders/`：加载动画和主题色同步用的 iframe 模板
- `assets/markdown/unfinished.md`：站内“尚未完成之地”的入口文案
- `archive/placeholder-pages/404-error-page/`：当前未完成链接使用的占位页

## 当前页面组织方式

- 左侧栏显示个人信息、公告、一言、图集入口、音乐入口和配色切换
- 右侧内容区默认展示 Markdown 内容
- 点击图集或音乐入口后，会切换到对应的独立视图
- Live2D 挂件通过 `live2d/dist/autoload.js` 在页面底部加载

## 维护建议

- 修改站点信息时，优先更新 `config.json`
- 修改正文内容时，直接编辑 `assets/markdown/`
- 新增图集或音乐数据时，分别维护 `assets/img.json` 和 `assets/song.json`
- 新增主题时，参考 `assets/themes/Yuki/` 的目录结构
- 临时页面、占位页、废弃方案建议统一放入 `archive/`

## 开发命令

```powershell
npm test
```

这个命令会执行：

- `node --check`：检查 `assets/scripts/` 下脚本的语法
- `eslint assets/scripts`：检查脚本风格与潜在问题

## 致谢

模板来源：[ACG Home](https://github.com/ChengCheng0v0/ACG-Home)
