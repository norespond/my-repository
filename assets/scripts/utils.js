/* global swal, markdownit */

// 获取网站配置
function getWebsiteConfig() {
    return {
        // 使用 autoInitObject() 来创建一个递归代理，访问任何未定义的深层属性时不会抛出错误
        content: autoInitObject(),
        async init() {
            try {
                const res = await fetch("./config.json");
                if (!res.ok) throw new Error("无法获取网站配置文件");
                this.content = await res.json();
            } catch (error) {
                console.error("无法获取网站配置文件: ", error);
            }
        },
    };
}

// 获取网站配置（不在此处自动 init，调用方应在需要时 await config.init()）
const config = getWebsiteConfig();

// 如果页面在 head 中提前注入了 window.config 的简略默认值（为了防止 Alpine 在 config 加载前报错），
// 则尽量保留这些默认值，将它们合并到我们内部的 config.content 中；同时把内部 config 绑定到 window.config，
// 以确保所有脚本引用的是同一个对象（避免全局命名混淆导致的竞态）。
try {
    if (window.config && window.config.content) {
        // 将提前注入的内容合并到代理对象中（代理会自动创建深层属性）
        const injected = window.config.content;
        // 只合并第一层，以保留自动代理行为；深层赋值也会逐步创建属性
        Object.keys(injected).forEach(key => {
            try {
                config.content[key] = injected[key];
            } catch (e) {
                console.warn('合并预注入 config.content 时发生错误: ', e);
            }
        });
    }
} catch (e) {
    console.warn('检查 window.config 时发生错误: ', e);
}

// 暴露到全局，确保其他脚本通过 window.config 也能访问到同一实例
window.config = config;

// 对象递归初始化代理
function autoInitObject() {
    return new Proxy(
        {},
        {
            get(target, prop) {
                // 如果属性不存在，则递归返回一个新的代理
                if (!(prop in target)) {
                    target[prop] = autoInitObject();
                }
                return target[prop];
            },
            set(target, prop, value) {
                // 正常设置属性
                target[prop] = value;
                return true;
            },
        }
    );
}

// 节流函数
// NOTE: 节流的作用是：无论事件触发频率多高，目标函数都只会在指定时间间隔内执行一次。
function throttle(func, interval) {
    let lastTime = 0;
    return function (...args) {
        const now = Date.now(); // 当前时间
        if (now - lastTime >= interval) {
            func.apply(this, args); // 如果距离上次执行的时间超过间隔，执行函数
            lastTime = now; // 更新上次执行时间
        }
    };
}

// 防抖函数
// NOTE: 防抖的作用是：在事件触发后的 delay 时间内没有再次触发时，才会执行目标函数。
function debounce(func, delay) {
    let timer;
    return function (...args) {
        const context = this;
        clearTimeout(timer); // 每次触发事件都清除之前的定时器
        timer = setTimeout(() => {
            func.apply(context, args); // 重新设定定时器并调用函数
        }, delay);
    };
}

// 延迟初始化 markdown-it 实例（当 CDN 无法加载时可优雅退化）
let md;

// Markdown 渲染器
function renderMarkdown() {
    // 获取页面中的所有 .markdown-content 元素
    const markdownElements = document.querySelectorAll(".markdown-content");

    // 遍历每个元素，获取其 src 指定的 Markdown 文件并渲染
    markdownElements.forEach(element => {
        const src = element.getAttribute("src"); // 获取 src 属性

        if (src) {
            // 使用 fetch 来获取 .md 文件内容
            fetch(src)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`无法获取 Markdown 文件: ${src}`);
                    }
                    return response.text();
                })
                .then(markdownContent => {
                        // 如果尚未初始化 md，尝试在全局寻找 markdownit 并初始化
                        if (!md && typeof markdownit !== "undefined") {
                            try {
                                md = new markdownit({ html: true });
                            } catch (e) {
                                console.error('初始化 markdown-it 失败', e);
                            }
                        }

                        if (md) {
                            // 使用 markdown-it 库将 Markdown 转换为 HTML
                            const renderedHTML = md.render(markdownContent);
                            // 使用渲染后的 HTML 直接替换原始内容
                            element.innerHTML = renderedHTML;
                        } else {
                            // markdown-it 不可用：回退为纯文本显示（避免抛错）
                            const pre = document.createElement('pre');
                            pre.style.whiteSpace = 'pre-wrap';
                            pre.textContent = markdownContent;
                            element.innerHTML = '';
                            element.appendChild(pre);
                            console.warn('markdown-it 未加载，已以纯文本回退渲染：', src);
                        }
                })
                .catch(error => {
                    console.error(error);
                    element.innerHTML = `<span style='color: red;'>加载 Markdown 文件失败: ${src}</span>`;
                });
        } else {
            element.innerHTML = "<span style='color: red;'>加载 Markdown 文件失败: 未在 src 属性中指定文件路径</span>";
        }
    });
}

// 将方法挂载到全局对象 window
window.autoInitObject = autoInitObject;
