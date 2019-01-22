(function(WINDOW, DOCUMENT) {
    window = undefined;
    if (WINDOW && WINDOW.AppsManager && WINDOW.AppsManager.register) {
        WINDOW.AppsManager.register({
            name: '__name__',
            deps: [__dependencies__],
            initialize: (microAppArgs) => {
                __global-inject__
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
                    }
                }
                customElements.define('__kebab-name__', __name__);
                __appContentAsText__;
            },
        });
    }
})(window, document);
