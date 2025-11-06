document.addEventListener("DOMContentLoaded", function () {
    const ap = new APlayer({
        container: document.getElementById('aplayer'),
        theme: '#FADFA3', // 使用固定的主题色
        loop: 'one',  // 单曲循环
        volume: 0.7,
        fixed: true,
        audio: []
    });

    const repoBaseUrl = "https://norespond.github.io/music-feng/music/";

    fetch("https://norespond.github.io/music-feng/music/song.json")
        .then(response => response.json())
        .then(songsData => {
            const audioList = songsData.map(song => {
                // 打印每个歌曲的封面 URL 进行调试
                console.log("Cover URL:", song.cover);

                return {
                    name: song.name,
                    artist: song.artist,
                    cover: song.cover, // 直接使用从 JSON 中获取的封面 URL
                    url: repoBaseUrl + encodeURIComponent(song.file),
                };
            });

            // 将音频列表添加到播放器中
            ap.list.add(audioList);


            // 设置默认播放歌曲（例如，默认播放第一首歌）
            const defaultSongIndex = songsData.findIndex(song => song.file === "つないだ手ぶくろ.mp3");
            if (defaultSongIndex !== -1) {
                ap.list.switch(defaultSongIndex);  // 切换到指定歌曲并播放
                //ap.play();  // 播放当前歌曲
            } else {
                console.error("指定的歌曲未找到！");
            }
        })
        .catch(error => console.error("加载歌曲信息失败:", error));
});