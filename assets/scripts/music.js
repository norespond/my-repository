document.addEventListener("DOMContentLoaded", () => {
    const fallbackCover = "https://norespond.github.io/picx-images-hosting/cover/EV074.4n82bulpg6.jpg";
    const aplayerJsUrl = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js";
    const aplayerCssUrl = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css";

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

    function resolveCoverImage(url, song) {
        return new Promise(resolve => {
            if (!url) {
                console.warn("[APlayer] 封面地址为空，已使用备用封面：", song);
                resolve(fallbackCover);
                return;
            }

            const img = new Image();
            img.onload = function () {
                resolve(url);
            };
            img.onerror = function () {
                console.warn("[APlayer] 封面加载失败，已切换到备用封面：", {
                    title: song.name,
                    artist: song.artist,
                    cover: song.cover,
                    url: song.url,
                    fallbackCover,
                });
                resolve(fallbackCover);
            };
            img.src = url;
        });
    }

    fetch("./assets/song.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(songsData => {
            const audioList = songsData
                .map(song => ({
                    name: song.title || song.name || "Unknown Title",
                    artist: song.album || song.artist || "",
                    cover: song.cover || "./assets/images/avatar.png",
                    url: song.url || "",
                }))
                .filter(song => song.url);

            const container = document.getElementById("aplayer");
            if (!container) {
                return;
            }
            const card = container.closest(".card-item");
            const hidePlayerCard = () => {
                if (card) {
                    card.hidden = true;
                } else {
                    container.hidden = true;
                }
            };

            if (audioList.length === 0) {
                hidePlayerCard();
                return;
            }

            Promise.all([
                loadStylesheet(aplayerCssUrl),
                loadScript(aplayerJsUrl),
                Promise.all(
                    audioList.map(song =>
                        resolveCoverImage(song.cover, song).then(cover => ({
                            ...song,
                            cover,
                        }))
                    )
                ),
            ]).then(([, APlayerCtor, resolvedList]) => {
                if (!APlayerCtor) {
                    hidePlayerCard();
                    console.warn("[APlayer] 播放器资源未能加载，已跳过初始化");
                    return;
                }

                const ap = new APlayerCtor({
                    container,
                    theme: "#FADFA3",
                    loop: "one",
                    volume: 0.7,
                    fixed: false,
                    listFolded: true,
                    audio: [],
                });

                ap.list.add(resolvedList);

                if (resolvedList.length > 0) {
                    ap.list.switch(0);
                }
            });
        })
        .catch(error => {
            console.error("加载 assets/song.json 失败:", error);
        });
});
