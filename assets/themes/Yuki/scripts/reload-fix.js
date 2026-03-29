(function () {
    const cleanup = window.__yukiSnowCleanup;
    if (typeof cleanup === "function") {
        try {
            cleanup();
        } catch (error) {
            console.warn("[Yuki] 上一次雪花层清理失败：", error);
        }
    }
    window.__yukiSnowCleanup = null;
})();
