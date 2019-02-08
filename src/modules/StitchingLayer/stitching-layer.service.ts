import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { MicroAppServerStoreService } from '../MicroAppServerStore/micro-app-server-store.service';

@Injectable()
export class StitchingLayerService {
    constructor(
        private readonly config: ConfigService,
        private readonly http: HttpService,
        private readonly microAppServerStoreService: MicroAppServerStoreService
    ) {}

    fetchFragment(microApp: {appName: string; accessUri: string; isRoot: boolean}): Promise<{appName: string; accessUri: string; isRoot: boolean; fragment: string}> {
        return Promise.resolve({...microApp, fragment: `<div>${microApp.appName}</div>`});
    }

    concatFragments(fragments: { appName: string; accessUri: string; isRoot: boolean; fragment: string }[]): Promise<string> {
        return Promise.resolve(fragments.map(frag => frag.fragment).join(''));
    }

    injectClientScripts(concatenatedFragments: string): string {
        return `<script>console.log('client script')</script>${concatenatedFragments}`;
    }

    fixRelativePaths(fragment: {appName: string; accessUri: string; isRoot: boolean; fragment: string}): {appName: string; accessUri: string; isRoot: boolean; fragment: string} {
        return fragment;
    }
}
