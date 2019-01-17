import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Manifest } from './interfaces/manifest.interface';
import * as dashify from 'dashify';
import * as strip from 'strip-comments';
import * as uniqid from 'uniqid';

@Injectable()
export class AppService {
    getMicroApp(microAppName: string): Promise<string> {
        const containerId = uniqid('app-root-');
        const appRootPath = `${__dirname}/micro-app-registry/${microAppName}`;
        return this.readFile(`${appRootPath}/micro-fe-manifest.json`)
            .then(manifestAsText => JSON.parse(manifestAsText))
            .then((manifest: Manifest) => {
                const { bundle = [], type = 'default', entry, name } = manifest;
                if (type === 'static') {
                    return this.wrapTheApp({
                        ...manifest,
                        type,
                        containerId,
                        entryPoint: `http://localhost:3000/${name}/${entry}`,
                    });
                } else {
                    const jsFilePromises = bundle
                        .filter(({ type }) => type === 'js')
                        .map(({ path }) => `${appRootPath}/${path}`)
                        .map(path => this.readFile(path)
                            .then(file => AppService.fixRelativePathsInJs(name, strip(file, {})))
                            .then(file => AppService.fixDocumentAccessJs(file))
                        );

                    const styleLinks = bundle
                        .filter(({ type }) => type === 'css')
                        .map(({ path }) => `'http://localhost:3000/${name}/${path}'`).join(', ');

                    return Promise.all(jsFilePromises)
                        .then(files => files.join(' ')) // concat js files
                        .then(appContentAsText =>
                            this.wrapTheApp({
                                appContentAsText,
                                ...manifest,
                                styleLinks,
                                containerId,
                                type,
                            })
                        );
                }
            });
    }

    readFile(path: string): Promise<string> {
        return new Promise((resolve, reject) =>
            fs.readFile(path, { encoding: 'UTF8' }, (err: Error, file: string) => (err ? reject(err) : resolve(file)))
        );
    }

    wrapTheApp({
        containerId,
        appContentAsText = '',
        name = '',
        dependencies = {},
        nonBlockingDependencies = {},
        styleLinks = '',
        entryPoint = '',
        type,
    }): Promise<string> {
        const parsedDep = Object.keys(dependencies)
            .map(dep => '\'' + dep + '\'')
            .join(', ');
        const parsedNonBlockingDeps = Object.keys(nonBlockingDependencies)
            .map(dep => '\'' + dep + '\'')
            .join(', ');
        return this.readFile(`${__dirname}/templates/${AppService.templatePath(type)}`)
            .then(template =>
                template
                    .replace(/__kebab-name__/g, dashify(name))
                    .replace(/__container_id__/g, containerId)
                    .replace(/__name__/g, name)
                    .replace(/__styleLinks__/g, styleLinks)
                    .replace(/__dependencies__/g, parsedDep)
                    .replace(/__nonBlockingDependencies__/g, parsedNonBlockingDeps)
                    .replace(/__entryPoint__/g, entryPoint)
            )
            .then(temp => {
                const tempParts = temp.split('__appContentAsText__');
                return [
                    tempParts[0],
                    appContentAsText.replace(/webpackJsonp/g, `webpackJsonp__${name}`),
                    tempParts[1],
                ].join('');
            });
    }

    static templatePath(type) {
        switch (type) {
            case 'webcomponent':
            case 'web component':
                return 'web-component.wrapper.template.js';
            case 'service':
                return 'service.wrapper.template.js';
            case 'static':
                return 'static.wrapper.template.js';
            default:
                return 'app.wrapper.template.js';
        }
    }

    static fixRelativePathsInJs(name, file) {
        const path = `http://localhost:3000/${name}/`;
        return file.replace(/((?<=(["'])(?!http))[.\/a-zA-Z0-9\-_]*?)(\.((sv|pn)g)|(jpe?g)|(gif))(?=\2)/g, `${path}$&`);
    }

    static fixDocumentAccessJs(file) {
        return file.replace(/document.get/g, 'SHADOWROOT.get');
    }
}
