import { Injectable } from '@nestjs/common';
import { Cron, NestSchedule } from 'nest-schedule';
import { join } from 'path';
import * as walk from 'walk';
import { CSSUtils } from '../untilities/css.utils';
import { FileUtils } from '../untilities/file.utils';

@Injectable()
export class CssTasks extends NestSchedule {
    constructor() {
        super();
    }

    // @Cron('*/10 * * * *')
    async fixRelativeCssPathsInAllApps() {
        // every ten minutes check all unhandled files and fix paths
        const files = await this.getAppRootPathsList(join(__dirname, '../', 'micro-app-registry'));
        files.forEach(file => {
            const fileFolder = file.path.split('src/micro-app-registry')[1].replace(`${file.name}`, '');
            const path = `http://localhost:3000${fileFolder}`;
            FileUtils.readFile(file.path)
                .then(fileContent => CSSUtils.fixRelativePathsInCss(path, fileContent))
                .then(fileUpdatedContent => FileUtils.writeFile(file.path, fileUpdatedContent));
        });
        return files;
    }

    async getAppRootPathsList(path: string): Promise<{ name: string; path: string; root: string }[]> {
        return await new Promise(resolve => {
            const files = [];
            const walker = walk.walk(path, { followLinks: false });
            walker.on('file', function(root, stat, next) {
                if (stat.name.match('.css')) {
                    files.push({ name: stat.name, path: join(root, stat.name), root});
                }
                next();
            });

            walker.on('end', function() {
                resolve(files);
            });
        });
    }
}
