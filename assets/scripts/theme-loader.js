/* global config */

var themePath;
var metaData;

// 配色方案切换加载动画的最短显示时间
const minimumColorSwitchTime = 650;
const colorSwitchSleepTime = 310;

class ThemeManager {
    constructor() {
        this.parse();
    }

    // 解析主题
    parse() {
        // 构建主题目录
        const basePath = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
        themePath = basePath + "/assets/themes/" + config.content.theme.theme;

        console.log("%c[I]%c " + `Theme Path: ${themePath}`, "background-color: #00896c;", "");

        // 使用 XML 获取主题的元数据
        try {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", themePath + "/theme.json", false); // 使用同步请求
            xhr.send();

            if (xhr.status >= 200 && xhr.status < 300) {
                metaData = JSON.parse(xhr.responseText);
            } else {
                throw new Error("无法获取主题元数据");
            }
        } catch (error) {
            console.error("%c[E]%c " + `获取主题元数据失败: ${error}`, "background-color: #cb1b45;", "");
            throw new Error("获取主题元数据失败，无法继续执行操作");
        }

        console.log("%c[I]%c " + `主题元数据: ${JSON.stringify(metaData)}`, "background-color: #00896c;", "");

        // 检查元数据是否合法
        if (metaData.id && metaData.name && metaData.version && metaData.files.styles && metaData.files.scripts && metaData.colors) {
            // 输出欢迎语
            console.group("%c主题解析成功！%c" + `${metaData.name} (${metaData.id})`, "padding: 5px; border-radius: 6px 0 0 6px; background-color: #00896c; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #986db2; color: #ffffff;");
            console.log("%cID:%c" + `${metaData.id}`, "padding: 5px; border-radius: 6px 0 0 6px; background-color: #986db2; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #b5495b; color: #ffffff;");
            console.log("%cName:%c" + `${metaData.name}`, "padding: 5px; border-radius: 6px 0 0 6px; background-color: #986db2; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #b5495b; color: #ffffff;");
            console.log("%cVersion:%c" + `${metaData.version}`, "padding: 5px; border-radius: 6px 0 0 6px; background-color: #986db2; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #b5495b; color: #ffffff;");
            console.log("%cRepo:%c" + `${metaData.repo}`, "padding: 5px; border-radius: 6px 0 0 6px; background-color: #010101; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #ff9901; color: #ffffff;");
            console.groupEnd();

            return metaData;
        } else {
            console.error("%c[E]%c " + `主题解析失败，元数据存在问题`, "background-color: #cb1b45;", "");
            throw new Error("主题解析失败，无法继续执行操作");
        }
    }

