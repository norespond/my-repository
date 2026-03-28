document.addEventListener("DOMContentLoaded", function () {
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

            ap.list.add(audioList);

            if (audioList.length > 0) {
                ap.list.switch(0);
            }
        })
        .catch(error => {
            console.error("加载 assets/song.json 失败:", error);
        });
});
