import { FileAccessor } from '../interfaces/file-accessor.interface';
import { HttpService, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class RemoteFileUtils implements FileAccessor {
    constructor(private readonly http: HttpService) {}
    readFile(path: string): Promise<string> {
        console.log(path);
        return this.http.get(path, {responseType: 'text'})
            .pipe(map(response => response.data))
            .toPromise();
    }
}
