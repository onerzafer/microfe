import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { BundleItemOut } from './interfaces/bundle.interface';
import { Manifest } from './interfaces/manifest.interface';
import * as dashify from 'dashify';

@Injectable()
export class AppService {
    public async getMicroApp(microAppName: string): Promise<BundleItemOut[]> {
        return await this.getManifest(
            `${__dirname}/micro-app-registry/${microAppName}/micro-fe-manifest.json`
        ).then((manifest: Manifest) => {
            const bundle = manifest.bundle || [];
            const cssFilesPromises = bundle
                .filter(({ type }) => type === 'css')
                .map(({ path }) => `${__dirname}/micro-app-registry/${microAppName}/${path}`)
                .map(path => this.getCssFile(path));
            const cssPromise = Promise.all(cssFilesPromises)
                .then(files => files.join(' ')) // concat css files
            const jsFilePromises = bundle
                .filter(({ type }) => type === 'js')
                .map(({ path }) => `${__dirname}/micro-app-registry/${microAppName}/${path}`)
                .map(path => this.getJsFile(path));
            const jsPromise = cssPromise
                .then(stylesAsText => Promise.all(jsFilePromises)
                    .then(files => files.join(' ')) // concat js files
                    .then(appContentAsText => this.wrapTheApp({ appContentAsText, ...manifest, stylesAsText }))
                    .then(appWrappedContentAsText =>({
                        type: 'js',
                        file: appWrappedContentAsText,
                    } as BundleItemOut)));
            return Promise.all([jsPromise]);
        });
    }

    private async getManifest(path): Promise<Manifest> {
        return await new Promise<string>((resolve, reject) =>
            this.readFile(path, resolve, reject)
        ).then(file => JSON.parse(file) as Manifest);
    }

    private async getJsFile(path: string): Promise<string> {
        return await new Promise<string>((resolve, reject) =>
            this.readFile(path, resolve, reject)
        );
    }

    private async getCssFile(path: string): Promise<string> {
        return await new Promise<string>((resolve, reject) =>
            this.readFile(path, resolve, reject)
        );
    }

    private readFile(path, resolve, reject) {
        fs.readFile(path, { encoding: 'UTF8' }, (err, file) =>
            err ? reject(err) : resolve(file)
        );
    }

    private async wrapTheApp({
        appContentAsText,
        name,
        dependencies = {},
        nonBlockingDependencies = {},
        stylesAsText = ""
    }): Promise<string> {
        const parsedDep = Object.keys(dependencies)
            .map(dep => "'" + dep + "'")
            .join(', ');
        const parsedNonBlockingDeps = Object.keys(nonBlockingDependencies)
            .map(dep => "'" + dep + "'")
            .join(', ');
        return await new Promise<string>((resolve, reject) =>
            this.readFile(
                `${__dirname}/templates/app.wrapper.template.js`,
                resolve,
                reject
            )
        ).then(template =>
            template
                .replace(/__kebab-name__/g, dashify(name))
                .replace(/__name__/g, name)
                .replace(/__stylesAsText__/g, stylesAsText)
                .replace(/__dependencies__/g, parsedDep)
                .replace(/__nonBlockingDependencies__/g, parsedNonBlockingDeps)
                .replace(/__appContentAsText__/g, appContentAsText)
        );
    }
}
