// 网站配置加载器。
// 这里负责读取 config.json，并把默认配置与外部配置合并。

function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}

function autoInitObject() {
    return new Proxy(
        {},
        {
            get(target, prop) {
                // 访问未定义深层属性时，自动补一个空对象，避免运行时报错。
                if (!(prop in target)) {
                    target[prop] = autoInitObject();
                }
                return target[prop];
            },
            set(target, prop, value) {
                target[prop] = value;
                return true;
            },
        }
    );
}

function deepMerge(target, source) {
    if (!isPlainObject(source) && !Array.isArray(source)) {
        return target;
    }

    const output = isPlainObject(target) || Array.isArray(target) ? target : {};
    Object.keys(source).forEach(key => {
        const value = source[key];
        if (isPlainObject(value)) {
            output[key] = deepMerge(output[key], value);
        } else if (Array.isArray(value)) {
            output[key] = value.slice();
        } else {
            output[key] = value;
        }
    });
    return output;
}

function validateWebsiteConfig(content) {
    const errors = [];
    const addError = message => errors.push(message);

    if (!isPlainObject(content)) {
        addError("config.content 必须是对象");
    } else {
        if (typeof content.title !== "string" || !content.title.trim()) {
            addError("缺少 title");
        }

        if (!isPlainObject(content.theme)) {
            addError("缺少 theme 对象");
        } else {
            if (typeof content.theme.theme !== "string" || !content.theme.theme.trim()) {
                addError("缺少 theme.theme");
            }
            if (typeof content.theme.displayName !== "string" || !content.theme.displayName.trim()) {
                addError("缺少 theme.displayName");
            }
            if (!isPlainObject(content.theme.colors)) {
                addError("缺少 theme.colors");
            }
        }

        if (!isPlainObject(content.masterInfo)) {
            addError("缺少 masterInfo 对象");
        } else {
            if (typeof content.masterInfo.name !== "string" || !content.masterInfo.name.trim()) {
                addError("缺少 masterInfo.name");
            }
            if (typeof content.masterInfo.avatar !== "string" || !content.masterInfo.avatar.trim()) {
                addError("缺少 masterInfo.avatar");
            }
            if (typeof content.masterInfo.website !== "string" || !content.masterInfo.website.trim()) {
                addError("缺少 masterInfo.website");
            }
            if (!isPlainObject(content.masterInfo.socialLink)) {
                addError("缺少 masterInfo.socialLink");
            } else {
                if (!Array.isArray(content.masterInfo.socialLink.enable)) {
                    addError("缺少 masterInfo.socialLink.enable");
                }
                if (!isPlainObject(content.masterInfo.socialLink.link)) {
                    addError("缺少 masterInfo.socialLink.link");
                }
                if (!isPlainObject(content.masterInfo.socialLink.icon)) {
                    addError("缺少 masterInfo.socialLink.icon");
                }
            }
        }

        if (!isPlainObject(content.pageHead) || !Array.isArray(content.pageHead.typedContent)) {
            addError("缺少 pageHead.typedContent");
        }

        if (!isPlainObject(content.icp) || !isPlainObject(content.icp.info)) {
            addError("缺少 icp.info");
        }
    }

    if (errors.length > 0) {
        console.warn("[config] 配置校验提示：", errors);
    }

    return errors.length === 0;
}

function getWebsiteConfig() {
    return {
        // 默认值使用递归代理，避免页面在配置未加载完成时直接报错。
        content: autoInitObject(),
        async init() {
            try {
                const res = await fetch("./config.json");
                if (!res.ok) throw new Error("无法获取网站配置文件");
                this.content = deepMerge(this.content, await res.json());
                validateWebsiteConfig(this.content);
            } catch (error) {
                console.error("无法获取网站配置文件:", error);
            }
        },
    };
}

const config = getWebsiteConfig();

// 如果 head 里已经注入了默认配置，这里把它合并进来，避免覆盖页面可用的占位值。
try {
    if (window.config && window.config.content) {
        const injected = window.config.content;
        Object.keys(injected).forEach(key => {
            try {
                config.content[key] = injected[key];
            } catch (error) {
                console.warn("合并预注入 config.content 时发生错误:", error);
            }
        });
    }
} catch (error) {
    console.warn("检查 window.config 时发生错误:", error);
}

window.config = config;
window.autoInitObject = autoInitObject;
window.deepMerge = deepMerge;
window.validateWebsiteConfig = validateWebsiteConfig;
window.getWebsiteConfig = getWebsiteConfig;
