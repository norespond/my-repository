(function () {
    const layerId = "yuki-snow-layer";
    const flakeSrc = "./assets/themes/Yuki/assets/images/page-head/yuki_01.png";
    const pageHead = document.querySelector(".page-head");
    let expanded = false;

    function createFlake(layer) {
        const flake = document.createElement("span");
        const size = 10 + Math.random() * 18;
        const x = Math.random() * 100;
        const drift = (Math.random() * 160 - 80).toFixed(1);
        const duration = 11 + Math.random() * 9;
        const delay = -Math.random() * duration;
        const opacity = 0.32 + Math.random() * 0.5;

        flake.className = "yuki-snowflake";
        flake.style.setProperty("--flake-size", `${size}px`);
        flake.style.setProperty("--flake-x", `${x}vw`);
        flake.style.setProperty("--flake-drift", `${drift}px`);
        flake.style.setProperty("--flake-duration", `${duration}s`);
        flake.style.setProperty("--flake-delay", `${delay}s`);
        flake.style.opacity = String(opacity);

        const img = document.createElement("img");
        img.alt = "";
        img.src = flakeSrc;
        flake.appendChild(img);
        layer.appendChild(flake);

        flake.addEventListener("animationend", () => {
            flake.remove();
        }, { once: true });
    }

    function startSnow() {
        if (!document.body || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const oldLayer = document.getElementById(layerId);
        if (oldLayer) {
            oldLayer.remove();
        }

        if (typeof window.__yukiSnowCleanup === "function") {
            try {
                window.__yukiSnowCleanup();
            } catch (error) {
                console.warn("[Yuki] 清理旧雪花层时发生错误：", error);
            }
        }

        const layer = document.createElement("div");
        layer.id = layerId;
        layer.className = "yuki-snow-layer";
        document.body.appendChild(layer);

        const interval = window.setInterval(() => {
            createFlake(layer);
            if (Math.random() > 0.7) {
                createFlake(layer);
            }
        }, 760);

        for (let i = 0; i < 6; i += 1) {
            window.setTimeout(() => createFlake(layer), i * 140);
        }

        const cleanup = () => {
            window.clearInterval(interval);
            layer.remove();
            if (window.__yukiSnowCleanup === cleanup) {
                window.__yukiSnowCleanup = null;
            }
        };

        window.__yukiSnowCleanup = cleanup;
        window.addEventListener("beforeunload", cleanup, { once: true });
    }

    function bindPageHeadExpand() {
        if (!pageHead || pageHead.dataset.yukiExpandBound === "true") {
            return;
        }

        pageHead.dataset.yukiExpandBound = "true";
        pageHead.addEventListener("click", () => {
            expanded = !expanded;
            pageHead.classList.toggle("expand", expanded);
        });
    }

    if (document.body) {
        startSnow();
        bindPageHeadExpand();
    } else {
        window.addEventListener("DOMContentLoaded", () => {
            startSnow();
            bindPageHeadExpand();
        }, { once: true });
    }
})();
