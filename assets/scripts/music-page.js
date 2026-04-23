window.getMusicAppMarkup = function () {
    return `
        <section id="music-app" class="music-app" aria-label="音乐应用">
            <header class="music-header">
                <div class="music-header-copy">
                    <h1 class="music-title">音乐</h1>
                </div>
                <button id="music-back" class="primary-button" type="button">返回首页</button>
            </header>

            <div id="music-list" class="music-grid" aria-live="polite"></div>
            <div id="music-aplayer" class="music-aplayer" aria-hidden="true"></div>
        </section>
    `;
};

window.mountMusicApp = function (root, options = {}) {
    if (!root) return;

    const app = {
        list: root.querySelector("#music-list"),
        back: root.querySelector("#music-back"),
        player: root.querySelector("#music-aplayer"),
    };

    if (!app.list || !app.back || !app.player) {
        return;
    }

    const fallbackCover = "./assets/images/avatar.png";
    const aplayerJsUrl = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js";
    const aplayerCssUrl = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css";
    const cleanup = [];
    const state = {
        tracks: [],
        activeId: null,
        player: null,
    };

    const listen = (target, type, handler) => {
        target.addEventListener(type, handler);
        cleanup.push(() => target.removeEventListener(type, handler));
    };

    const escapeHtml = value => String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    function loadStylesheet(href) {
        return new Promise(resolve => {
            const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(link => link.href === href);
            if (existing) {
                resolve(existing);
                return;
            }

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            link.onload = () => resolve(link);
            link.onerror = () => resolve(null);
            document.head.appendChild(link);
        });
    }

    function loadScript(src) {
        return new Promise(resolve => {
            if (window.APlayer) {
                resolve(window.APlayer);
                return;
            }

            const existing = Array.from(document.querySelectorAll("script")).find(script => script.src === src);
            if (existing && window.APlayer) {
                resolve(window.APlayer);
                return;
            }

            const script = document.createElement("script");
            script.src = src;
            script.defer = true;
            script.onload = () => resolve(window.APlayer || null);
            script.onerror = () => resolve(null);
            document.head.appendChild(script);
        });
    }

    function normalizeTracks(data) {
        if (!Array.isArray(data)) return [];

        return data
            .map((item, index) => {
                const title = item?.title || item?.name || `Track ${index + 1}`;
                const album = item?.album || "";
                const cover = item?.cover || fallbackCover;
                const url = item?.url || "";

                if (!url) return null;

                return {
                    id: index,
                    title,
                    album,
                    cover,
                    url,
                };
            })
            .filter(Boolean);
    }

    function getTrackById(id) {
        return state.tracks.find(track => track.id === id) || null;
    }

    function renderList() {
        app.list.innerHTML = "";

        if (state.tracks.length === 0) {
            app.list.innerHTML = `
                <div class="music-empty">
                    <strong>暂无歌曲</strong>
                    <p>请检查 <code>assets/song.json</code> 是否可用。</p>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();
        state.tracks.forEach((track, index) => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "music-card";
            card.dataset.id = String(track.id);
            card.style.setProperty("--item-delay", `${Math.min(index, 20) * 18}ms`);
            card.setAttribute("aria-label", `播放 ${track.title}`);

            if (state.activeId === track.id) {
                if (card.classList) {
                    card.classList.add("is-active");
                }
            }

            card.innerHTML = `
                <span class="music-card-cover">
                    <img alt="${escapeHtml(track.title)}" loading="lazy" decoding="async" src="${escapeHtml(track.cover || fallbackCover)}" />
                </span>
                <span class="music-card-body">
                    <strong class="music-card-title">${escapeHtml(track.title)}</strong>
                    <span class="music-card-meta">${escapeHtml(track.album || "未分类")}</span>
                </span>
                <span class="music-card-action">播放</span>
            `;

            fragment.appendChild(card);
        });

        app.list.appendChild(fragment);
    }

    function updateActiveTrack(track) {
        state.activeId = track ? track.id : null;
        renderList();
    }

    function createPlayer(APlayerCtor, tracks) {
        if (!APlayerCtor || !app.player) return null;

        const player = new APlayerCtor({
            container: app.player,
            theme: "#FADFA3",
            loop: "all",
            volume: 0.7,
            fixed: false,
            listFolded: true,
            audio: tracks.map(track => ({
                name: track.title,
                artist: track.album || "",
                cover: track.cover || fallbackCover,
                url: track.url,
            })),
        });

        if (typeof player.on === "function") {
            player.on("listswitch", event => {
                const index = typeof event === "number" ? event : event?.index;
                if (Number.isInteger(index)) {
                    const track = getTrackById(index);
                    if (track) {
                        state.activeId = track.id;
                        renderList();
                    }
                }
            });
        }

        return player;
    }

    async function ensurePlayer() {
        if (state.player) {
            return state.player;
        }

        const [, APlayerCtor] = await Promise.all([
            loadStylesheet(aplayerCssUrl),
            loadScript(aplayerJsUrl),
        ]);

        if (!APlayerCtor) {
            app.player.hidden = true;
            return null;
        }

        state.player = createPlayer(APlayerCtor, state.tracks);
        return state.player;
    }

    function playTrack(track) {
        if (!track) return;

        updateActiveTrack(track);

        ensurePlayer().then(player => {
            if (!player) return;

            try {
                player.list.switch(track.id);
                if (typeof player.play === "function") {
                    player.play();
                }
            } catch (error) {
                console.warn("[Music] 切歌失败：", error);
            }
        });
    }

    async function loadTracks() {
        try {
            const response = await fetch("./assets/song.json");
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            state.tracks = normalizeTracks(data);
            renderList();
            await ensurePlayer();
        } catch (error) {
            console.error("加载 assets/song.json 失败:", error);
            app.list.innerHTML = `
                <div class="music-empty">
                    <strong>歌曲加载失败</strong>
                    <p>请检查 <code>assets/song.json</code>。</p>
                </div>
            `;
            app.player.hidden = true;
        }
    }

    listen(app.back, "click", () => {
        if (typeof options.onBack === "function") {
            options.onBack();
        }
    });

    listen(app.list, "click", event => {
        const card = event.target.closest(".music-card");
        if (!card) return;
        const track = getTrackById(Number(card.dataset.id));
        playTrack(track);
    });

    loadTracks();

    return function cleanupMusicApp() {
        cleanup.forEach(fn => fn());
        cleanup.length = 0;

        if (state.player && typeof state.player.destroy === "function") {
            try {
                state.player.destroy();
            } catch (error) {
                console.warn("[Music] 销毁播放器失败：", error);
            }
        }

        state.player = null;
    };
};
