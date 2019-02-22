import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { MicroAppGraphItem, MicroAppFragment } from 'src/interfaces/miro-app.interface';
import { RequestPayload } from 'src/interfaces/proxy.interface';
import { map } from 'rxjs/operators';
import { MicroAppFragmentTransformed } from '../../interfaces/miro-app.interface';
import { setLocalLinkFor } from '../../utilities/url.utils';
import { JSDOM } from 'jsdom';
import * as uniqid from 'uniqid';
import * as fs from 'fs';
import { join } from 'path';
import { getRootFragment, moveTagFromFragmentHeadTo } from '../../utilities/dom.utils';
import { mapMicroAppToMicroAppFragment, requestToParams } from '../../utilities/micro-app-maping.utils';
import { MicroAppServerStoreService } from '../MicroAppServerStore/micro-app-server-store.service';
import { Request } from 'express';

@Injectable()
export class StitchingLayerService {
    constructor(
        private readonly config: ConfigService,
        private readonly http: HttpService,
        private readonly microAppServerStoreService: MicroAppServerStoreService
    ) {}

    fetchFragment(microApp: MicroAppGraphItem, requestPayload: RequestPayload): Promise<MicroAppFragment> {
        return this.http
            .get(microApp.accessUri + '/index.html', {
                params: { ...requestPayload.queries },
                headers: { ...requestPayload.headers, 'server-side': true },
            })
            .pipe(map(mapMicroAppToMicroAppFragment(microApp)))
            .toPromise();
    }

    concatFragments(fragments: MicroAppFragmentTransformed[]): JSDOM {
        if (fragments && fragments.length) {
            const root = getRootFragment(fragments);
            const superFragment = this.getSuperFragment(fragments, root);
            let rootFragment = superFragment ? this.extend(superFragment.fragment, root.fragment) : root.fragment;
            const childFragmentList = Array.from(rootFragment.window.document.getElementsByTagName('fragment'));
            childFragmentList.forEach(frag => this.injectFragmentIntoRoot(frag, fragments, rootFragment));
            return rootFragment;
        } else {
            return new JSDOM('SOMETHING WRONG');
        }
    }

    private getSuperFragment(fragments: MicroAppFragmentTransformed[], root) {
        return fragments.find(f => root.extends && f.appName === root.extends && f.type === 'extendable');
    }

    private injectFragmentIntoRoot(frag, fragments: MicroAppFragmentTransformed[], rootFragment) {
        const appName = frag.attributes.getNamedItem('name').value;
        const rootDocument = rootFragment.window.document;
        let app = fragments.find(fragment => fragment.appName === appName);
        if (app) {
            app = { ...app, fragment: this.concatFragments([app]) };

            const wrapper = rootDocument.createElement(appName);
            const appDoc = app.fragment.window.document;

            wrapper.id = uniqid(app.appName + '-');

            moveTagFromFragmentHeadTo(wrapper, appDoc, 'link');
            moveTagFromFragmentHeadTo(wrapper, appDoc, 'script');

            wrapper.append(...app.fragment.window.document.getElementsByTagName('body')[0].childNodes);

            frag.parentNode.replaceChild(wrapper, frag);
        }
        return frag;
    }

    private extend(superFragment: JSDOM, fragment: JSDOM): JSDOM {
        const slots = Array.from(superFragment.window.document.getElementsByTagName('slot'));
        const overrides = Array.from(fragment.window.document.querySelectorAll('[slot]')).reduce(
            (indexed, current) => ({
                ...indexed,
                [current.attributes.getNamedItem('slot').value]: current,
            }),
            {}
        );
        slots.forEach(slot => {
            const slotName = slot.attributes.getNamedItem('name').value;
            if (overrides[slotName]) {
                slot.parentElement.replaceChild(overrides[slotName], slot);
            } else {
                slot.parentElement.removeChild(slot);
            }
        });
        moveTagFromFragmentHeadTo(
            superFragment.window.document.getElementsByTagName('head')[0],
            fragment.window.document,
            'link'
        );
        moveTagFromFragmentHeadTo(
            superFragment.window.document.getElementsByTagName('body')[0],
            fragment.window.document,
            'script'
        );
        return superFragment;
    }

