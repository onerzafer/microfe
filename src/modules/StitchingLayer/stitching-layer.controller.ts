import { Controller, Get, Header, HttpException, HttpStatus, Options, Param } from '@nestjs/common';
import { StitchingLayerService } from './stitching-layer.service';
import { MicroAppServerStoreService } from '../MicroAppServerStore/micro-app-server-store.service';

@Controller()
export class StitchingLayerController {
    constructor(
        private readonly stitchingLayerService: StitchingLayerService,
        private readonly microAppServerStoreService: MicroAppServerStoreService
    ) {}

    @Options('*')
    @Header('Access-Control-Allow-Headers', '*')
    @Header('Access-Control-Allow-Origin', 'http://localhost:9000')
    @Header('Access-Control-Allow-Credentials', 'true')
    @Header('Access-Control-Allow-Methods', 'OPTIONS')
    getAppOptions(@Param('microAppName') microAppName: string): string {
        return 'true';
    }

    @Get('*')
    @Header('Access-Control-Allow-Origin', 'http://localhost:9000')
    @Header('Access-Control-Allow-Credentials', 'true')
    @Header('Access-Control-Allow-Methods', 'GET')
    @Header('content-type', 'text/html; charset=utf-8')
    @Header('Cache-Control', 'none')
    async getApp(@Param() params: any): Promise<string> {
        // resolve micro app name if no app available return 404
        const appName = this.microAppServerStoreService.mapRouteToMicroAppName(params['*']);
        if (!appName) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        // get dependency list
        const microAppListToFetch = this.microAppServerStoreService.getDependencyList(appName);
        // fetch all fragments
        const fragments = await Promise.all(
            microAppListToFetch.map(microApp => this.stitchingLayerService.fetchFragment(microApp))
        );
        const fragmentsWithAbsolutePaths = fragments.map(fragment => {
            return this.stitchingLayerService.fixRelativePaths(fragment);
        });
        // concat fragments as html
        const concatenatedFragments = await this.stitchingLayerService.concatFragments(fragmentsWithAbsolutePaths);
        // inject microfe scripts into html (maybe an amd loader can do the trick)
        return this.stitchingLayerService.injectClientScripts(concatenatedFragments);
    }
}
