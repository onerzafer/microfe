import { Controller, Get, Header, Options, Param } from '@nestjs/common';
import { RegistryService } from './registry.service';

@Controller('registry')
export class RegistryController {
    constructor(private readonly appService: RegistryService) {}

    @Options(':microAppName')
    @Header('Access-Control-Allow-Headers', '*')
    @Header('Access-Control-Allow-Origin', 'http://localhost:9000')
    @Header('Access-Control-Allow-Credentials', 'true')
    @Header('Access-Control-Allow-Methods', 'OPTIONS')
    getAppOptions(@Param('microAppName') microAppName: string): string {
        return 'true';
    }

    @Get(':microAppName')
    @Header('Access-Control-Allow-Origin', 'http://localhost:9000')
    @Header('Access-Control-Allow-Credentials', 'true')
    @Header('Access-Control-Allow-Methods', 'GET')
    @Header('Cache-Control', 'none')
    getApp(@Param('microAppName') microAppName: string): Promise<string> {
        return this.appService.getMicroApp(microAppName.replace('.js', ''));
    }
}
