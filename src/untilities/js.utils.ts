export class JSUtils {
    static fixRelativePathsInJs(name, file) {
        const path = `http://localhost:3000/${name}/`;
        return file.replace(/((?<=(["'])(?!http))[.\/a-zA-Z0-9\-_]*?)(\.((sv|pn)g)|(jpe?g)|(gif))(?=\2)/g, `${path}$&`);
    }

    static fixDocumentAccessJs(file) {
        return file.replace(/document.get/g, 'DOCUMENT.get');
    }
}