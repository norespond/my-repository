document.addEventListener("DOMContentLoaded", function () {
    const ap = new APlayer({
        container: document.getElementById('player'),
        mini: false,
        autoplay: false,
        theme: '#FADFA3',
        loop: 'all',
        order: 'random',
        preload: 'auto',
        volume: 0.7,
        mutex: true,
        listFolded: true,
        fixed: false,
        lrcType: 0,
        audio: [] // 先初始化为空，后续通过 API 添加
    });

    const repoOwner = "norespond";
    const repoName = "qiu-music";
    const folderPath = "music";
    const repoBaseUrl = `https://${repoOwner}.github.io/${repoName}/${folderPath}/`;
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`;

    fetch("https://norespond.github.io/qiu-music/music/song.json")
        .then(response => response.json())
        .then(songsData => {
            const audioList = songsData.map(song => ({
                name: song.name,
                artist: song.artist,
                cover: song.cover || "https://norespond.github.io/my-repository/favicon.ico",  // 可以设置不同封面
                url: repoBaseUrl + encodeURIComponent(song.file),
            }));
            ap.list.add(audioList);
        })
        .catch(error => console.error("加载歌曲信息失败:", error));
});