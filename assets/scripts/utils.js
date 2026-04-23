// 通用节流/防抖工具，给页面交互和滚动事件复用。

// 节流函数：同一时间窗口内只会执行一次。
function throttle(func, interval) {
    let lastTime = 0;

    return function (...args) {
        const now = Date.now();
        if (now - lastTime >= interval) {
            func.apply(this, args);
            lastTime = now;
        }
    };
}

// 防抖函数：在事件停止触发一段时间后再执行。
function debounce(func, delay) {
    let timer;

    return function (...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

window.throttle = throttle;
window.debounce = debounce;
