(function(WINDOW, DOCUMENT) {
    window = undefined;
    if (WINDOW && WINDOW.AppsManager && WINDOW.AppsManager.register) {
        WINDOW.AppsManager.register({
            name: '__name__',
            deps: [__dependencies__],
            initialize: (microAppArgs) => {
                __global-inject__
                return __appContentAsText__
            }
        });
    }
})(window, document);
