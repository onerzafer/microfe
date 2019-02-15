(function(require, define) {
    define('MicroAppDeclarations', function() {
        const declarations = __MicroAppDeclarations__;
        return {
            getDeclaration: () => declarations,
        };
    });
    define('MicroFeLink', ['MicroFeRouter'], function(MicroFeRouter) {
        class MicroFeLink extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
                this.onclick = this.handleClick.bind(this);
                this.shadowRoot.appendChild(document.createElement('slot'));
                this.syncUiStateRoute();
                MicroFeRouter.onChange(this.syncUiStateRoute.bind(this));
            }

            get href() {
                return this.getAttribute('href');
            }

            set href(newValue) {
                this._href = newValue;
                this.setAttribute('href', newValue);
                this.syncUiStateRoute();
            }

            static get observedAttributes() {
                return ['href'];
            }

            attributeChangedCallback(name, oldValue, newValue) {
                switch (name) {
                    case 'href':
                        this._href = newValue;
                        this.syncUiStateRoute();
                        break;
                }
            }

            handleClick() {
                MicroFeRouter.navigate(this._href);
            }

            syncUiStateRoute() {
                const isActive = MicroFeRouter.isActive(this._href);
                if (isActive) {
                    this.classList.add('active');
                } else {
                    this.classList.remove('active');
                }
            }
        }

        if (!window.customElements.get('microfe-link')) {
            window.MicroFeLink = MicroFeLink;
            window.customElements.define('microfe-link', MicroFeLink);
        }
    });
    define('MicroFeRouter', ['require', 'MicroAppDeclarations'], function(require, MicroAppDeclarations) {
        const microAppServerList = MicroAppDeclarations.getDeclaration();
        const Utils = {
            wildcardToRegExp: (wildcardTerm, regexpFlag = 'g') =>
                new RegExp(
                    '^/?' +
                        wildcardTerm
                            .split('/*')
                            .map(s => Utils.escapeRegExp(s))
                            .join('/?.*') +
                        '$',
                    regexpFlag
                ),
            routeToRegExp: (wildcardTerm, regexpFlag = 'g') =>
                new RegExp(
                    '^/?' +
                        Utils.escapeRegExp(
                            wildcardTerm
                                .split('/')
                                .filter(s => s && s !== '')
                                .join('/')
                        ) +
                        '/?$',
                    regexpFlag
                ),
            escapeRegExp: str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'),
        };

        const onChangeCallbacks = [];
        let oldResolvedRoute;
        const changed = newRoute => {
            onChangeCallbacks.forEach(fn => {
                fn.call(undefined, newRoute, oldResolvedRoute);
            });
            oldResolvedRoute = newRoute;
        };

        const resolve = route => {
            return Object.keys(microAppServerList)
                .map(name => ({ ...microAppServerList[name] }))
                .filter(microApp => microApp.type === 'page')
                .find(declaration =>
                    declaration.route.includes('*')
                        ? Utils.wildcardToRegExp(declaration.route).test(route)
                        : Utils.routeToRegExp(declaration.route).test(route)
                );
        };
        const navigate = (route, isSilent) => {
            const resolvedRoute = resolve(route);
            if (resolvedRoute) {
                if (!isSilent) {
                    window.history.pushState(undefined, undefined, route);
                }
                changed(resolvedRoute);
            } else if (!isSilent) {
                window.location.href = route;
            }
        };

        window.onpopstate = () => {
            navigate(window.location.pathname);
        };

        navigate(window.location.pathname, true);

        return {
            isActive: route => {
                return route === '/'
                    ? route === window.location.pathname
                    : route &&
                          new RegExp(
                              `^\/?${route
                                  .split('/')
                                  .filter(s => s && s !== '')
                                  .join('/')}.*`,
                              'g'
                          ).test(window.location.pathname);
            },
            onChange: fn => {
                onChangeCallbacks.push(fn);
            },
            navigate,
        };
    });
    define('MicroFeRouterOutlet', ['MicroFeRouter'], function(MicroFeRouter) {
        let instances = 0;
        let elemRef = undefined;
        class MicroFeRouterOutlet extends HTMLElement {
            constructor() {
                super();
            }

            connectedCallback() {
                instances++;
                if (instances > 1) {
                    this.parentElement.removeChild(this);
                    throw 'More than one microfe-router-outlet is not allowed';
                } else {
                    elemRef = this;
                }
            }

            disconnectedCallback() {
                instances--;
                if (instance < 0) {
                    instances = 0;
                }
                elemRef = undefined;
            }
        }
        if (!window.customElements.get('microfe-router-outlet')) {
            window.MicroFeRouterOutlet = MicroFeRouterOutlet;
            window.customElements.define('microfe-router-outlet', MicroFeRouterOutlet);
        }
        MicroFeRouter.onChange(microApp => {
            if (elemRef && microApp.type === 'page') {
                // TODO: load the app html fragment, js, css files
                //  add css files to header if they are not loaded already
                //  add js files above all other scripts under body if they are not loaded already
                //  inject the fragment inside the elemRef
                elemRef.innerHTML = microApp.appName;
            }
        });
    });
    require(['MicroAppDeclarations', 'MicroFeLink', 'MicroFeRouterOutlet'], function(MicroAppDeclarations) {
        console.log('DEFAULT INIT', MicroAppDeclarations.getDeclaration());
    });
})(require, define);
