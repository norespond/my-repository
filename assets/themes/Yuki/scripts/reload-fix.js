(function () {
    console.log("%c[I]%c " + `Yuki theme reload-fix.js loaded`, "background-color: #00896c;", "");

    var hasPreviousReloadFix = typeof window.reloadFix !== "undefined";

    if (!window.reloadFix) {
        window.reloadFix = {
            eventListeners: [{ elementPath: "element.pageHead", event: "click", handlerPath: "eventListener.pageHead.click" }],
        };
    }

    if (hasPreviousReloadFix) {
        window.reloadFix.eventListeners.forEach(({ elementPath, event, handlerPath }) => {
            function getObjectByPath(path) {
                return path.split(".").reduce((obj, key) => obj?.[key], window);
            }

            var element = getObjectByPath(elementPath);
            var eventHandler = getObjectByPath(handlerPath);

            if (!element || !eventHandler) {
                return;
            }

            element.removeEventListener(event, eventHandler);
            console.log("%c[I]%c " + `Removed listener: ${elementPath} -> ${event}`, "background-color: #00896c;", "");
        });

        window.reloadFix.eventListeners = [{ elementPath: "element.pageHead", event: "click", handlerPath: "eventListener.pageHead.click" }];
    }

    window.reloadFlag = true;
})();
