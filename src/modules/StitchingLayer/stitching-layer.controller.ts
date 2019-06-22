import { Controller, Get, Header, HttpService, NotFoundException, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { MfhtmlService } from '../../services/mfhtml/mfhtml.service';
import * as MFHTML from 'mfhtml/index';
import { UrlResolverService } from '../../services/url-resolver/url-resolver.service';
import { map } from 'rxjs/operators';

@Controller()
export class StitchingLayerController {
  localMfhtml = new MFHTML();
  constructor(
      private globalMfhtml: MfhtmlService,
      private urlResolver: UrlResolverService,
      private http: HttpService,
  ) {}

  @Get('*')
  @Header('Access-Control-Allow-Credentials', 'true')
  @Header('Access-Control-Allow-Methods', 'GET')
  @Header('content-type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'none')
  async getApp(@Param() params: any, @Req() request: Request): Promise<any> {
    const requestedRoute = `/${params[0]}`;
    const routes = this.globalMfhtml.getAliases();
    const resolvedAlias = this.urlResolver.resolve(requestedRoute, routes);

    if (!resolvedAlias) {
      throw new NotFoundException('Not resolved');
    }

    const resolvedAppName = this.globalMfhtml.getAppNameByAlias(resolvedAlias);

    if (!resolvedAppName) {
      throw new NotFoundException('Not found');
    }

    const resolvedAppMissingDependencies: string[] = this.globalMfhtml.getMissingDependencies(
        resolvedAppName,
    );
    const resolvedAppDependencies: string[] = [
      resolvedAppName,
      ...this.globalMfhtml.getDependencies(resolvedAppName),
    ];
    const onlyAvailableAppPublicUrls = resolvedAppDependencies
        .filter(dep => resolvedAppMissingDependencies.indexOf(dep) === -1)
        .map(dep => this.globalMfhtml.getMeta(dep).baseUrl);
    const appsHTMLs = await Promise.all(
        onlyAvailableAppPublicUrls.map(appUrl =>
            this.http
                .get(appUrl, { responseType: 'text' })
                .pipe(map(response => response.data))
                .toPromise(),
        ),
    );
    appsHTMLs.forEach(appHTML => this.localMfhtml.register(appHTML));
    return this.localMfhtml.get(resolvedAppName);
  }
}
