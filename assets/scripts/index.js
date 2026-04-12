/* global config, throttle, debounce, getWebsiteConfig, Typed, swal, renderMarkdown */

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof config.init === "function") {
        await config.init();
    }
    try {
        document.dispatchEvent(new Event("config:loaded"));
    } catch (e) {
        console.warn("无法触发 config:loaded 事件", e);
    }
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
    var mobileMode = false;
    if (window.matchMedia("(max-width: 899px)").matches) {
        mobileMode = true;
    }
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const backToTopEl = document.getElementById("back-to-top");
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
    const avatarEl = document.getElementById("avatar-img");
    try {
        if (avatarEl && config.content && config.content.masterInfo && config.content.masterInfo.avatar) {
            avatarEl.src = config.content.masterInfo.avatar;
            avatarEl.alt = (config.content.masterInfo.name || "avatar") + " 的头像";
        }
    } catch (e) {
        console.error("设置头像失败", e);
    }
    try {
        await renderMarkdown();
    } catch (e) {
        console.error("渲染 Markdown 出错", e);
    }

    setupHomepageArticles();
    secureBlankLinks(document);
    setupBackToTop();
    const homeContentPageHTML = element.contentPage ? element.contentPage.innerHTML : "";
    let galleryCleanup = null;
    let musicCleanup = null;

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

        if (musicCleanup) {
            musicCleanup();
            musicCleanup = null;
        }

        history.replaceState(null, "", window.location.pathname + window.location.search);
        element.contentPage.innerHTML = homeContentPageHTML;
        element.contentPage.classList.remove("is-gallery-view");
        element.contentPage.classList.remove("is-music-view");
        document.body.classList.remove("gallery-active");
        document.body.classList.remove("music-active");
        setupHomepageArticles();
        secureBlankLinks(element.contentPage);
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
        secureBlankLinks(element.contentPage);
        window.scrollTo(0, 0);
    }

    function openMusicContent() {
        if (!element.contentPage || typeof window.getMusicAppMarkup !== "function" || typeof window.mountMusicApp !== "function") {
            return;
        }

        element.contentPage.innerHTML = window.getMusicAppMarkup();
        element.contentPage.classList.add("is-music-view");
        document.body.classList.add("music-active");
        musicCleanup = window.mountMusicApp(element.contentPage, {
            onBack: restoreHomeContent,
        });
        secureBlankLinks(element.contentPage);
        window.scrollTo(0, 0);
    }

    document.addEventListener("click", event => {
        const trigger = event.target.closest('[data-page-action="open-gallery"]');
        const musicTrigger = event.target.closest('[data-page-action="open-music"]');
        if (!trigger && !musicTrigger) return;
        event.preventDefault();
        if (trigger) {
            openGalleryContent();
            return;
        }
        openMusicContent();
    });

    if (!prefersReducedMotion && typeof Typed !== "undefined") {
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
        const fallbackTitle = (config.content && config.content.pageHead && config.content.pageHead.typedContent && config.content.pageHead.typedContent[0]) || config.content.title || document.title;
        const titleEl = document.querySelector(".page-head > .title");
        if (titleEl) {
            titleEl.textContent = fallbackTitle;
        }
        if (typeof Typed === "undefined") {
            console.warn("Typed.js 未加载，跳过打字效果");
        }
    }
    const socialIconLinks = (config.content.masterInfo.socialLink.enable || [])
        .map(key => {
            const icon = config.content.masterInfo.socialLink.icon[key];
            const link = config.content.masterInfo.socialLink.link[key];
            if (icon && link) {
                return `<a href="${link}" target="_blank" rel="noopener noreferrer"><i class="${icon}"></i></a>`;
            }
            return "";
        })
        .filter(Boolean);
    element.socialIcons.innerHTML = socialIconLinks.join("");
    secureBlankLinks(element.socialIcons);
    if (typeof window.hydrateIcons === "function") {
        window.hydrateIcons(element.socialIcons);
    }
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
    const icpInfoLinks = config.content.icp.enable
        .map(key => {
            const code = config.content.icp.info.code[key];
            const link = config.content.icp.info.link[key];
            if (code && link) {
                return `<a class="icp-link" href="${link}" target="_blank" rel="noopener noreferrer">${code}</a>`;
            }
            return "";
        })
        .filter(Boolean);
    element.icpInfo.innerHTML = icpInfoLinks.join(` <i class="fa-solid fa-shield"></i> `);
    secureBlankLinks(element.icpInfo);
    if (typeof window.hydrateIcons === "function") {
        window.hydrateIcons(element.icpInfo);
    }

    

    requestAnimationFrame(() => {
        document.body.classList.add("page-ready");
    });

    function setupBackToTop() {
        if (!backToTopEl) return;

        const toggleVisibility = throttle(() => {
            backToTopEl.classList.toggle("is-visible", window.scrollY > 320);
        }, 120);

        window.addEventListener("scroll", toggleVisibility, { passive: true });
        toggleVisibility();

        backToTopEl.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        });
    }

    function secureBlankLinks(root) {
        if (!root || typeof root.querySelectorAll !== "function") return;

        root.querySelectorAll('a[target="_blank"]').forEach(link => {
            const rel = (link.getAttribute("rel") || "").split(/\s+/).filter(Boolean);
            if (!rel.includes("noopener")) rel.push("noopener");
            if (!rel.includes("noreferrer")) rel.push("noreferrer");
            link.setAttribute("rel", rel.join(" "));
        });
    }

});

