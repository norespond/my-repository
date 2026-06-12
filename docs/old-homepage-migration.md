# 旧个人主页迁移整理

来源仓库：`D:\CloudMusic\edenge\web\my-repository`

## 站点身份

- 站点名：秋风的小站
- 站点地址：https://www.xuehdxz.dpdns.org/
- 站点描述：秋风的个人小站，分享兴趣与笔记。
- 站长昵称：秋风
- 标语：求知若饥，虚心若愚 / Stay Hungry Stay Foolish

## 旧站内容归档

- `config.json`：站点标题、昵称、头像、社交链接、首页打字标语、ICP 占位信息
- `assets/markdown/content-page.md`：网站介绍
- `assets/markdown/about.md`：关于本站与个人简介
- `assets/markdown/announcement.md`：公告
- `assets/markdown/vpns.md`：技术笔记，已迁移为文章
- `assets/images/avatar.png`：头像，已复制到 Mizuki 的 `src/assets/images/avatar.png`

## 已写入 Mizuki

- `src/config.ts`：站点标题、导航标题、首页横幅文字、个人资料、公告
- `src/content/spec/about.md`：关于页
- `src/content/posts/clawcloud-vless-ws.md`：旧站技术笔记文章
- `src/assets/images/avatar.png`：旧站头像

## 待补全信息

旧站中的 Bilibili、邮箱链接均指向占位 404，GitHub 链接实际也是站点首页。当前只保留了 Website 链接；后续拿到真实链接后再补回 `profileConfig.links` 更稳。
