window.getGalleryAppMarkup = function () {
    return `
        <section id="image-app" class="image-app" aria-label="图集应用">
            <header class="image-hero">
                <div class="image-hero-copy">
                    <p class="eyebrow">Gallery / SPA</p>
                    <h1 class="image-title">图集</h1>
                    <p class="image-lead">图片从 <code>assets/img.json</code> 加载，支持搜索、筛选、排序和预览。</p>
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
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input id="image-search" type="search" placeholder="搜索图片名称、文件名或路径" autocomplete="off" />
                </label>

                <div class="filter-group" id="image-filters" aria-label="图片筛选"></div>

                <label class="sort-box" for="image-sort">
                    <span>排序</span>
                    <select id="image-sort">
                        <option value="source">原始顺序</option>
                        <option value="name">名称 A-Z</option>
                        <option value="random">随机</option>
                    </select>
                </label>
            </div>

            <div class="image-status">
                <div id="image-status-text" class="image-status-text">正在加载图片...</div>
                <div class="image-status-actions">
                    <button id="image-reset" class="ghost-button" type="button">重置筛选</button>
                    <button id="image-back" class="ghost-button" type="button">返回首页</button>
                </div>
            </div>

            <div id="image-gallery" class="waterfall-grid" aria-live="polite"></div>

            <div class="gallery-footer">
                <button id="load-more" class="primary-button" type="button">加载更多</button>
            </div>
        </section>

        <div id="image-modal" class="image-modal" hidden>
            <div class="image-modal-backdrop" data-close="true"></div>
            <div class="image-modal-panel" role="dialog" aria-modal="true" aria-label="图片预览">
                <button class="image-modal-close" type="button" data-close="true" aria-label="关闭预览">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="image-modal-media">
                    <img id="image-modal-img" alt="" />
                </div>
                <div class="image-modal-meta">
                    <div>
                        <h2 id="image-modal-title">图片预览</h2>
                        <p id="image-modal-subtitle"></p>
                    </div>
                    <div class="image-modal-actions">
                        <button id="image-modal-prev" class="ghost-button" type="button">上一张</button>
                        <button id="image-modal-next" class="ghost-button" type="button">下一张</button>
                        <a id="image-modal-open" class="primary-button" href="" target="_blank" rel="noopener noreferrer">打开原图</a>
                    </div>
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
        sort: root.querySelector("#image-sort"),
        reset: root.querySelector("#image-reset"),
        back: root.querySelector("#image-back"),
        loadMore: root.querySelector("#load-more"),
        modal: root.querySelector("#image-modal"),
        modalImg: root.querySelector("#image-modal-img"),
        modalTitle: root.querySelector("#image-modal-title"),
        modalSubtitle: root.querySelector("#image-modal-subtitle"),
        modalOpen: root.querySelector("#image-modal-open"),
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
        renderedCount: 0,
        batchSize: 24,
        activeFilter: "all",
        query: "",
        sort: "source",
        activeIndex: -1,
    };

    const filterMeta = [
        { id: "all", label: "全部" },
        { id: "horizontal", label: "横图" },
        { id: "vertical", label: "竖图" },
        { id: "other", label: "其他" },
    ];

    const observer = "IntersectionObserver" in window
        ? new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                const src = img.dataset.src;
                if (src && !img.src) img.src = src;
                img.classList.remove("lazy-img");
                observer.unobserve(img);
            });
        }, { rootMargin: "200px" })
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
            state.activeFilter = "all";
            state.query = "";
            state.sort = "source";
            app.search.value = "";
            app.sort.value = "source";
            refresh();
        });

        if (app.back) {
            listen(app.back, "click", () => {
                if (typeof options.onBack === "function") {
                    options.onBack();
                }
            });
        }

        listen(app.loadMore, "click", () => {
            renderNextBatch();
        });

        listen(app.gallery, "click", event => {
            const item = event.target.closest(".waterfall-item");
            if (!item) return;
            openModal(Number(item.dataset.index));
        });

        listen(app.modal, "click", event => {
            if (event.target.dataset.close === "true") {
                closeModal();
            }
        });

        listen(app.modalPrev, "click", () => moveModal(-1));
        listen(app.modalNext, "click", () => moveModal(1));

        listen(window, "keydown", event => {
            if (event.key === "Escape") {
                closeModal();
                if (typeof options.onBack === "function" && !root.contains(document.activeElement)) {
                    // no-op, keep gallery open unless user clicks back
                }
            } else if (event.key === "ArrowLeft" && !app.modal.hidden) {
                moveModal(-1);
            } else if (event.key === "ArrowRight" && !app.modal.hidden) {
                moveModal(1);
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
        app.filters.innerHTML = filterMeta.map(filter => (
            `<button type="button" class="filter-chip" data-filter="${filter.id}">${filter.label}</button>`
        )).join("");
    }

    function refresh() {
        if (!app.modal.hidden) closeModal();
        state.filtered = applyFilters();
        state.renderedCount = 0;
        state.activeIndex = -1;
        app.gallery.innerHTML = "";
        updateStats();
        highlightFilters();
        renderNextBatch();
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

    function renderNextBatch() {
        if (state.renderedCount >= state.filtered.length) {
            setStatus(state.filtered.length === 0 ? "没有找到匹配的图片。" : "已经到底了。");
            app.loadMore.disabled = true;
            app.loadMore.textContent = "没有更多了";
            return;
        }

        const nextImages = state.filtered.slice(state.renderedCount, state.renderedCount + state.batchSize);
        const fragment = document.createDocumentFragment();

        nextImages.forEach((image, offset) => {
            const index = state.renderedCount + offset;
            const card = document.createElement("article");
            card.className = "waterfall-item";
            card.dataset.index = String(index);

            const thumb = document.createElement("div");
            thumb.className = "waterfall-thumb";

            const img = document.createElement("img");
            img.className = "lazy-img";
            img.alt = image.title;
            img.loading = "lazy";
            img.decoding = "async";
            img.dataset.src = image.src;

            thumb.appendChild(img);
            card.appendChild(thumb);
            fragment.appendChild(card);

            if (observer) observer.observe(img);
            else img.src = image.src;
        });

        app.gallery.appendChild(fragment);
        state.renderedCount += nextImages.length;
        app.loadMore.disabled = state.renderedCount >= state.filtered.length;
        app.loadMore.textContent = state.renderedCount >= state.filtered.length ? "没有更多了" : "加载更多";
        setStatus(state.renderedCount === 0 ? "没有找到匹配的图片。" : `已显示 ${state.renderedCount} / ${state.filtered.length} 张`);
    }

    function setStatus(text) {
        app.statusText.textContent = text;
    }

    function openModal(index) {
        const image = state.filtered[index];
        if (!image) return;

        state.activeIndex = index;
        app.modalImg.src = image.src;
        app.modalImg.alt = image.title;
        app.modalTitle.textContent = image.title;
        app.modalSubtitle.textContent = `${image.orientation === "other" ? "其他" : image.orientation} · ${image.folder || "未分类"}`;
        app.modalOpen.href = image.src;
        app.modal.hidden = false;
        document.body.style.overflow = "hidden";
        window.location.hash = `image=${encodeURIComponent(image.src)}`;
    }

    function closeModal() {
        if (app.modal.hidden) return;
        app.modal.hidden = true;
        app.modalImg.src = "";
        document.body.style.overflow = "";
        if (window.location.hash.startsWith("#image=")) {
            history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        state.activeIndex = -1;
    }

    function moveModal(step) {
        if (state.filtered.length === 0 || state.activeIndex < 0) return;
        const nextIndex = (state.activeIndex + step + state.filtered.length) % state.filtered.length;
        openModal(nextIndex);
    }

    function syncHashToModal() {
        if (!window.location.hash.startsWith("#image=")) {
            if (!app.modal.hidden) closeModal();
            return;
        }

        const encoded = window.location.hash.replace("#image=", "");
        const src = decodeURIComponent(encoded);
        const index = state.filtered.findIndex(item => item.src === src);
        if (index !== -1) openModal(index);
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
        cleanup.forEach(fn => fn());
        cleanup.length = 0;
        if (app.modal && app.modal.parentNode) {
            app.modal.parentNode.removeChild(app.modal);
        } else if (modalOriginalParent && app.modal && app.modal.parentNode !== modalOriginalParent) {
            modalOriginalParent.appendChild(app.modal);
        }
    };
};
