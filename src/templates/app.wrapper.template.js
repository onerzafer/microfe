(function(WINDOW, DOCUMENT) {
    window = undefined;
    if (WINDOW && WINDOW.AppsManager && WINDOW.AppsManager.register) {
        WINDOW.AppsManager.register({
            name: '__name__',
            deps: [__dependencies__],
            noneBlockingDeps: [__nonBlockingDependencies__],
            initialize: microAppArgs => {
                const styleLinks = [__styleLinks__];
                class __name__ extends HTMLElement {
                    constructor() {
                        super();
                        const shadow = this.attachShadow({ mode: 'open' });

                        if (styleLinks && styleLinks.length) {
                            styleLinks.forEach(link => {
                                const style = DOCUMENT.createElement('link');
                                style.type = 'text/css';
                                style.rel = 'stylesheet';
                                style.href = link;
                                shadow.appendChild(style);
                            });
                        }

                        const root = DOCUMENT.createElement('app-root');
                        root.id = '__container_id__';
                        shadow.appendChild(root);
                    }

                    connectedCallback() {
                        if (window.webpackJsonp____name__ && window.webpackJsonp____name__.length) {
                            delete window.webpackJsonp____name__;
                        }
                        const MICROAPP_CONTAINER = this.shadowRoot.getElementById('__container_id__');
                        const SHADOWROOT = this.shadowRoot;
                        microAppArgs['container'] = MICROAPP_CONTAINER;
                        microAppArgs['microAppId'] = '__container_id__';
                        __appContentAsText__;
                    }
                }
                customElements.define('__kebab-name__', __name__);
            },
        });
    }
})(window, document);
