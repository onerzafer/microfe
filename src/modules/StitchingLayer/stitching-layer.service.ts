import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { MicroAppGraphItem, MicroAppFragment } from 'src/interfaces/miro-app.interface';
import { RequestPayload } from 'src/interfaces/proxy.interface';
import { AxiosResponse } from 'axios';
import { map } from 'rxjs/operators';
import { MicroAppFragmentTransformed } from '../../interfaces/miro-app.interface';
import { setLocalLinkFor } from '../../utilities/url.utils';
import { JSDOM } from 'jsdom';
import * as uniqid from 'uniqid';
import * as fs from 'fs';
import { join } from 'path';
import { getRootFragment, moveTagFromFragmentHeadToFragment } from '../../utilities/dom.utils';
import { mapMicroAppToMicroAppFragment } from '../../utilities/micro-app-maping.utils';

@Injectable()
export class StitchingLayerService {
    constructor(private readonly config: ConfigService, private readonly http: HttpService) {}

    fetchFragment(microApp: MicroAppGraphItem, requestPayload: RequestPayload): Promise<MicroAppFragment> {
        return this.http
            .get(microApp.accessUri + '/index.html', {
                params: { ...requestPayload.queries },
                headers: { ...requestPayload.headers },
            })
            .pipe(map(mapMicroAppToMicroAppFragment(microApp)))
            .toPromise();
    }

    concatFragments(fragments: MicroAppFragmentTransformed[]): JSDOM {
        if (fragments && fragments.length) {
            const rootFragment = getRootFragment(fragments);
            const childFragmentList = Array.from(rootFragment.window.document.getElementsByTagName('fragment'));

            childFragmentList.forEach(frag => this.injectFragmentIntoRoot(frag, fragments, rootFragment));

            return rootFragment;
        } else {
            return new JSDOM('SOMETHING WRONG');
        }
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

            moveTagFromFragmentHeadToFragment(wrapper, appDoc, 'link');
            moveTagFromFragmentHeadToFragment(wrapper, appDoc, 'script');

            wrapper.append(...app.fragment.window.document.getElementsByTagName('body')[0].childNodes);

            frag.parentNode.replaceChild(wrapper, frag);
        }
        return frag;
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
                            ${data}
                        </script>
                    `);
                    parsedFragments.window.document.getElementsByTagName('head')[0].appendChild(clientScripts);
                    resolve(parsedFragments);
                }
            });
        });
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
}
