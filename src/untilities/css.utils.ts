export class CSSUtils {
    static fixRelativePathsInCss(path: string, file: string) {
        const relativePathPatternInQuoute = /(?<=url\((["']))((?!data:image)(?!http).)*?(?=\1\))/g;
        const relativePathPatternNoQuoute = /(?<=url\()((?!["'])(?!data:image)(?!http).)*?(?=\))/g;
        return file
            .replace(relativePathPatternInQuoute, `${path}$&`)
            .replace(relativePathPatternNoQuoute, `${path}$&`)
            .replace(/html|body/g, `:host`);
    }
}
