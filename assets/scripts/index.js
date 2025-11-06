/* global config, throttle, debounce, Alpine, getWebsiteConfig, Typed, swal, renderMarkdown */

// 初始化 Alpine
document.addEventListener("alpine:init", () => {
    Alpine.data("getWebsiteConfig", config);
});

document.addEventListener("DOMContentLoaded", async () => {
    // 在继续前确保配置已异步加载完成
    if (typeof config.init === "function") {
        await config.init();
    }

    // 通知其他模块配置已加载（例如 theme-loader.js）
    try {
        document.dispatchEvent(new Event('config:loaded'));
    } catch (e) {
        console.warn('无法触发 config:loaded 事件', e);
    }

    // 获取 DOM 元素
    var element = {
        pageHead: document.querySelector(".page-head"),
        leftArea: document.querySelector(".primary-container > .left-area"),
        socialIcons: document.querySelector(".social-icons"),
        icpInfo: document.querySelector(".icp-info"),
        webmasterInfo: document.querySelector(".webmaster-info"),
    };

    // 查询屏幕宽度并设置 Flag
    var mobileMode = false;
    if (window.matchMedia("(max-width: 899px)").matches) {
        mobileMode = true;
        console.log("%c[I]%c " + `mobileMode: true`, "background-color: #00896c;", "");
    }

    // 设置网站标题
    if (config.content && config.content.title) {
        document.title = config.content.title;
    }

    // 设置头像（如果存在配置）
    const avatarEl = document.getElementById('avatar-img');
    try {
        if (avatarEl && config.content && config.content.masterInfo && config.content.masterInfo.avatar) {
            avatarEl.src = config.content.masterInfo.avatar;
            avatarEl.alt = (config.content.masterInfo.name || 'avatar') + ' 的头像';
        }
    } catch (e) {
        console.error('设置头像失败', e);
    }

    // 输出控制台欢迎消息
    console.log("%c欢迎来到%c" + config.content.title + "！", "padding: 5px; border-radius: 6px 0 0 6px; background-color: #1e88a8; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #b5495b; color: #ffffff;");
    console.group("%c打开开发者工具是想干嘛呢？应该是想扒代码吧！项目是开源的哦 (GPL-v3)，你喜欢的话拿去用就是了！%c" + "o(〃'▽'〃)o", "padding: 5px; border-radius: 6px 0 0 6px; background-color: #00896c; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #986db2; color: #ffffff;");
    console.log("%c注意！此页面内的某些由站长添加的内容可能并不是开源的，直接从本站 CV 代码前最好先问问站长哦~", "padding: 5px; border-radius: 6px 6px 6px 6px; background-color: #b5393b; color: #ffffff;");
    console.log("%cGitHub.com/%c" + "ChengCheng0v0/ACG-Home", "padding: 5px; border-radius: 6px 0 0 6px; background-color: #010101; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #ff9901; color: #ffffff;");
    console.groupEnd();

    // 渲染 Markdown 内容（renderMarkdown 自身会处理 markdown-it 不可用的情况）
    try {
        renderMarkdown();
    } catch (e) {
        console.error('渲染 Markdown 出错：', e);
    }

    // 加载页首打字标题（仅当 Typed.js 可用时）
    if (typeof Typed !== 'undefined') {
        try {
            new Typed(".page-head > .title", {
                strings: (config.content && config.content.pageHead && config.content.pageHead.typedContent) || [],
                startDelay: 300,
                backDelay: 1000,
                typeSpeed: 100,
                backSpeed: 50,
                showCursor: true,
                loop: true,
            });
        } catch (e) {
            console.error('初始化 Typed.js 出错：', e);
        }
    } else {
        console.warn('Typed.js 未加载，跳过打字效果');
    }

    /* 生成社交链接图标 */

    // 创建一个数组，用来存放生成的链接 HTML
    const socialIconLinks = (config.content.masterInfo.socialLink.enable || [])
        .map(key => {
            const icon = config.content.masterInfo.socialLink.icon[key]; // 获取对应的 icon
            const link = config.content.masterInfo.socialLink.link[key]; // 获取对应的 link
            if (icon && link) {
                // 创建 <a> 标签，外部新窗口打开时添加 rel 属性以提升安全性
                return `<a href="${link}" target="_blank" rel="noopener noreferrer"><i class="${icon}"></i></a>`;
            }
            return "";
        })
        .filter(Boolean); // 过滤掉无效的值

    // 将生成的链接插入到 .social-icons 元素中（为外链添加 rel 安全属性）
    element.socialIcons.innerHTML = socialIconLinks.join("");

    /* 生成社交链接图标 End */

    // 获取 Hitokoto 一言
    fetch("https://v1.hitokoto.cn")
        .then(response => response.json())
        .then(data => {
            const hitokoto = document.querySelector("#hitokoto-text");
            hitokoto.href = `https://hitokoto.cn/?uuid=${data.uuid}`;
            hitokoto.innerText = data.hitokoto;
        })
        .catch(console.error);

    // 非移动端下自动悬浮左侧区域
    if (!mobileMode) {
        const pageHeadHeight = element.pageHead.clientHeight;
        const updateFloatPageHeadMargin = debounce(() => {
            element.leftArea.style.marginTop = window.scrollY - pageHeadHeight + "px";
        }, 60);
        document.addEventListener("scroll", () => {
            if (window.scrollY >= pageHeadHeight) {
                updateFloatPageHeadMargin();
            } else {
                element.leftArea.style.marginTop = "unset";
            }
        });
    }

    /* 生成页脚 ICP 备案信息 */

    // 创建一个数组，用来存放生成的链接 HTML
    const icpInfoLinks = config.content.icp.enable
        .map(key => {
            const code = config.content.icp.info.code[key]; // 获取对应的 code
            const link = config.content.icp.info.link[key]; // 获取对应的 link
            if (code && link) {
                // 创建 <a> 标签
                return `<a class="icp-link" href="${link}" target="_blank">${code}</a>`;
            }
            return "";
        })
        .filter(Boolean); // 过滤掉无效的值

    // 将生成的链接用 fa-shield 图标连接，并插入到 .icp-info 元素中
    element.icpInfo.innerHTML = icpInfoLinks.join(` <i class="fa-solid fa-shield"></i> `);

    /* 生成页脚 ICP 备案信息 End */

    /* 检测页脚的重复作者名称并修正 */ // (好像没啥用

    // 球球你别改这里可以嘛呜呜呜 (＞﹏＜)
    if (config.content.masterInfo.name === "成成0v0") {
        element.webmasterInfo.innerHTML = "";
    }

    /* 检测页脚的重复作者名称并修正 End */
});
