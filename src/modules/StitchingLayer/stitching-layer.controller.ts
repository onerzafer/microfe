import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { MfhtmlService } from '../mfhtml/mfhtml.service';
import * as MFHTML from 'mfhtml/index';
import { UrlResolverService } from '../url-resolver/url-resolver.service';

@Controller()
export class StitchingLayerController {
  localMfhtml = new MFHTML();
  constructor(
    private globalMfhtml: MfhtmlService,
    private urlResolver: UrlResolverService
  ) {}

  @Get('*')
  @Header('Access-Control-Allow-Credentials', 'true')
  @Header('Access-Control-Allow-Methods', 'GET')
  @Header('content-type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'none')
  async getApp(@Param() params: any, @Req() request: Request): Promise<any> {
    console.log('#############################');
    console.log('GLOBAL', this.globalMfhtml.length());
    console.log('LOCAL', this.localMfhtml.length());
    console.log('ALIASES', this.globalMfhtml.getAliases());
    console.log('PARAMS', params);
    console.log('#############################');
    // get app aliases (declared routes)
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

    const resolvedAppMissingDependencies = this.globalMfhtml.getMissingDependencies(resolvedAppName);
    const resolvedAppDependencies = this.globalMfhtml.getDependencies(resolvedAppName);
    console.log('MISSING DEPS', resolvedAppMissingDependencies);
    console.log('DEPS', resolvedAppDependencies);
    console.log('#############################');
    // resolve micro app name if no app available return 404
    // if app found get missing dependencies with resolved app name and provide client side loader and placeholder
    // if app found get dependencies with resolved app name
    // console.log(this.globalMfhtml.getDependencies());
    // fetch all apps for each failing one provide client side loader and placeholder
    // create localMfhtml graph and get the final app
    return this.globalMfhtml.get(resolvedAppName);
  }
}
