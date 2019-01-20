export class CSSUtils {
    static fixRelativePathsInCss(path: string, containerId: string, file: string) {
        const relativePathPatternInQuoute = /(?<=\(")((?!data:image)(?!http).)*?(?="\))/g;
        const relativePathPatternNoQuoute = /(?<=url\()((?!["'])(?!data:image)(?!http).)*?(?=\))/g;
        return file
            .replace(relativePathPatternInQuoute, `${path}$&`)
            .replace(relativePathPatternNoQuoute, `${path}$&`)
            .replace(/html|body/g, `#${containerId}`);
    }
}