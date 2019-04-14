import { Controller, Get, Header, Param, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class StitchingLayerController {
    constructor(
    ) {}

    @Get('*')
    @Header('Access-Control-Allow-Credentials', 'true')
    @Header('Access-Control-Allow-Methods', 'GET')
    @Header('content-type', 'text/html; charset=utf-8')
    @Header('Cache-Control', 'none')
    async getApp(@Param() params: any, @Req() request: Request): Promise<string> {
        // resolve micro app name if no app available return 404
        
        return '';
    }
}
