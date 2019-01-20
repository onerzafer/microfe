import * as fs from 'fs';

export class FileUtils {
    static readFile(path: string): Promise<string> {
        return new Promise((resolve, reject) =>
            fs.readFile(path, { encoding: 'UTF8' }, (err: Error, file: string) => (err ? reject(err) : resolve(file)))
        );
    }
}
