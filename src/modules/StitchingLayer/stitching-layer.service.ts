import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { MicroAppServerStoreService } from '../MicroAppServerStore/micro-app-server-store.service';
import { MicroAppGraphItem, MicroAppFragment } from 'src/interfaces/miro-app.interface';
import { RequestPayload } from 'src/interfaces/proxy.interface';
import { AxiosResponse } from 'axios';
import { map } from 'rxjs/operators';
import { MicroAppFragmentTransformed } from '../../interfaces/miro-app.interface';
import { isLocalURL } from '../../utilities/url.utils';
import { JSDOM } from 'jsdom';
import * as uniqid from 'uniqid';

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
                headers: { ...requestPayload.headers },
            })
            .pipe(
                map((resposne: AxiosResponse) => ({
                    ...microApp,
                    fragment: resposne.data,
                }))
            )
            .toPromise();
    }

    concatFragments(fragments: MicroAppFragmentTransformed[]): JSDOM {
        if (fragments && fragments.length) {
            const rootFragment = fragments.find(fragment => fragment.isRoot).fragment;
            const fragmentReferencesInRoot = rootFragment.window.document.getElementsByTagName('fragment');
            console.log('# of detected fragment:', fragmentReferencesInRoot.length);
            for (let frag of fragmentReferencesInRoot) {
                const appName = frag.attributes.getNamedItem('name').value;
                console.log('APPNAME: ', appName);
                const app = fragments.find(fragment => fragment.appName === appName);
                if (app) {
                    const wrapper = rootFragment.window.document.createElement('div');
                    wrapper.id = uniqid(app.appName + '-');
                    wrapper.innerHTML = app.fragment.window.document.getElementsByTagName('body')[0].innerHTML;
                    frag.appendChild(wrapper);
                }
            }
            return rootFragment;
        } else {
            return new JSDOM('SOMETHING WRONG');
        }
    }

    injectClientScripts(parsedFragments: JSDOM): JSDOM {
        return parsedFragments;
    }

    fixRelativePaths(microAppFragment: MicroAppFragmentTransformed): MicroAppFragmentTransformed {
        const scriptTags = microAppFragment.fragment.window.document.getElementsByTagName('script');
        const linkTags = microAppFragment.fragment.window.document.getElementsByTagName('link');
        const imgTags = microAppFragment.fragment.window.document.getElementsByTagName('img');
        this.setLocalLinkFor(scriptTags, 'src', microAppFragment.accessUri);
        this.setLocalLinkFor(linkTags, 'href', microAppFragment.accessUri);
        this.setLocalLinkFor(imgTags, 'src', microAppFragment.accessUri);
        // TODO: fix urls in html
        return {
            ...microAppFragment
        };
    }

    private setLocalLinkFor(elementList: HTMLCollection, attrName: string, accessUri: string) {
        for (let element of elementList) {
            const srcValue = element.hasAttribute(attrName) && element.attributes.getNamedItem(attrName).value;
            if (srcValue && isLocalURL(srcValue)) {
                element.setAttribute(attrName, [accessUri, ...srcValue.split('/').filter(s => s && s !== '')].join('/'));
            }
        }
    }

    transformFragment(microAppFragment: MicroAppFragment): MicroAppFragmentTransformed {
        return {
            ...microAppFragment,
            fragment: new JSDOM(microAppFragment.fragment) as JSDOM,
        };
    }
}
