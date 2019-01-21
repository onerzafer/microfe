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

@Injectable()
export class RegistryService {
    getMicroApp(microAppName: string): Promise<string> {
        const containerId = uniqid('app-root-'); // TODO: read from manifest file when cron task implemented
        const appRootPath = `${__dirname}/../../micro-app-registry/${microAppName}`;

        return FileUtils.readFile(`${appRootPath}/micro-fe-manifest.json`)
            .then(manifestAsText => JSON.parse(manifestAsText))
            .then((manifest: Manifest) => {
                const { bundle = [], type = 'default', name } = manifest;
                let jsFilePaths =
                    bundle.filter(({ type }) => type === 'js').map(({ path }) => join(appRootPath, path)) || [];
                let inlineJSPieces = [];
                const styleLinks = bundle
                    .filter(({ type }) => type === 'css')
                    .map(({ path }) => `http://localhost:3000/${name}/${path}`);

                const htmlTemplatePromises = bundle
                    .filter(({ type }) => type === 'template' || type === 'html')
                    .map(({ path }) => `${appRootPath}/${path}`)
                    .map(path =>
                        FileUtils.readFile(path)
                            .then(file => cheerio.load(file))
                            .then($ => {
                                jsFilePaths = [...HTMLUtils.getLocalPathsToJsFiles($, appRootPath), ...jsFilePaths];
                                return $;
                            })
                            .then($ => {
                                inlineJSPieces = [...HTMLUtils.getInlineJSPieces($), ...inlineJSPieces];
                                return $;
                            })
                            .then($ => HTMLUtils.fixRelativeInlineStylePaths($, `http://localhost:3000/${name}`, containerId))
                            .then($ => HTMLUtils.moveStylesToBody($))
                            .then($ => HTMLUtils.fixRelativeHtmlPaths($, name))
                            .then($ => HTMLUtils.cleanScriptTags($))
                            .then($ => HTMLUtils.extractBodyArea($))
                    );

                return Promise.all(htmlTemplatePromises)
                    .then(htmlTemplates => htmlTemplates.join('')) // concat html templates
                    .then(htmlTemplate =>
                        Promise.all(jsFilePaths.map(path => FileUtils.readFile(path).then(f => `/* ${path} */ ${strip(f, {})}`)))
                            .then(files => [...inlineJSPieces, ...files].join(' ')) // concat js files
                            .then(file => JSUtils.fixRelativePathsInJs(name, file))
                            .then(file => JSUtils.fixDocumentAccessJs(file))
                            .then(appContentAsText =>
                                this.wrapTheApp({
                                    appContentAsText,
                                    ...manifest,
                                    containerId,
                                    htmlTemplate: HTMLUtils.composeTemplate(styleLinks, htmlTemplate, containerId),
                                    type,
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
    }): Promise<string> {
        const parsedDep = Object.keys(dependencies)
            .map(dep => '\'' + dep + '\'')
            .join(', ');
        const encapsulatedWebPackAppContentAsText = appContentAsText.replace(/webpackJsonp/g, `webpackJsonp__${name}`);
        return FileUtils.readFile(TemplateUtils.templatePath(type)).then(template =>
            template
                .replace(/__kebab-name__/g, dashify(name))
                .replace(/__container_id__/g, containerId)
                .replace(/__name__/g, name)
                .replace(/__htmlTemplate__/g, htmlTemplate)
                .replace(/__dependencies__/g, parsedDep)
                .replace(/__appContentAsText__/g, encapsulatedWebPackAppContentAsText)
        );
    }
}
