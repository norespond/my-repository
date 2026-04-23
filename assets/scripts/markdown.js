/* global markdownit */

// Markdown 渲染器。
// 负责把页面中带有 src 属性的 .markdown-content 转成 HTML。

let md;

async function renderMarkdown() {
    const markdownElements = document.querySelectorAll(".markdown-content");
    const tasks = [];

    markdownElements.forEach(element => {
        const src = element.getAttribute("src");
        if (!src) {
            element.innerHTML = "<span style='color: red;'>加载 Markdown 文件失败：未在 src 属性中指定文件路径</span>";
            return;
        }

        const task = fetch(src)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`无法获取 Markdown 文件: ${src}`);
                }
                return response.text();
            })
            .then(markdownContent => {
                // 首次渲染时再初始化 markdown-it，减少不必要的启动成本。
                if (!md && typeof markdownit !== "undefined") {
                    try {
                        md = new markdownit({ html: true });
                    } catch (error) {
                        console.error("初始化 markdown-it 失败", error);
                    }
                }

                if (md) {
                    element.innerHTML = md.render(markdownContent);
                    return;
                }

                // markdown-it 不可用时退回纯文本，至少保证内容可读。
                const pre = document.createElement("pre");
                pre.style.whiteSpace = "pre-wrap";
                pre.textContent = markdownContent;
                element.innerHTML = "";
                element.appendChild(pre);
                console.warn("markdown-it 未加载，已退回为纯文本渲染：", src);
            })
            .catch(error => {
                console.error(error);
                element.innerHTML = `<span style='color: red;'>加载 Markdown 文件失败: ${src}</span>`;
            });

        tasks.push(task);
    });

    return Promise.all(tasks);
}

window.renderMarkdown = renderMarkdown;
