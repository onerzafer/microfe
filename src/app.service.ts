import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { BundleItemOut } from './interfaces/bundle.interface';
import { Manifest } from './interfaces/manifest.interface';

@Injectable()
export class AppService {
    public getMicroApp(microAppName: string): Promise<BundleItemOut[]> {
        return this.getManifest(`${__dirname}/micro-app-registry/${microAppName}/manifest.json`).then(
            (manifest: Manifest) => {
                const bundle = manifest.bundle || [];
                const promises = bundle.map(({ type, path }) => {
                    path = `${__dirname}/micro-app-registry/${microAppName}/${path}`;
                    return type === 'js'
                        ? this.getJsFile(path, manifest).then(file => ({ type: 'js', file } as BundleItemOut))
                        : this.getCss(path).then(file => ({ type: 'css', file } as BundleItemOut));
                });
                return Promise.all(promises);
            }
        );
    }

    private getManifest(path): Promise<Manifest> {
        return new Promise<string>((resolve, reject) => this.readFile(path, resolve, reject)).then(
            file => JSON.parse(file) as Manifest
        );
    }

    private getCss(path): Promise<string> {
        return new Promise<string>((resolve, reject) => this.readFile(path, resolve, reject));
    }

    private getJsFile(path: string, manifest: Manifest): Promise<string> {
        return new Promise<string>((resolve, reject) => this.readFile(path, resolve, reject))
            .then(appContentAsText => AppService.wrapTheApp({ appContentAsText, ...manifest }));
    }

    private readFile(path, resolve, reject) {
        fs.readFile(path, { encoding: 'UTF8' }, (err, file) => (err ? reject(err) : resolve(file)));
    }

    private static wrapTheApp({ appContentAsText, name, dependencies = {}, nonBlockingDependencies = {} }): string {
        return `(function(w) {
        if(w && w.AppsManager && w.AppsManager.register) {
            w.AppsManager.register({
            name: '${name}',
            deps: [${Object.keys(dependencies)
                .map(dep => '\'' + dep + '\'')
                .join(', ')}],
            noneBlockingDeps: [${Object.keys(nonBlockingDependencies)
                .map(dep => '\'' + dep + '\'')
                .join(', ')}],
            initialize: function(...d) {
                return {
                  exec: function(...a) { ((...microAppArgs) => {
                      ${appContentAsText}
                  })(...a, ...d) }
                }
            }
        });
        }
    })(window)`;
    }
}
