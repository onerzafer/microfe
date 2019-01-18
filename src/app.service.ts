import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Manifest } from './interfaces/manifest.interface';
import * as dashify from 'dashify';
import * as strip from 'strip-comments';
import * as uniqid from 'uniqid';
import * as cheerio from 'cheerio';

@Injectable()
export class AppService {
    getMicroApp(microAppName: string): Promise<string> {
        const containerId = uniqid('app-root-');
        const appRootPath = `${__dirname}/micro-app-registry/${microAppName}`;
        return this.readFile(`${appRootPath}/micro-fe-manifest.json`)
            .then(manifestAsText => JSON.parse(manifestAsText))
            .then((manifest: Manifest) => {
                const { bundle = [], type = 'default', name } = manifest;
                const jsFilePromises = bundle
                    .filter(({ type }) => type === 'js')
                    .map(({ path }) => `${appRootPath}/${path}`)
                    .map(path =>
                        this.readFile(path)
                            .then(file => AppService.fixRelativePathsInJs(name, strip(file, {})))
                            .then(file => AppService.fixDocumentAccessJs(file))
                    );

                const htmlTemplatePromises = bundle
                    .filter(({ type }) => type === 'template' || type === 'html')
                    .map(({ path }) => `${appRootPath}/${path}`)
                    .map(path =>
                        this.readFile(path)
                            .then(file => AppService.extractBodyArea(file))
                            .then(file => AppService.fixImagePaths(file, name))
                            .then(file => AppService.cleanScriptTags(file))
                            .then(file => AppService.cleanLinkTags(file))
                    );

                const styleLinks = bundle
                    .filter(({ type }) => type === 'css')
                    .map(({ path }) => `http://localhost:3000/${name}/${path}`);

                return Promise.all(htmlTemplatePromises)
                    .then(htmlTemplates => htmlTemplates.join('')) // concat html templates
                    .then(htmlTemplate =>
                        Promise.all(jsFilePromises)
                            .then(files => files.join(' ')) // concat js files
                            .then(appContentAsText =>
                                this.wrapTheApp({
                                    appContentAsText,
                                    ...manifest,
                                    styleLinks,
                                    containerId,
                                    htmlTemplate,
                                    type,
                                })
                            )
                    );
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
        styleLinks = [],
        htmlTemplate = '',
        type,
    }): Promise<string> {
        const parsedDep = Object.keys(dependencies)
            .map(dep => "'" + dep + "'")
            .join(', ');
        const parsedNonBlockingDeps = Object.keys(nonBlockingDependencies)
            .map(dep => "'" + dep + "'")
            .join(', ');
        const composedTemplate = AppService.composeTemplate(styleLinks, htmlTemplate, containerId);
        const encapsulatedWebPackAppContentAsText = appContentAsText.replace(/webpackJsonp/g, `webpackJsonp__${name}`);
        return this.readFile(`${__dirname}/templates/${AppService.templatePath(type)}`).then(template =>
            template
                .replace(/__kebab-name__/g, dashify(name))
                .replace(/__container_id__/g, containerId)
                .replace(/__name__/g, name)
                .replace(/__htmlTemplate__/g, composedTemplate)
                .replace(/__dependencies__/g, parsedDep)
                .replace(/__nonBlockingDependencies__/g, parsedNonBlockingDeps)
                .replace(/__appContentAsText__/g, encapsulatedWebPackAppContentAsText)
        );
    }

    static templatePath(type) {
        switch (type) {
            case 'webcomponent':
            case 'web component':
                return 'web-component.wrapper.template.js';
            case 'service':
                return 'service.wrapper.template.js';
            default:
                return 'app.wrapper.template.js';
        }
    }

    static fixRelativePathsInJs(name, file) {
        const path = `http://localhost:3000/${name}/`;
        return file.replace(/((?<=(["'])(?!http))[.\/a-zA-Z0-9\-_]*?)(\.((sv|pn)g)|(jpe?g)|(gif))(?=\2)/g, `${path}$&`);
    }

    static fixDocumentAccessJs(file) {
        return file.replace(/document.get/g, 'DOCUMENT.get');
    }

    private static composeTemplate(styleLinks: any[], htmlTemplate: string, containerId: string) {
        return [
            ...styleLinks.map(link => `<link href="${link}" rel="stylesheet" type="text/css" />`),
            htmlTemplate,
            `<app-root id="${containerId}"></app-root>`,
        ].join('');
    }

    private static extractBodyArea(file: string): string {
        const $ = cheerio.load(file);
        const $body = $('body');
        return $body.length > 0 ? $body.html() : file;
    }

    private static cleanScriptTags(file: string): string {
        return file.replace(/<string.?\/string>/gi, '');
    }

    private static cleanLinkTags(file: string): string {
        return file.replace(/<link.?\/>/gi, '').replace(/<link.?\/link>/gi, '');
    }

    private static fixImagePaths(file: string, name: string): string {
        const $ = cheerio.load(file);
        $('img').each((index, item) => {
            let uri = $(this).attr('src');
            if (uri && uri !== '' && uri.search('http') === -1) {
                uri = uri
                    .replace('../', '/')
                    .replace('./', '/')
                    .replace('//', '/');
                if (uri.substring(0, 1) === '/') {
                    uri = `http:localhost:3000/${name}${uri}`;
                } else {
                    uri = `http:localhost:3000/${name}/${uri}`;
                }
                $(this).attr('src', uri);
            }
        });
        return $.html();
    }
}
