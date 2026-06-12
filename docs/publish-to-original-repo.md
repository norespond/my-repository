# 将 Mizuki 新版发布到原 GitHub 仓库

原仓库 SSH：`git@github.com:norespond/my-repository.git`

目标：旧个人主页本地保留不动；当前 Mizuki 目录作为新版站点，推送到原 GitHub 仓库。

## 前提

- 你已经在当前 Mizuki 目录中完成内容修改。
- 本机可以通过 SSH 访问 GitHub。
- 原旧站目录只作为本地备份保留，不参与这次推送。
- 目录名不需要改，Mizuki 目录可以继续保持现在的名字。

## 1. 进入 Mizuki 目录

```powershell
cd D:\CloudMusic\edenge\test\Mizuki
```

## 2. 检查项目是否能通过构建检查

```powershell
pnpm astro check
```

可选：本地预览。

```powershell
pnpm dev
```

浏览器打开：

```text
http://localhost:4321/
```

## 3. 初始化 Git

当前目录如果还没有 `.git`，执行：

```powershell
git init
git branch -M main
```

如果之后发现已经有 `.git`，不要重复初始化，直接进入下一步检查远程即可。

## 4. 绑定原 GitHub 仓库

先看有没有远程：

```powershell
git remote -v
```

如果没有 `origin`：

```powershell
git remote add origin git@github.com:norespond/my-repository.git
```

如果已有 `origin` 但不是这个仓库：

```powershell
git remote set-url origin git@github.com:norespond/my-repository.git
```

## 5. 确认不要提交的内容

重点检查这些内容不要进入 Git：

- `node_modules/`
- `.astro/`
- `dist/`
- `.env`
- `.codex-backup/`
- 本地日志文件，例如 `.codex-dev-server.log`

如果 `.gitignore` 里没有这些规则，先补齐再提交。

## 6. 查看将要提交的文件

```powershell
git status --short
```

确认没有旧站目录、临时文件、日志、缓存混进去。

## 7. 创建第一次提交

```powershell
git add .
git commit -m "migrate homepage to Mizuki"
```

## 8. 推送到原仓库

因为原仓库远端已有旧主页历史，而这个 Mizuki 目录是重新初始化的新历史，第一次推送通常需要覆盖远端 `main`。

推荐使用：

```powershell
git push -u origin main --force-with-lease
```

`--force-with-lease` 会比普通 `--force` 稍稳：如果远端在你不知道的时候有新提交，它会拒绝覆盖。

## 9. 配置 GitHub Pages

进入 GitHub 仓库：

```text
https://github.com/norespond/my-repository
```

打开：

```text
Settings -> Pages
```

设置：

- Source: `Deploy from a branch`
- Branch: `pages`
- Folder: `/root`

模板自带 `.github/workflows/deploy.yml`，推送到 `main` 后会自动构建，并把 `dist` 发布到 `pages` 分支。

## 10. 域名确认

当前项目已经有：

```text
public/CNAME
```

内容应为：

```text
www.xuehdxz.dpdns.org
```

GitHub Pages 部署完成后，仓库 Pages 设置里应显示这个自定义域名。

## 11. 后续正常更新流程

以后只需要在 Mizuki 目录里修改内容，然后：

```powershell
git status --short
git add .
git commit -m "update site content"
git push
```

不需要再 `--force-with-lease`，除非你再次重写本地历史。

## 备注

旧个人主页本地目录不要删除，作为备份即可。真正上线的是当前 Mizuki 目录推送后的远端仓库内容。
