import { Injectable } from '@nestjs/common';
import * as MFHTML from 'mfhtml/index';

interface Meta {
  appName: string;
  baseUrl: string;
  extending: string;
  alias: string;
  type: string;
  uses: Array<string>;
}

interface Manifest extends Meta {
  bundle: Array<string>;
  overrides: Array<string>;
  publics: Array<string>;
  content: string;
  raw: string;
}

@Injectable()
export class MfhtmlService {
  private m = new MFHTML();

  length(): number {
    return this.m.length();
  }

  register(html: string): void {
    this.m.register(html);
  }

  get(appName: string, scriptToInject?: string): string {
    return this.m.get(appName, scriptToInject);
  }

  getAppNameByAlias(alias: string): string {
    return this.m.getAppNameByAlias(alias);
  }

  getManifest(appName: string): Manifest {
    return this.m.getManifest(appName);
  }

  getMeta(appName: string): Meta {
    return this.m.getMeta(appName);
  }

  getAliases(): Array<string> {
    return this.m.getAliases();
  }

  getAppNames(): Array<string> {
    return this.m.getAppNames();
  }

  getDependencies(appName: string): Array<string> {
    return this.m.getDependencies(appName);
  }

  getMissingDependencies(appName: string): Array<string> {
    return this.m.getMissingDependencies(appName);
  }
}
