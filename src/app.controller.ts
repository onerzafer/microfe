import {
  Controller,
  Get,
  Header,
  Logger,
  Options,
  Param,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('registry')
export class AppController {
  constructor(private readonly appService: AppService) {}

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
  getApp(@Param('microAppName') microAppName: string, @Res() res) {
    this.appService
      .getMicroApp(microAppName)
      .then(microAppContentAsText => {
        Logger.log(res.headers);
        res.setHeader('content-type', 'application/javascript');
        res.write(microAppContentAsText);
        res.end();
      })
      .catch(err => {
        res.send(err).end();
      });
  }
}