    async injectClientScripts(parsedFragments: JSDOM): Promise<JSDOM> {
        return new Promise((resolve, reject) => {
            fs.readFile(join(__dirname, '../../templates/client-scripts.template.js'), 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    const clientScripts = JSDOM.fragment(`
                        <!-- AMD LOADER -->
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>
                        <!-- CLIENT SCRIPTS -->
                        <script>
                            ${this.composeClientScript(data)}
                        </script>
                    `);
                    parsedFragments.window.document.getElementsByTagName('head')[0].appendChild(clientScripts);
                    resolve(parsedFragments);
                }
            });
        });
    }

    composeClientScript(rawScript: string) {
        return rawScript.replace(
            /__MicroAppDeclarations__/g,
            JSON.stringify(this.microAppServerStoreService.getMicroAppDeclarations())
        );
    }

    static fixRelativePaths(microAppFragment: MicroAppFragmentTransformed): MicroAppFragmentTransformed {
        const scriptTags = microAppFragment.fragment.window.document.getElementsByTagName('script');
        const linkTags = microAppFragment.fragment.window.document.getElementsByTagName('link');
        const imgTags = microAppFragment.fragment.window.document.getElementsByTagName('img');
        setLocalLinkFor(scriptTags, 'src', microAppFragment.accessUri);
        setLocalLinkFor(linkTags, 'href', microAppFragment.accessUri);
        setLocalLinkFor(imgTags, 'src', microAppFragment.accessUri);
        // TODO: fix urls in html
        return {
            ...microAppFragment,
        };
    }

    static transformFragment(microAppFragment: MicroAppFragment): MicroAppFragmentTransformed {
        return {
            ...microAppFragment,
            fragment: new JSDOM(microAppFragment.fragment) as JSDOM,
        };
    }

    preFillRouterOutlet(routerOutletDelegate: JSDOM, rootFragment: JSDOM): JSDOM {
        const linksUnderHeader = Array.from(rootFragment.window.document.querySelectorAll('head link[href]'));
        const bodyContent = rootFragment.window.document.getElementsByTagName('body')[0];
        const routerOutletEl = routerOutletDelegate.window.document.getElementsByTagName('microfe-router-outlet')[0];
        const headEl = routerOutletDelegate.window.document.getElementsByTagName('head')[0];
        if (routerOutletEl) {
            linksUnderHeader.forEach(linkEl => {
                headEl.appendChild(linkEl);
            });
            if (bodyContent) {
                routerOutletEl.innerHTML = bodyContent.innerHTML;
            }
        }
        return routerOutletDelegate;
    }

    async parseMicroApp(microApp: MicroAppGraphItem, request: Request): Promise<JSDOM> {
        if (microApp) {
            // get dependency list
            const microAppListToFetch = this.microAppServerStoreService.getDependencyList(microApp.appName, true);
            // fetch all fragments
            const requestPayload = requestToParams(request);
            const fragments = await Promise.all(
                microAppListToFetch.map(microApp => this.fetchFragment(microApp, requestPayload))
            );
            const fragmentsWithAbsolutePaths = fragments
                .map(fragment => StitchingLayerService.transformFragment(fragment))
                .map(fragment => StitchingLayerService.fixRelativePaths(fragment));
            // concat fragments as json object and after this point meta data of each fragment is not required
            const concatenatedFragments = this.concatFragments(fragmentsWithAbsolutePaths);
            // inject microfe client scripts into html (maybe an amd loader can do the trick)
            if (microApp.type === 'navigable') {
                return concatenatedFragments;
            } else {
                return await this.injectClientScripts(concatenatedFragments);
            }
        } else {
            return Promise.reject(new JSDOM('Not Found'));
        }
    }
}
