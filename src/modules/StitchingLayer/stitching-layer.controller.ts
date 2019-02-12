import { Controller, Get, Header, HttpException, HttpStatus, Param, Req } from '@nestjs/common';
import { StitchingLayerService } from './stitching-layer.service';
import { MicroAppServerStoreService } from '../MicroAppServerStore/micro-app-server-store.service';
import { Request } from 'express';
import { requestToParams } from '../../utilities/micro-app-maping.utils';

@Controller()
export class StitchingLayerController {
    constructor(
        private readonly stitchingLayerService: StitchingLayerService,
        private readonly microAppServerStoreService: MicroAppServerStoreService
    ) {}

    @Get('*')
    @Header('Access-Control-Allow-Credentials', 'true')
    @Header('Access-Control-Allow-Methods', 'GET')
    @Header('content-type', 'text/html; charset=utf-8')
    @Header('Cache-Control', 'none')
    async getApp(@Param() params: any, @Req() request: Request): Promise<string> {
        // resolve micro app name if no app available return 404
        const appName = this.microAppServerStoreService.mapRouteToMicroAppName(params['*']);
        if (!appName) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        // get dependency list
        const microAppListToFetch = this.microAppServerStoreService.getDependencyList(appName, true);
        // fetch all fragments
        const requestPayload = requestToParams(request);
        const fragments = await Promise.all(
            microAppListToFetch.map(microApp => this.stitchingLayerService.fetchFragment(microApp, requestPayload))
        );
        const fragmentsWithAbsolutePaths = fragments
        .map(fragment => StitchingLayerService.transformFragment(fragment))
        .map(fragment => StitchingLayerService.fixRelativePaths(fragment));
        // concat fragments as json object and after this point meta data of each fragment is not required
        const concatenatedFragments = this.stitchingLayerService.concatFragments(fragmentsWithAbsolutePaths);
        // inject microfe client scripts into html (maybe an amd loader can do the trick)
        const fragmentsWithClientScript = await this.stitchingLayerService.injectClientScripts(concatenatedFragments);
        // serialize the object back to html
        return fragmentsWithClientScript.serialize();
    }
}
