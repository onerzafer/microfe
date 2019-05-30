import { Injectable } from '@nestjs/common';
import * as MFHTML from 'mfhtml/index';

@Injectable()
export class MfhtmlService {
  private m = new MFHTML();

  length() {
    return this.m.length();
  }

  register(html: string) {
    this.m.register(html);
  }

  get(appName: string, baseUrl?: string) {
    return this.m.get(appName, baseUrl);
  }

  getAppNameByAlias(alias: string) {
    return this.m.getAppNameByAlias(alias);
  }

  getManifest(appName: string) {
    return this.m.getManifest(appName);
  }

  getMeta(appName: string) {
    return this.m.getMeta(appName);
  }

  getAliases() {
    return this.m.getAliases();
  }

  getAppNames() {
    return this.m.getAppNames();
  }

  getDependencies(appName: string) {
    return this.m.getDependencies(appName);
  }

  getMissingDependencies(appName: string) {
    return this.m.getMissingDependencies(appName);
  }
}