    // 加载主题
    load() {
        // 创建一个数组，用来存放生成的 Style 外部资源链接 HTML
        var styleLinks = []; // 初始化为空数组

        // 解析基本样式 URL 并赋值给数组
        styleLinks = metaData.files.styles
            .map(key => {
                if (key) {
                    return `<link rel="stylesheet" href="${themePath}/styles/${key}" />`;
                }
                console.error("%c[E]%c " + `主题 ${key} 样式 Tag 生成失败，元数据可能存在问题`, "background-color: #cb1b45;", "");
                throw new Error("主题样式 Tag 生成失败，无法继续执行操作");
            })
            .filter(Boolean);

        let resolvedTargetColor = localStorage.getItem("theme.color");
        if (resolvedTargetColor === "!autoSwitch") {
            console.log("%c[I]%c " + `当前配色方案为 !autoSwitch 自动切换，用户的浏览器深色模式启用状态为: ${window.matchMedia("(prefers-color-scheme: dark)").matches}`, "background-color: #00896c;", "");
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                resolvedTargetColor = config.content.theme.colors.autoSwitch.dark;
            } else {
                resolvedTargetColor = config.content.theme.colors.autoSwitch.light;
            }
        }
        // Fallback if resolvedTargetColor is null/undefined (e.g., initial load before default is set)
        if (!resolvedTargetColor) {
            resolvedTargetColor = config.content.theme.colors.default;
            if (resolvedTargetColor === "!autoSwitch") { // Re-resolve if default is autoSwitch
                if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    resolvedTargetColor = config.content.theme.colors.autoSwitch.dark;
                } else {
                    resolvedTargetColor = config.content.theme.colors.autoSwitch.light;
                }
            }
        }


        // 解析配色方案样式 URL 并插入数组
        metaData.colors.index
            .map(key => {
                const styles = metaData.colors.list[key]?.files?.styles;

                // 根据解析后的目标配色方案决定是否生成标签
                if (styles && resolvedTargetColor === key) {
                    return styles.map(file => `<link rel="stylesheet" href="${themePath}/colors/${key}/styles/${file}" />`).join("");
                } else {
                    console.log("%c[I]%c " + `跳过了生成 ${key} 配色方案样式标签的步骤，因为 key 的值不符合用户设置 (${resolvedTargetColor} != ${key})`, "background-color: #00896c;", "");
                    return; // 返回空，过滤器会移除
                }
            })
            .filter(Boolean)
            .forEach(linkTags => {
                styleLinks.push(linkTags);
            });

        console.log("%c[I]%c " + `待插入的 Style 外部资源链接: ${styleLinks.join("")}`, "background-color: #00896c;", "");

        // 创建一个数组，用来存放生成的 Script 外部资源链接 HTML
        var scriptLinks = []; // 初始化为空数组

        // 解析基本脚本 URL 并赋值给数组
        scriptLinks = metaData.files.scripts
            .map(key => {
                if (key) {
                    return `<script src="${themePath}/scripts/${key}"></script>`;
                }
                console.error("%c[E]%c " + `主题 ${key} 脚本 Tag 生成失败，元数据可能存在问题`, "background-color: #cb1b45;", "");
                throw new Error("主题脚本 Tag 生成失败，无法继续执行操作");
            })
            .filter(Boolean);

        // 解析配色方案脚本 URL 并插入数组
        metaData.colors.index
            .map(key => {
                const scripts = metaData.colors.list[key]?.files?.scripts;

                // 根据解析后的目标配色方案决定是否生成标签
                if (scripts && resolvedTargetColor === key) {
                    return scripts.map(file => `<script src="${themePath}/colors/${key}/scripts/${file}"></script>`).join("");
                } else {
                    console.log("%c[I]%c " + `跳过了生成 ${key} 配色方案脚本标签的步骤，因为 key 的值不符合用户设置 (${resolvedTargetColor} != ${key})`, "background-color: #00896c;", "");
                    return; // 返回空，过滤器会移除
                }
            })
            .filter(Boolean)
            .forEach(linkTags => {
                scriptLinks.push(linkTags);
            });

        console.log("%c[I]%c " + `待插入的 Script 外部资源链接: ${scriptLinks.join("")}`, "background-color: #00896c;", "");

        // 拼接 styleLinks 和 scriptLinks
        const resTag = [...styleLinks, ...scriptLinks];

        // 将生成的外部资源链接插入到 theme 元素中
        document.querySelector("theme").innerHTML = resTag.join("");

        console.log("%c[I]%c " + `准备执行 <theme> 中的所有 Script 脚本`, "background-color: #00896c;", "");

        // 执行 <theme> 中的所有 Script 脚本
        this.runScripts();
    }

    // 设置配色方案
    setColor(colorId) {
        // 先确保 local storage 中有值，如果还没有，就先设置
        if (localStorage.getItem("theme.color") === null) {
            localStorage.setItem("theme.color", colorId);
            // 首次设置后，直接加载，不进行动画
            themeManager.load();
            if (document.querySelector(".themes")) {
                loadThemeSelEff();
            }
            return;
        }

        if (colorId === localStorage.getItem("theme.color")) {
            console.warn("%c[W]%c " + `当前配色方案已是 ${colorId}，与其白白重载一次，不如我现在就中断更改`, "background-color: #e98b2a;", "");
            // 即使相同，也确保选中状态是正确的
            if (document.querySelector(".themes")) {
                loadThemeSelEff();
            }
            return;
        } else {
            // 隐藏滚动条
            document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
            document.body.style.overflow = "hidden";

            // 开始播放加载动画
            document.getElementById("theme-color-loader-iframe").className = "start";

            // 加载配色方案
            setTimeout(() => {
                if (metaData.colors.index.includes(colorId) || colorId === "!autoSwitch") {
                    try {
                        localStorage.setItem("theme.color", colorId);
                        themeManager.load();
                        console.log("%c[I]%c " + `配色方案已更改为: ${colorId}`, "background-color: #00896c;", "");
                    } catch (error) {
                        console.error("%c[E]%c " + `无法将配色方案更改为 ${colorId}: ${error}`, "background-color: #cb1b45;", "");
                        // 动画结束后也要恢复滚动条
                        document.getElementById("theme-color-loader-iframe").className = "end";
                        document.body.style.paddingRight = "unset";
                        document.body.style.overflow = "unset";
                        throw new Error("配色方案更改失败: ", error);
                    }
                } else {
                    console.error("%c[E]%c " + `无法将配色方案更改为 ${colorId}，因为未在主题配色方案索引中匹配到传入的值`, "background-color: #cb1b45;", "");
                    // 动画结束后也要恢复滚动条
                    document.getElementById("theme-color-loader-iframe").className = "end";
                    document.body.style.paddingRight = "unset";
                    document.body.style.overflow = "unset";
                    throw new Error("配色方案更改失败，未在主题配色方案索引中匹配到传入的值");
                }

            }, colorSwitchSleepTime);

            // 结束播放加载动画
            (() => {
                setTimeout(() => {
                    document.getElementById("theme-color-loader-iframe").className = "end";
                    document.body.style.paddingRight = "unset";
                    document.body.style.overflow = "unset";
                    if (document.querySelector(".themes")) {
                        loadThemeSelEff();
                    }
                }, minimumColorSwitchTime);
            })();
        }
    }

    runScripts() {
        document.querySelectorAll("theme > script").forEach(script => {
            const src = script.src;
            if (src) {
                script.remove();
                const newScript = document.createElement("script");
                newScript.src = src;
                document.head.appendChild(newScript);
            }
        });
    }
}

