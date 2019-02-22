import { Controller, Get, Header, HttpException, HttpStatus, Param, Req } from '@nestjs/common';
import { StitchingLayerService } from './stitching-layer.service';
import { MicroAppServerStoreService } from '../MicroAppServerStore/micro-app-server-store.service';
import { Request } from 'express';
import { JSDOM } from 'jsdom';

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
        const microAppGraphItem = this.microAppServerStoreService.get(appName);
        const routerDelegateGraphItem = this.microAppServerStoreService.getRouterOutlet();
        let microAppParsed: JSDOM = await this.stitchingLayerService.parseMicroApp(microAppGraphItem, request);
        if (routerDelegateGraphItem && microAppGraphItem.type === 'navigable') {
            const routerDelegateParsed: JSDOM = await this.stitchingLayerService.parseMicroApp(
                routerDelegateGraphItem,
                request
            );
            microAppParsed = this.stitchingLayerService.preFillRouterOutlet(routerDelegateParsed, microAppParsed);
        }
        return microAppParsed && microAppParsed.serialize();
    }
}
