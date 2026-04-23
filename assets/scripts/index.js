/* global initHomePage */

// 入口脚本只做一件事：等 DOM 准备好后启动首页。
document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.initHomePage !== "function") {
        console.error("首页初始化函数未加载");
        return;
    }

    window.initHomePage().catch(error => {
        console.error("首页初始化失败", error);
    });
});