// 加载配色方案设置的选中效果
function loadThemeSelEff() {
    const currentColor = localStorage.getItem("theme.color");
    if (!currentColor) {
        console.warn("%c[W]%c " + `localStorage 中没有 theme.color，无法设置选中效果。`, "background-color: #e98b2a;", "");
        return;
    }

    const currentEnableElement = document.querySelector(".theme-item.enable");
    if (currentEnableElement) {
        currentEnableElement.setAttribute("class", "theme-item");
    }

    // 处理 !autoSwitch 的显示逻辑
    let actualSelectedColorId = currentColor;
    if (currentColor === "!autoSwitch") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            actualSelectedColorId = config.content.theme.colors.autoSwitch.dark;
        } else {
            actualSelectedColorId = config.content.theme.colors.autoSwitch.light;
        }
    }

    // 尝试选中实际的 theme-item-xxx 按钮
    let targetElement = document.getElementById(`theme-item-${currentColor}`); // 仍然尝试选中原始的 localStorage 值（如 !autoSwitch）

    // 如果原始ID的按钮不存在，或者原始ID是!autoSwitch但用户想看实际亮暗模式的选中，可以添加一个额外的逻辑
    // 例如，如果 !autoSwitch 按钮存在，就选中 !autoSwitch。如果不存在，但 light/dark 按钮存在，且是当前解析出的模式，则选中 light/dark。
    if (!targetElement && actualSelectedColorId !== currentColor) {
        targetElement = document.getElementById(`theme-item-${actualSelectedColorId}`);
    }


    if (targetElement) {
        targetElement.setAttribute("class", "theme-item enable");
    } else {
        console.warn("%c[W]%c " + `未找到 ID 为 theme-item-${currentColor} 的主题设置按钮，也未找到 theme-item-${actualSelectedColorId} 按钮，无法设置选中效果。`, "background-color: #e98b2a;", "");
    }
}


// 创建 ThemeManager 实例
const themeManager = new ThemeManager();

document.addEventListener("DOMContentLoaded", () => {
    // 首先生成并插入主题按钮，确保它们在 DOM 中
    const themesElement = document.querySelector(".primary-container > .left-area > .cards > .card-item > .content > .settings-item > .themes");
    if (!themesElement) {
        console.error("%c[E]%c " + `未找到 .themes 元素，无法生成主题设置按钮。`, "background-color: #cb1b45;", "");
        return;
    }

    // 创建一个数组，用来存放生成的按钮 HTML
    const themeButtons = config.content.theme.colors.enable
        .map(key => {
            let displayName;
            let icon;
            let color;
            let background;

            if (key === "!autoSwitch") {
                console.log("%c[I]%c " + `Website config enabled !autoSwitch`, "background-color: #00896c;", "");
                displayName = config.content.theme.colors.autoSwitch.displayName;
                icon = config.content.theme.colors.autoSwitch.icon.icon;
                color = config.content.theme.colors.autoSwitch.icon.color;
                background = config.content.theme.colors.autoSwitch.icon.background;
            } else {
                const colorConfig = metaData.colors.list[key];
                if (colorConfig) {
                    displayName = colorConfig.displayName;
                    icon = colorConfig.icon.icon;
                    color = colorConfig.icon.color;
                    background = colorConfig.icon.background;
                } else {
                    console.error("%c[E]%c " + `配色方案 ${key} 在主题元数据中未找到。请检查 config.content.theme.colors.enable 和 theme.json 的一致性。`, "background-color: #cb1b45;", "");
                    return "";
                }
            }

            if (displayName && icon && color && background) {
                // 修正：将 @click 替换为 onclick
                return `
                <div class="theme-item" id="theme-item-${key}" style="color: ${color}; background: ${background};" onclick="themeManager.setColor(\`${key}\`);">
                    <i class="${icon}"></i>
                    <span>${displayName}</span>
                </div>
            `;
            } else {
                console.error("%c[E]%c " + `配色方案 ${key} 的设置按钮生成失败，主题元数据的配色方案信息 (${displayName}, ${icon}, ${color}, ${background}) 不满足条件，元数据可能存在问题`, "background-color: #cb1b45;", "");
            }
            return "";
        })
        .filter(Boolean);

    // 将生成的按钮插入到 .themes 元素中
    themesElement.innerHTML = themeButtons.join("");

    // 接下来，处理主题的加载逻辑
    if (localStorage.getItem("theme.color") === null) {
        // 如果第一次访问，将配色方案设置为默认值
        // 调用 setColor 会触发 load() 和动画，并在动画结束后调用 loadThemeSelEff
        themeManager.setColor(config.content.theme.colors.default);
    } else {
        // 否则正常加载主题
        themeManager.load();
        // 因为主题已经加载，所以直接设置选中效果
        loadThemeSelEff();
    }
});