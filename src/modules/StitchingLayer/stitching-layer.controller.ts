import { Controller, Get, Header, HttpException, HttpStatus, Options, Param, Req } from '@nestjs/common';
import { StitchingLayerService } from './stitching-layer.service';
import { MicroAppServerStoreService } from '../MicroAppServerStore/micro-app-server-store.service';
import { Request } from 'express';
import { requestToParams } from 'src/utilities/request-data-maping.utils';

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
        const microAppListToFetch = this.microAppServerStoreService.getDependencyList(appName);
        // fetch all fragments
        const requestPayload = requestToParams(request);
        const fragments = await Promise.all(
            microAppListToFetch.map(microApp => this.stitchingLayerService.fetchFragment(microApp, requestPayload))
        );
        const fragmentsWithAbsolutePaths = fragments
        .map(fragment => this.stitchingLayerService.transformFragment(fragment))
        .map(fragment => this.stitchingLayerService.fixRelativePaths(fragment))
        .map(fragment => this.stitchingLayerService.serializeFragment(fragment));
        // concat fragments as html
        const concatenatedFragments = this.stitchingLayerService.concatFragments(fragmentsWithAbsolutePaths);
        // inject microfe scripts into html (maybe an amd loader can do the trick)
        return this.stitchingLayerService.injectClientScripts(concatenatedFragments);
    }
}
