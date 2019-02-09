import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { MicroAppServerStoreService } from '../MicroAppServerStore/micro-app-server-store.service';
import { MicroAppGraphItem, MicroAppFragment } from 'src/interfaces/miro-app.interface';
import { RequestPayload } from 'src/interfaces/proxy.interface';
import { AxiosResponse } from 'axios';
import { map } from 'rxjs/operators';
import * as parse5 from 'parse5';
import { MicroAppFragmentTransformed } from '../../interfaces/miro-app.interface';
import { hasAttr, searchExec, isTag, or, and, get } from '../../utilities/html-tree.utility';
import { isLocalURL } from '../../utilities/url.utils';

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

    concatFragments(fragments: MicroAppFragment[]): string {
        return fragments.map(frag => frag.fragment).join('');
    }

    injectClientScripts(concatenatedFragments: string): string {
        return `<script>console.log('client script')</script>${concatenatedFragments}`;
    }

    fixRelativePaths(microAppFragment: MicroAppFragmentTransformed): MicroAppFragmentTransformed {
        return {
            ...microAppFragment,
            fragment: searchExec(
                microAppFragment.fragment,
                or(
                    and(isTag('script'), hasAttr('src'), n => isLocalURL(get(n).attr('src'))),
                    and(isTag('link'), hasAttr('href'), n => isLocalURL(get(n).attr('href')))
                ),
                n => {
                    switch (n.tagName) {
                        case 'script':
                            {
                                const val = `${microAppFragment.accessUri}${get(n).attr('src')}`;
                                get(n).attr('src', val);
                            }
                            break;
                        case 'link':
                            {
                                const val = `${microAppFragment.accessUri}${get(n).attr('href')}`;
                                get(n).attr('href', val);
                            }
                            break;
                    }
                    return n;
                }
            ),
        };
    }

    transformFragment(microAppFragment: MicroAppFragment): MicroAppFragmentTransformed {
        return {
            ...microAppFragment,
            fragment: microAppFragment.isRoot
                ? parse5.parse(microAppFragment.fragment)
                : parse5.parseFragment(microAppFragment.fragment),
        };
    }

    serializeFragment(microAppFragment: MicroAppFragmentTransformed): MicroAppFragment {
        return {
            ...microAppFragment,
            fragment: parse5.serialize(microAppFragment.fragment),
        };
    }
}
