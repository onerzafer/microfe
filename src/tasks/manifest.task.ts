import { Injectable } from '@nestjs/common';
import { Cron, NestSchedule } from 'nest-schedule';
import * as walk from 'walk';
import { join } from 'path';

@Injectable()
export class ManifestTasks extends NestSchedule {
    constructor() {
        super();
    }

    //@Cron('*/10 * * * *')
    async addContainerId(): Promise<string[]> {
        // every ten minutes check all un handled manifest files and add container Id
        return this.getAppRootPathsList(join(__dirname, '../', 'micro-app-registry'));
    }

    async getAppRootPathsList(path: string): Promise<string[]> {
        return await new Promise(resolve => {
            const files = [];
            const walker = walk.walk(path, { followLinks: false });
            walker.on('file', function(root, stat, next) {
                if (stat.name === 'micro-fe-manifest.json') {
                    files.push(root);
                }
                next();
            });

            walker.on('end', function() {
                resolve(files);
            });
        });
    }
}
