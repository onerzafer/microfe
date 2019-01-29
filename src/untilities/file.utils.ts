import { FileAccessor } from '../interfaces/file-accessor.interface';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileUtils implements FileAccessor {
    copyFile(source: string, destination: string): Promise<void> {
        return new Promise((resolve, reject) =>
            fs.copyFile(source, destination, (err: Error) => (err ? reject(err) : resolve()))
        );
    }

    readFile(path: string): Promise<string> {
        return new Promise((resolve, reject) =>
            fs.readFile(path, { encoding: 'UTF8' }, (err: Error, file: string) =>
                err ? reject(err) : resolve(file)
            )
        );
    }

    writeFile(path: string, fileUpdatedContent: string): Promise<void> {
        return new Promise((resolve, reject) =>
            fs.writeFile(path, Buffer.from(fileUpdatedContent, 'utf8'), (err: Error) =>
                err ? reject(err) : resolve()
            )
        );
    }
}
