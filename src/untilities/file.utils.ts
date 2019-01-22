import * as fs from 'fs';

export class FileUtils {
    static readFile(path: string): Promise<string> {
        return new Promise((resolve, reject) =>
            fs.readFile(path, { encoding: 'UTF8' }, (err: Error, file: string) => (err ? reject(err) : resolve(file)))
        );
    }

    static writeFile(path: string, fileUpdatedContent: string) {
        return new Promise((resolve, reject) =>
            fs.writeFile(path, Buffer.from(fileUpdatedContent, 'utf8'), (err: Error) => (err ? reject(err) : resolve()))
        );
    }
}
