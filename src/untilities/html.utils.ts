import { join } from 'path';
import { CSSUtils } from './css.utils';

export class HTMLUtils {
    static composeTemplate(styleLinks: any[], htmlTemplate: string, containerId: string) {
        return [
            ...styleLinks.map(link => `<link href="${link}" rel="stylesheet" type="text/css" />`),
            htmlTemplate,
            !htmlTemplate || htmlTemplate === '' ? `<app-root id="${containerId}"></app-root>` : undefined,
        ].join('');
    }

    static moveStylesToBody($) {
        const $body = $('body');
        const $links = $('head link[rel="stylesheet"]');
        const $styles = $('head style');
        if ($body.length > 0) {
            $styles.each((index, $style) => {
                $body.prepend($style);
            });
            $links.each((index, $link) => {
                $body.prepend($link);
            });
        }
        return $;
    }

    static extractBodyArea($): string {
        const $body = $('body');
        return $body.length > 0 ? $body.html() : $.html();
    }

    static cleanScriptTags($) {
        $('script').remove();
        return $;
    }

    static fixRelativeHtmlPaths($, name: string) {
        $('img').each(function() {
            let uri = $(this).attr('src');
            if (uri && uri !== '' && uri.search('http') === -1) {
                uri = `http://localhost:3000/${join(name, uri)}`;
                $(this).attr('src', uri);
            }
        });
        $('link').each(function() {
            let uri = $(this).attr('href');
            if (uri && uri !== '' && uri.search('http') === -1) {
                uri = `http://localhost:3000/${join(name, uri)}`;
                $(this).attr('href', uri);
            }
        });
        return $;
    }

    static fixRelativeInlineStylePaths($, path: string) {
        $('style').each(function() {
            let style = $(this).html();
            $(this).html(CSSUtils.fixRelativePathsInCss(style, path));
        });
        return $;
    }

    static getLocalPathsToJsFiles($, appRootPath: string): string[] {
        const paths = [];
        $('script').each(function() {
            const path = $(this).attr('src');
            if (path && path.search('http') === -1) {
                paths.push(join(appRootPath, path));
            }
        });
        return paths;
    }

    static getInlineJSPieces($): string[] {
        const inlinePieces = [];
        $('script').each(function() {
            const text = $(this).html();
            if (text && text !== '') {
                inlinePieces.push(text + ';');
            }
        });
        return inlinePieces;
    }
}
