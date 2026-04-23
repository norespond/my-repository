/* global config, throttle, Typed, renderMarkdown */

// 首页装配逻辑。
// 这个文件只负责“页面怎么跑起来”，不再混入配置解析和 Markdown 渲染细节。

async function initHomePage() {
    if (typeof config.init === "function") {
        await config.init();
    }

    try {
        document.dispatchEvent(new Event("config:loaded"));
    } catch (error) {
        console.warn("无法触发 config:loaded 事件", error);
    }

    const element = {
        pageHead: document.querySelector(".page-head"),
        contentPage: document.querySelector(".content-page"),
        socialIcons: document.querySelector(".social-icons"),
        icpInfo: document.querySelector(".icp-info"),
        masterName: document.querySelector(".card-item#personal-info .name"),
        themeDisplayName: document.querySelector(".theme-display-name"),
        webmasterLink: document.querySelector(".webmaster-link"),
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const backToTopEl = document.getElementById("back-to-top");
    const homeContentPageHTML = element.contentPage ? element.contentPage.innerHTML : "";
    let galleryCleanup = null;
    let musicCleanup = null;

    // 把配置同步到页面可见区域。
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
        if (avatarEl && config.content?.masterInfo?.avatar) {
            avatarEl.src = config.content.masterInfo.avatar;
            avatarEl.alt = `${config.content.masterInfo.name || "avatar"} 的头像`;
        }
    } catch (error) {
        console.error("设置头像失败", error);
    }

    try {
        await renderMarkdown();
    } catch (error) {
        console.error("渲染 Markdown 出错", error);
    }

    // 先补安全链接，再绑定交互，避免后续动态注入内容时漏掉 rel 属性。
    secureBlankLinks(document);
    setupBackToTop(backToTopEl, prefersReducedMotion);

    async function restoreHomeContent() {
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

        // 恢复首页后重新渲染 Markdown，避免只剩下未处理的占位节点。
        try {
            await renderMarkdown();
        } catch (error) {
            console.error("恢复首页后重新渲染 Markdown 失败", error);
        }

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

    // 用事件代理接住首页两个入口按钮，避免在动态切页时重新绑定。
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

    // 打字机标题是增强效果，不影响内容可读性。
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
        } catch (error) {
            console.error("Typed.js 初始化出错", error);
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

    // 社交链接从配置生成，避免在 HTML 里硬编码。
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

    // 一言接口失败时回退到本地文案，保证首页始终有内容。
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

    // 备案信息也是配置驱动，页面只负责渲染。
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
}

function setupBackToTop(backToTopEl, prefersReducedMotion) {
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

window.initHomePage = initHomePage;
