(function(window, document) {
    if (window && window.AppsManager && window.AppsManager.register) {
        window.AppsManager.register({
            name: '__name__',
            deps: [__dependencies__],
            noneBlockingDeps: [__nonBlockingDependencies__],
            initialize: microAppArgs => {
                class __name__ extends HTMLElement {
                    constructor() {
                        super();
                        this.attachShadow({ mode: 'open' });
                        const template = document.createElement('template');
                        template.id = 'template___container_id__';
                        template.innerHTML = `__htmlTemplate__`;
                        this.shadowRoot.appendChild(template.content.cloneNode(true));
                    }

                    connectedCallback() {
                        if (window.webpackJsonp____name__ && window.webpackJsonp____name__.length) {
                            delete window.webpackJsonp____name__;
                        }
                        const MICROAPP_CONTAINER = this.shadowRoot.getElementById('__container_id__');
                        const DOCUMENT = this.shadowRoot;
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
