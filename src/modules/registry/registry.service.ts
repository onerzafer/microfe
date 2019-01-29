import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as dashify from 'dashify';
import * as strip from 'strip-comments';
import * as uniqid from 'uniqid';
import * as cheerio from 'cheerio';
import { FileUtils } from '../../untilities/file.utils';
import { Manifest } from '../../interfaces/manifest.interface';
import { HTMLUtils } from '../../untilities/html.utils';
import { JSUtils } from '../../untilities/js.utils';
import { TemplateUtils } from '../../untilities/template.utils';
import { ConfigService } from '../config/config.service';
import { RemoteFileUtils } from '../../untilities/remote-file.utils';
import { FileAccessor } from '../../interfaces/file-accessor.interface';

@Injectable()
export class RegistryService {
    fileAccessor: FileAccessor = this.fileUtils;
    constructor(
        private readonly fileUtils: FileUtils,
        private readonly remoteFileUtils: RemoteFileUtils,
        private readonly htmlUtils: HTMLUtils,
        private readonly jsUtils: JSUtils,
        private readonly templateUtils: TemplateUtils,
        private readonly config: ConfigService
    ) {}

    async getMicroApp(microAppName: string): Promise<string> {
        const registryPath = `${__dirname}/../../${this.config.get('REGISTRY_PATH')}`;
        const externals = await this.fileUtils.readFile(`${registryPath}/external.json`).then(file => JSON.parse(file));
        const isRemote: boolean = Object.keys(externals).indexOf(microAppName) > -1;
        this.fileAccessor = isRemote ? this.remoteFileUtils : this.fileUtils;
        const containerId = uniqid('app-root-');
        const appRootPath = `${registryPath}/${microAppName}`;

        return this.fileAccessor
            .readFile(`${appRootPath}/micro-fe-manifest.json`)
            .then(manifestAsText => JSON.parse(manifestAsText))
            .then((manifest: Manifest) => {
                const { globalBundle = [], bundle = [], type = 'default', name } = manifest;
                const globalBundleFixedPaths = globalBundle.map(bundle => ({
                    ...bundle,
                    path: `${this.config.get('DOMAIN')}/${name}/${bundle.path}`,
                }));
                let jsFilePaths =
                    bundle.filter(({ type }) => type === 'js').map(({ path }) => join(appRootPath, path)) || [];
                let inlineJSPieces = [];
                const styleLinks = bundle
                    .filter(({ type }) => type === 'css')
                    .map(({ path }) => `${this.config.get('DOMAIN')}/${name}/${path}`);

                const htmlTemplatePromises = bundle
                    .filter(({ type }) => type === 'template' || type === 'html')
                    .map(({ path }) => `${appRootPath}/${path}`)
                    .map(path =>
                        this.fileAccessor
                            .readFile(path)
                            .then(file => cheerio.load(file))
                            .then($ => {
                                jsFilePaths = [
                                    ...this.htmlUtils.getLocalPathsToJsFiles($, appRootPath),
                                    ...jsFilePaths,
                                ];
                                return $;
                            })
                            .then($ => {
                                inlineJSPieces = [...this.htmlUtils.getInlineJSPieces($), ...inlineJSPieces];
                                return $;
                            })
                            .then($ =>
                                this.htmlUtils.fixRelativeInlineStylePaths($, `${this.config.get('DOMAIN')}/${name}`)
                            )
                            .then($ => this.htmlUtils.moveStylesToBody($))
                            .then($ => this.htmlUtils.fixRelativeHtmlPaths($, name))
                            .then($ => this.htmlUtils.cleanScriptTags($))
                            .then($ => this.htmlUtils.extractBodyArea($))
                    );

                return Promise.all(htmlTemplatePromises)
                    .then(htmlTemplates => htmlTemplates.join('')) // concat html templates
                    .then(htmlTemplate =>
                        Promise.all(
                            jsFilePaths.map(path =>
                                this.fileUtils
                                    .readFile(path)
                                    .then(f => `/* ${path.split('/')[path.split('/').length - 1]} */ ${strip(f, {})}`)
                            )
                        )
                            .then(files => [...inlineJSPieces, ...files].join(' ')) // concat js files
                            .then(file => this.jsUtils.fixRelativePathsInJs(name, file))
                            .then(file => this.jsUtils.fixDocumentAccessJs(file))
                            .then(appContentAsText =>
                                this.wrapTheApp({
                                    appContentAsText,
                                    ...manifest,
                                    containerId,
                                    htmlTemplate: this.htmlUtils.composeTemplate(styleLinks, htmlTemplate, containerId),
                                    type,
                                    globalBundle: globalBundleFixedPaths,
                                })
                            )
                    );
            });
    }

    wrapTheApp({
        containerId,
        appContentAsText = '',
        name = '',
        dependencies = {},
        htmlTemplate = '',
        type,
        globalBundle = [],
    }): Promise<string> {
        const parsedDep = Object.keys(dependencies)
            .map(dep => "'" + dep + "'")
            .join(', ');
        const globalInjectListAsString = JSON.stringify(globalBundle);
        const encapsulatedWebPackAppContentAsText = appContentAsText.replace(/webpackJsonp/g, `webpackJsonp__${name}`);
        return (() =>
            globalBundle.length
                ? this.fileAccessor
                      .readFile(this.templateUtils.templatePath('global'))
                      .then(globalInjectTemplate =>
                          globalInjectTemplate.replace(/__global-inject-list__/g, globalInjectListAsString)
                      )
                : Promise.resolve(''))().then(parsedGlobalIject =>
            this.fileAccessor.readFile(this.templateUtils.templatePath(type)).then(template =>
                template
                    .replace(/__kebab-name__/g, dashify(name))
                    .replace(/__container_id__/g, containerId)
                    .replace(/__name__/g, name)
                    .replace(/__htmlTemplate__/g, htmlTemplate)
                    .replace(/__dependencies__/g, parsedDep)
                    .replace(/__appContentAsText__/g, encapsulatedWebPackAppContentAsText)
                    .replace(/__global-inject__/g, parsedGlobalIject)
            )
        );
    }
}
