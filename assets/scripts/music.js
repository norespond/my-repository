document.addEventListener("DOMContentLoaded", function () {
    const fallbackCover = "https://norespond.github.io/picx-images-hosting/cover/EV074.4n82bulpg6.jpg";

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

    const ap = new APlayer({
        container: document.getElementById("aplayer"),
        theme: "#FADFA3",
        loop: "one",
        volume: 0.7,
        fixed: true,
        audio: [],
    });

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

            Promise.all(audioList.map(song => resolveCoverImage(song.cover, song).then(cover => ({
                ...song,
                cover,
            })))).then(resolvedList => {
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
