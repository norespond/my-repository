/* global config, throttle, debounce, getWebsiteConfig, Typed, swal, renderMarkdown */

document.addEventListener("DOMContentLoaded", async () => {
    // 鍦ㄧ户缁墠纭繚閰嶇疆宸插紓姝ュ姞杞藉畬鎴?
    if (typeof config.init === "function") {
        await config.init();
    }

    // 閫氱煡鍏朵粬妯″潡閰嶇疆宸插姞杞斤紙渚嬪 theme-loader.js锛?
    try {
        document.dispatchEvent(new Event("config:loaded"));
    } catch (e) {
        console.warn("鏃犳硶瑙﹀彂 config:loaded 浜嬩欢", e);
    }

    // 鑾峰彇 DOM 鍏冪礌
    var element = {
        pageHead: document.querySelector(".page-head"),
        leftArea: document.querySelector(".primary-container > .left-area"),
        contentPage: document.querySelector(".content-page"),
        socialIcons: document.querySelector(".social-icons"),
        icpInfo: document.querySelector(".icp-info"),
        masterName: document.querySelector(".card-item#personal-info .name"),
        themeDisplayName: document.querySelector(".theme-display-name"),
        webmasterLink: document.querySelector(".webmaster-link"),
    };

    // 鏌ヨ灞忓箷瀹藉害骞惰缃?Flag
    var mobileMode = false;
    if (window.matchMedia("(max-width: 899px)").matches) {
        mobileMode = true;
    }

    // 璁剧疆缃戠珯鏍囬
    if (config.content && config.content.title) {
        document.title = config.content.title;
    }

    if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
    }

    if (element.masterName && config.content?.masterInfo?.name) {
        element.masterName.textContent = config.content.masterInfo.name;
    }

    if (element.themeDisplayName && config.content?.theme?.displayName) {
        element.themeDisplayName.textContent = config.content.theme.displayName;
    }

    if (element.webmasterLink && config.content?.masterInfo) {
        element.webmasterLink.textContent = config.content.masterInfo.name || "[Loading...]";
        element.webmasterLink.href = config.content.masterInfo.website || "#";
    }

    if (typeof window.hydrateIcons === "function") {
        window.hydrateIcons(document);
    }

    // 璁剧疆澶村儚锛堝鏋滃瓨鍦ㄩ厤缃級
    const avatarEl = document.getElementById("avatar-img");
    try {
        if (avatarEl && config.content && config.content.masterInfo && config.content.masterInfo.avatar) {
            avatarEl.src = config.content.masterInfo.avatar;
            avatarEl.alt = (config.content.masterInfo.name || "avatar") + " 的头像";
        }
    } catch (e) {
        console.error("璁剧疆澶村儚澶辫触", e);
    }

    // 娓叉煋 Markdown 鍐呭锛坮enderMarkdown 鑷韩浼氬鐞?markdown-it 涓嶅彲鐢ㄧ殑鎯呭喌锛?
    try {
        await renderMarkdown();
    } catch (e) {
        console.error("渲染 Markdown 出错", e);
    }

    setupHomepageArticles();

    // 鍔犺浇椤甸鎵撳瓧鏍囬锛堜粎褰?Typed.js 鍙敤鏃讹級
    const homeContentPageHTML = element.contentPage ? element.contentPage.innerHTML : "";
    let galleryCleanup = null;

    function setupHomepageArticles() {
        if (!element.contentPage) return;

        const articles = Array.from(element.contentPage.querySelectorAll(".markdown-content:not(.gallery-entry)"));
        articles.forEach(article => {
            if (article.closest(".article-shell")) return;

            const parent = article.parentNode;
            if (!parent) return;

            const shell = document.createElement("details");
            shell.className = "article-shell";

            const header = document.createElement("summary");
            header.className = "article-shell-header";

            const title = document.createElement("span");
            title.className = "article-shell-title";
            title.textContent = getArticleTitle(article);

            const meta = document.createElement("span");
            meta.className = "article-shell-meta";
            meta.textContent = "展开";

            const headerContent = document.createElement("span");
            headerContent.className = "article-shell-header-content";
            headerContent.append(title);

            header.append(headerContent, meta);

            const body = document.createElement("div");
            body.className = "article-shell-body";

            parent.insertBefore(shell, article);
            body.appendChild(article);
            shell.append(header, body);

            shell.open = false;
            meta.textContent = "展开";

            shell.addEventListener("toggle", () => {
                const expanded = shell.open;
                meta.textContent = expanded ? "收起" : "展开";
            });
        });
    }

    function getArticleTitle(article) {
        const heading = article.querySelector("h1, h2, h3, h4");
        if (heading && heading.textContent.trim()) {
            return heading.textContent.trim();
        }

        const src = article.getAttribute("src") || "";
        if (src.includes("content-page.md")) return "网站介绍";
        if (src.includes("about.md")) return "关于本站";
        if (src.includes("st.md")) return "文章";
        return "文章";
    }

    function restoreHomeContent() {
        if (!element.contentPage) return;

        if (galleryCleanup) {
            galleryCleanup();
            galleryCleanup = null;
        }

        history.replaceState(null, "", window.location.pathname + window.location.search);
        element.contentPage.innerHTML = homeContentPageHTML;
        element.contentPage.classList.remove("is-gallery-view");
        document.body.classList.remove("gallery-active");
        window.scrollTo(0, 0);
    }

    function openGalleryContent() {
        if (!element.contentPage || typeof window.getGalleryAppMarkup !== "function" || typeof window.mountGalleryApp !== "function") {
            return;
        }

        element.contentPage.innerHTML = window.getGalleryAppMarkup();
        element.contentPage.classList.add("is-gallery-view");
        document.body.classList.add("gallery-active");
        galleryCleanup = window.mountGalleryApp(element.contentPage, {
            onBack: restoreHomeContent,
        });
        window.scrollTo(0, 0);
    }

    document.addEventListener("click", event => {
        const trigger = event.target.closest('[data-page-action="open-gallery"]');
        if (!trigger) return;
        event.preventDefault();
        openGalleryContent();
    });

    if (typeof Typed !== "undefined") {
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
            console.error("Typed.js 初始化出错", e);
        }
    } else {
        console.warn("Typed.js 未加载，跳过打字效果");
    }

    /* 鐢熸垚绀句氦閾炬帴鍥炬爣 */

    // 鍒涘缓涓€涓暟缁勶紝鐢ㄦ潵瀛樻斁鐢熸垚鐨勯摼鎺?HTML
    const socialIconLinks = (config.content.masterInfo.socialLink.enable || [])
        .map(key => {
            const icon = config.content.masterInfo.socialLink.icon[key]; // 鑾峰彇瀵瑰簲鐨?icon
            const link = config.content.masterInfo.socialLink.link[key]; // 鑾峰彇瀵瑰簲鐨?link
            if (icon && link) {
                // 鍒涘缓 <a> 鏍囩锛屽閮ㄦ柊绐楀彛鎵撳紑鏃舵坊鍔?rel 灞炴€т互鎻愬崌瀹夊叏鎬?                return `<a href="${link}" target="_blank" rel="noopener noreferrer"><i class="${icon}"></i></a>`;
            }
            return "";
        })
        .filter(Boolean); // 杩囨护鎺夋棤鏁堢殑鍊?
    // 灏嗙敓鎴愮殑閾炬帴鎻掑叆鍒?.social-icons 鍏冪礌涓紙涓哄閾炬坊鍔?rel 瀹夊叏灞炴€э級
    element.socialIcons.innerHTML = socialIconLinks.join("");
    if (typeof window.hydrateIcons === "function") {
        window.hydrateIcons(element.socialIcons);
    }

    /* 鐢熸垚绀句氦閾炬帴鍥炬爣 End */

    // 获取 Hitokoto 一言，失败则回退到本地文案
    const hitokotoEl = document.querySelector("#hitokoto-text");
    const fallbackHitokoto = [
        "把今天过好，明天自然会来。",
        "慢一点没关系，方向对就行。",
        "灵感有时会迟到，但不会缺席。",
        "先完成，再完美。",
    ];

    function setHitokoto(text, href) {
        if (!hitokotoEl) return;
        hitokotoEl.textContent = text;
        if (href) {
            hitokotoEl.href = href;
        } else {
            hitokotoEl.removeAttribute("href");
        }
    }

    function useLocalHitokoto() {
        const quote = fallbackHitokoto[Math.floor(Math.random() * fallbackHitokoto.length)];
        setHitokoto(quote, "");
    }

    const hitokotoController = typeof AbortController !== "undefined" ? new AbortController() : null;
    const hitokotoTimer = hitokotoController ? setTimeout(() => hitokotoController.abort(), 1800) : null;

    fetch("https://v1.hitokoto.cn", hitokotoController ? { signal: hitokotoController.signal } : undefined)
        .then(response => response.json())
        .then(data => {
            if (!data || !data.hitokoto) {
                useLocalHitokoto();
                return;
            }
            setHitokoto(data.hitokoto, `https://hitokoto.cn/?uuid=${data.uuid || ""}`);
        })
        .catch(() => {
            useLocalHitokoto();
        })
        .finally(() => {
            if (hitokotoTimer) {
                clearTimeout(hitokotoTimer);
            }
        });

    // 生成页脚 ICP 备案信息

    // 鍒涘缓涓€涓暟缁勶紝鐢ㄦ潵瀛樻斁鐢熸垚鐨勯摼鎺?HTML
    const icpInfoLinks = config.content.icp.enable
        .map(key => {
            const code = config.content.icp.info.code[key]; // 鑾峰彇瀵瑰簲鐨?code
            const link = config.content.icp.info.link[key]; // 鑾峰彇瀵瑰簲鐨?link
            if (code && link) {
                // 鍒涘缓 <a> 鏍囩
                return `<a class="icp-link" href="${link}" target="_blank">${code}</a>`;
            }
            return "";
        })
        .filter(Boolean); // 杩囨护鎺夋棤鏁堢殑鍊?
    // 将生成的链接插入到 .icp-info 元素中
    element.icpInfo.innerHTML = icpInfoLinks.join(` <i class="fa-solid fa-shield"></i> `);
    if (typeof window.hydrateIcons === "function") {
        window.hydrateIcons(element.icpInfo);
    }

    /* 鐢熸垚椤佃剼 ICP 澶囨淇℃伅 End */

    requestAnimationFrame(() => {
        document.body.classList.add("page-ready");
    });

});
