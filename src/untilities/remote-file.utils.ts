import { FileAccessor } from '../interfaces/file-accessor.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RemoteFileUtils implements FileAccessor {
    copyFile(source: string, destination: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    readFile(path: string): Promise<string> {
        return Promise.resolve(undefined);
    }

    writeFile(path: string, fileUpdatedContent: string): Promise<void> {
        return Promise.resolve(undefined);
    }
}
