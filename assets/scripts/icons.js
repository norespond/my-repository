(function () {
    const ICONS = {
        "bullhorn": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 13.5V10l11-4v11l-11-3.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 7.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M14 5.5c3.6 0 6.5 2.9 6.5 6.5s-2.9 6.5-6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".35"/></svg>`,
        "scroll": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4h9a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8.5A2.5 2.5 0 0 1 6 15.5V6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 8h7M8 11h5M8 14h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M6 16.5c-1.1 0-2-.9-2-2s.9-2 2-2v4Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
        "sliders": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 5v6M6 13v6M12 5v4M12 11v8M18 5v8M18 15v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="6" cy="11" r="1.9" fill="currentColor"/><circle cx="12" cy="9" r="1.9" fill="currentColor"/><circle cx="18" cy="13" r="1.9" fill="currentColor"/></svg>`,
        "shirt": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5 12 3l4 2.5 3 1.5-2 4-1.5-1V20H8.5V10l-1.5 1-2-4 3-1.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
        "sun": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v3.2M12 18v3.2M2.8 12H6M18 12h3.2M5.4 5.4l2.3 2.3M16.3 16.3l2.3 2.3M18.6 5.4l-2.3 2.3M7.7 16.3l-2.3 2.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
        "moon": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15.7 3.8A8.7 8.7 0 1 0 20.2 16a7 7 0 0 1-4.5 1.6 7.9 7.9 0 0 1 0-13.8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
        "ellipsis": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18" cy="12" r="1.7" fill="currentColor"/></svg>`,
        "heart": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.2 4.8 13c-1.9-1.9-1.9-5 0-6.9 1.9-1.9 5-1.9 6.9 0L12 7.4l.3-.3c1.9-1.9 5-1.9 6.9 0 1.9 1.9 1.9 5 0 6.9L12 20.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
        "shield": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.8 19 6.2v5.3c0 4.2-2.7 7.8-7 8.8-4.3-1-7-4.6-7-8.8V6.2L12 3.8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 7v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.8" r="1.1" fill="currentColor"/></svg>`,
        "envelope": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m5.5 8.5 6.5 5 6.5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        "magnifying-glass": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="5.8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15.5 15.5 4.8 4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
        "xmark": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
        "circle-half-stroke": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 4v16a8 8 0 0 1 0-16Z" fill="currentColor" opacity=".55"/></svg>`,
        "images": `<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="5" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m7 14 3.2-3.2 2.8 2.8 2.3-2.3 4 4.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="9" r="1.2" fill="currentColor"/></svg>`,
        "bilibili": `<span class="icon-inline icon-text" aria-hidden="true">B</span>`,
        "github": `<span class="icon-inline icon-text" aria-hidden="true">GH</span>`,
    };

    const IGNORE = new Set(["fa", "fa-solid", "fa-regular", "fa-brands", "fa-light", "fa-thin", "fa-duotone"]);

    function normalizeIconKey(input) {
        if (!input) return "";
        const value = String(input).trim();
        const matches = value.match(/fa-([a-z0-9-]+)/gi) || [];
        const cleaned = matches
            .map(token => token.replace(/^fa-/, ""))
            .filter(token => !IGNORE.has(`fa-${token}`) && !IGNORE.has(token));
        if (cleaned.length > 0) {
            return cleaned[cleaned.length - 1];
        }
        return value.replace(/^fa-/, "");
    }

    function renderIconMarkup(input) {
        const key = normalizeIconKey(input);
        return ICONS[key] || `<span class="icon-inline icon-text" aria-hidden="true">•</span>`;
    }

    function hydrateIcons(root) {
        const scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll("i[class*='fa-']").forEach(node => {
            const replacement = document.createElement("span");
            replacement.innerHTML = renderIconMarkup(node.className);
            const icon = replacement.firstElementChild;
            if (icon) {
                node.replaceWith(icon);
            }
        });
    }

    window.renderIconMarkup = renderIconMarkup;
    window.hydrateIcons = hydrateIcons;
})();
