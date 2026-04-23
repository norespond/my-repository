window.getGalleryAppMarkup = function () {
    const icon = name => (typeof window.renderIconMarkup === "function" ? window.renderIconMarkup(name) : "");
    return `
        <section id="image-app" class="image-app" aria-label="图集应用">
            <header class="image-hero">
                <div class="image-hero-copy">
                    <p class="eyebrow">Gallery / Collection</p>
                    <h1 class="image-title">图集</h1>
                    <p class="image-lead">
                        从 <code>assets/img.json</code> 加载。支持搜索、筛选、排序和预览。
                    </p>
                    <div class="hero-actions">
                        <button id="image-reset" class="ghost-button" type="button">重置筛选</button>
                        <button id="image-back" class="primary-button" type="button">返回首页</button>
                    </div>
                </div>

                <div class="image-stats" id="image-stats">
                    <div class="stat-card">
                        <span class="stat-label">总数</span>
                        <strong class="stat-value" data-stat="total">0</strong>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">当前</span>
                        <strong class="stat-value" data-stat="visible">0</strong>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">筛选</span>
                        <strong class="stat-value" data-stat="filter">全部</strong>
                    </div>
                </div>
            </header>

            <div class="image-toolbar">
                <label class="search-box" for="image-search">
                    ${icon("magnifying-glass")}
                    <input id="image-search" type="search" placeholder="搜索图片名称、文件名或路径" autocomplete="off" />
                    <button id="image-clear" class="search-clear" type="button" aria-label="清空搜索">清空</button>
                </label>

                <label class="sort-box" for="image-sort">
                    <span>排序</span>
                    <select id="image-sort">
                        <option value="source">原始顺序</option>
                        <option value="name">名称 A-Z</option>
                        <option value="random">随机</option>
                    </select>
                </label>
            </div>

            <div class="filter-group" id="image-filters" aria-label="图片筛选"></div>

            <div class="image-status">
                <div id="image-status-text" class="image-status-text">正在加载图片...</div>
            </div>

            <div id="image-gallery" class="image-grid" aria-live="polite"></div>
        </section>

        <div id="image-modal" class="image-modal" hidden data-state="" tabindex="-1">
            <div class="image-modal-backdrop" data-close="true"></div>
            <div class="image-modal-panel" role="dialog" aria-modal="true" aria-label="图片预览">
                <button class="image-modal-close" type="button" data-close="true" aria-label="关闭预览">
                    ${icon("xmark")}
                </button>
                <div class="image-modal-media">
                    <img id="image-modal-img" alt="" />
                </div>
                <div class="image-modal-controls" aria-label="鍥剧墖鍒囨崲">
                    <button id="image-modal-prev" class="ghost-button" type="button">上一张</button>
                    <button id="image-modal-next" class="ghost-button" type="button">下一张</button>
                </div>
            </div>
        </div>
    `;
};

window.mountGalleryApp = function (root, options = {}) {
    if (!root) return;

    const app = {
        gallery: root.querySelector("#image-gallery"),
        statusText: root.querySelector("#image-status-text"),
        filters: root.querySelector("#image-filters"),
        search: root.querySelector("#image-search"),
        clearSearch: root.querySelector("#image-clear"),
        sort: root.querySelector("#image-sort"),
        reset: root.querySelector("#image-reset"),
        back: root.querySelector("#image-back"),
        modal: root.querySelector("#image-modal"),
        modalPanel: root.querySelector(".image-modal-panel"),
        modalImg: root.querySelector("#image-modal-img"),
        modalPrev: root.querySelector("#image-modal-prev"),
        modalNext: root.querySelector("#image-modal-next"),
        statsTotal: root.querySelector('[data-stat="total"]'),
        statsVisible: root.querySelector('[data-stat="visible"]'),
        statsFilter: root.querySelector('[data-stat="filter"]'),
    };

    if (!app.gallery || !app.statusText || !app.filters || !app.search || !app.sort || !app.modal) {
        return;
    }

    const modalOriginalParent = app.modal.parentNode;
    if (document.body && app.modal.parentNode !== document.body) {
        document.body.appendChild(app.modal);
    }

    const state = {
        images: [],
        filtered: [],
        activeFilter: "all",
        query: "",
        sort: "source",
        activeIndex: -1,
        lastFocusEl: null,
    };
    let modalCloseTimer = null;

    const filterMeta = [
        { id: "all", label: "全部", icon: "circle-half-stroke" },
        { id: "horizontal", label: "横图", icon: "sun" },
        { id: "vertical", label: "竖图", icon: "moon" },
        { id: "other", label: "其他", icon: "ellipsis" },
    ];

    const observer = "IntersectionObserver" in window
        ? new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                if (!img || !img.classList) return;
                const src = img.dataset.src;
                if (src && !img.src) img.src = src;
                img.classList.remove("lazy-img");
                observer.unobserve(img);
            });
        }, { rootMargin: "240px" })
        : null;
    const cleanup = [];

    function listen(target, type, handler) {
        target.addEventListener(type, handler);
        cleanup.push(() => target.removeEventListener(type, handler));
    }

    renderFilters();
    bindEvents();
    loadImages();

    function bindEvents() {
        listen(app.search, "input", () => {
            state.query = app.search.value.trim().toLowerCase();
            refresh();
        });

        listen(app.clearSearch, "click", () => {
            app.search.value = "";
            state.query = "";
            refresh();
            app.search.focus();
        });

        listen(app.sort, "change", () => {
            state.sort = app.sort.value;
            refresh();
        });

        listen(app.filters, "click", event => {
            const button = event.target.closest("button[data-filter]");
            if (!button) return;
            state.activeFilter = button.dataset.filter;
            refresh();
        });

        listen(app.reset, "click", () => {
            resetState();
        });

        if (app.back) {
            listen(app.back, "click", () => {
                if (typeof options.onBack === "function") {
                    options.onBack();
                }
            });
        }

        listen(app.gallery, "click", event => {
            const card = event.target.closest(".gallery-card");
            if (!card) return;
            openModal(Number(card.dataset.index));
        });

        listen(app.modal, "click", event => {
            if (event.target.dataset.close === "true") {
                closeModal();
            } else if (
                event.target === app.modalPanel ||
                (event.target.closest(".image-modal-media") && event.target.tagName !== "IMG") ||
                (event.target.closest(".image-modal-controls") && !event.target.closest("button"))
            ) {
                closeModal();
            }
        });

        listen(app.modalPrev, "click", () => moveModal(-1));
        listen(app.modalNext, "click", () => moveModal(1));
        listen(window, "keydown", event => {
            if (event.key === "Escape") {
                closeModal();
            } else if (event.key === "ArrowLeft" && !app.modal.hidden) {
                moveModal(-1);
            } else if (event.key === "ArrowRight" && !app.modal.hidden) {
                moveModal(1);
            } else if (event.key === "/" && document.activeElement !== app.search) {
                event.preventDefault();
                app.search.focus();
            }
        });

        listen(window, "hashchange", syncHashToModal);
    }

    async function loadImages() {
        setStatus("正在加载图片...");
        try {
            const response = await fetch("./assets/img.json");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            state.images = normalizeImages(data);
            refresh();
            syncHashToModal();
        } catch (error) {
            console.error("加载 assets/img.json 失败:", error);
            setStatus("图片加载失败，请检查 assets/img.json");
        }
    }

    function normalizeImages(data) {
        if (!Array.isArray(data)) return [];
        return data
            .map((item, index) => {
                const src = typeof item === "string" ? item : item?.src;
                if (!src) return null;

                const title = typeof item === "string" ? filenameFromUrl(src) : (item.title || item.alt || filenameFromUrl(src));
                const folder = folderFromUrl(src);
                const orientation = inferOrientation(src);

                return {
                    id: index,
                    src,
                    title,
                    folder,
                    orientation,
                    keywords: `${title} ${folder} ${src}`.toLowerCase(),
                };
            })
            .filter(Boolean);
    }

    function folderFromUrl(src) {
        try {
            const url = new URL(src, window.location.href);
            const segments = url.pathname.split("/").filter(Boolean);
            const folder = segments.length > 1 ? segments[segments.length - 2] : "";
            return decodeURIComponent(folder);
        } catch {
            return "";
        }
    }

    function filenameFromUrl(src) {
        try {
            const url = new URL(src, window.location.href);
            const filename = url.pathname.split("/").pop() || src;
            return decodeURIComponent(filename.replace(/\.[^.]+$/, ""));
        } catch {
            return src;
        }
    }

    function inferOrientation(src) {
        const value = String(src).toLowerCase();
        if (value.includes("/horizontal/")) return "horizontal";
        if (value.includes("/vertical/")) return "vertical";
        return "other";
    }

    function renderFilters() {
        const counts = state.images.reduce((acc, image) => {
            acc[image.orientation] = (acc[image.orientation] || 0) + 1;
            return acc;
        }, { all: state.images.length, horizontal: 0, vertical: 0, other: 0 });

        app.filters.innerHTML = filterMeta.map(filter => {
            const count = filter.id === "all" ? counts.all : (counts[filter.id] || 0);
            const iconMarkup = typeof window.renderIconMarkup === "function" ? window.renderIconMarkup(filter.icon) : "";
            return `
                <button type="button" class="filter-chip" data-filter="${filter.id}">
                    ${iconMarkup}
                    <span>${filter.label}</span>
                    <strong>${count}</strong>
                </button>
            `;
        }).join("");
        if (typeof window.hydrateIcons === "function") {
            window.hydrateIcons(app.filters);
        }
    }

    function refresh() {
        closeModal(true);
        state.filtered = applyFilters();
        state.activeIndex = -1;
        renderFilters();
        updateStats();
        highlightFilters();
        renderGallery();
    }

    function resetState() {
        state.activeFilter = "all";
        state.query = "";
        state.sort = "source";
        app.search.value = "";
        app.sort.value = "source";
        refresh();
    }

    function applyFilters() {
        const filtered = state.images.filter(image => {
            const matchesFilter = state.activeFilter === "all" || image.orientation === state.activeFilter;
            const matchesQuery = !state.query || image.keywords.includes(state.query);
            return matchesFilter && matchesQuery;
        });

        if (state.sort === "name") return filtered.slice().sort((a, b) => a.title.localeCompare(b.title, "zh-Hans-CN"));
        if (state.sort === "random") return filtered.slice().sort(() => Math.random() - 0.5);
        return filtered;
    }

    function highlightFilters() {
        app.filters.querySelectorAll("button[data-filter]").forEach(button => {
            button.classList.toggle("is-active", button.dataset.filter === state.activeFilter);
        });
    }

    function updateStats() {
        if (app.statsTotal) app.statsTotal.textContent = String(state.images.length);
        if (app.statsVisible) app.statsVisible.textContent = String(state.filtered.length);
        if (app.statsFilter) {
            const label = filterMeta.find(item => item.id === state.activeFilter)?.label || "全部";
            app.statsFilter.textContent = label;
        }
    }

    function renderGallery() {
        app.gallery.innerHTML = "";

        if (state.images.length === 0) {
            app.gallery.innerHTML = `
                <div class="image-empty">
                    <strong>暂无图片</strong>
                    <p>请检查 <code>assets/img.json</code> 是否可用。</p>
                </div>
            `;
            setStatus("暂无图片数据。");
            return;
        }

        if (state.filtered.length === 0) {
            app.gallery.innerHTML = `
                <div class="image-empty">
                    <strong>没有找到匹配的图片</strong>
                    <p>换个关键词，或者先清空筛选条件。</p>
                    <button type="button" class="ghost-button" data-action="reset-empty">重置筛选</button>
                </div>
            `;
            setStatus("没有找到匹配的图片。");
            const button = app.gallery.querySelector('[data-action="reset-empty"]');
            if (button) {
                listen(button, "click", resetState);
            }
            return;
        }

        const fragment = document.createDocumentFragment();
        state.filtered.forEach((image, index) => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = `gallery-card gallery-card--${image.orientation}`;
            card.dataset.index = String(index);
            card.style.setProperty("--item-delay", `${Math.min(index, 20) * 18}ms`);
            card.setAttribute("aria-label", `预览 ${image.title}`);

            card.innerHTML = `
                <span class="gallery-card-media">
                    <img class="lazy-img" alt="${escapeHtml(image.title)}" loading="lazy" decoding="async" data-src="${escapeHtml(image.src)}" />
                </span>
            `;

            fragment.appendChild(card);

            const img = card.querySelector("img");
            if (observer && img) {
                observer.observe(img);
            } else if (img) {
                img.src = image.src;
                if (img.classList) {
                    img.classList.remove("lazy-img");
                }
            }
        });

        app.gallery.appendChild(fragment);
        setStatus(`已显示 ${state.filtered.length} 张图片。`);
    }

    function setStatus(text) {
        app.statusText.textContent = text;
    }

    function openModal(index) {
        const image = state.filtered[index];
        if (!image) return;

        if (app.modal.dataset.state === "open" && state.activeIndex === index) {
            return;
        }

        if (modalCloseTimer) {
            clearTimeout(modalCloseTimer);
            modalCloseTimer = null;
        }

        state.activeIndex = index;
        state.lastFocusEl = document.activeElement;
        app.modalImg.src = image.src;
        app.modalImg.alt = image.title;
        app.modal.hidden = false;
        app.modal.dataset.state = "open";
        document.body.style.overflow = "hidden";
    }

    function closeModal(skipRestoreFocus = false) {
        if (app.modal.hidden) return;

        if (modalCloseTimer) {
            clearTimeout(modalCloseTimer);
            modalCloseTimer = null;
        }

        app.modal.dataset.state = "closing";
        app.modalImg.src = "";
        document.body.style.overflow = "";

        modalCloseTimer = setTimeout(() => {
            app.modal.hidden = true;
            app.modal.dataset.state = "";
            if (state.activeIndex >= 0 && !skipRestoreFocus && state.lastFocusEl && typeof state.lastFocusEl.focus === "function") {
                state.lastFocusEl.focus();
            }
            state.activeIndex = -1;
            modalCloseTimer = null;
        }, 180);
    }

    function moveModal(step) {
        if (state.filtered.length === 0 || state.activeIndex < 0) return;
        const nextIndex = (state.activeIndex + step + state.filtered.length) % state.filtered.length;
        openModal(nextIndex);
    }

    function syncHashToModal() {
        if (!app.modal.hidden) closeModal();
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    return function cleanupGalleryApp() {
        if (modalCloseTimer) {
            clearTimeout(modalCloseTimer);
            modalCloseTimer = null;
        }
        if (observer && typeof observer.disconnect === "function") {
            observer.disconnect();
        }
        cleanup.forEach(fn => fn());
        cleanup.length = 0;
        if (app.modal && app.modal.parentNode) {
            app.modal.parentNode.removeChild(app.modal);
        } else if (modalOriginalParent && app.modal && app.modal.parentNode !== modalOriginalParent) {
            modalOriginalParent.appendChild(app.modal);
        }
    };
};
