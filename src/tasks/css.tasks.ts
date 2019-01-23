import { Injectable } from '@nestjs/common';
import { Cron, NestSchedule, defaults } from 'nest-schedule';
import { join } from 'path';
import * as walk from 'walk';
import * as fs from 'fs';
import { CSSUtils } from '../untilities/css.utils';
import { FileUtils } from '../untilities/file.utils';

defaults.enable = true;
defaults.maxRetry = -1;
defaults.retryInterval = 5000;

@Injectable()
export class CssTasks extends NestSchedule {
    constructor() {
        super();
    }

    @Cron('*/10 * * * *')
    async fixRelativeCssPathsInAllApps() {
        // every ten minutes check all unhandled files and fix paths
        const files = await this.getAppRootPathsList(join(__dirname, '../', 'micro-app-registry'));
        files.forEach(file => {
            const fileFolder = file.path.split('src/micro-app-registry')[1].replace(`${file.name}`, '');
            const path = `http://localhost:3000${fileFolder}`;
            FileUtils.readFile(file.path)
                .then(fileContent => {
                    FileUtils.copyFile(file.path, `${file.path}.original`);
                    return fileContent;
                })
                .then(fileContent => CSSUtils.fixRelativePathsInCss(path, fileContent))
                .then(fileUpdatedContent => FileUtils.writeFile(file.path, fileUpdatedContent));
        });
        console.log('**************************************************');
        console.log(`CRON TASK: fixRelativeCssPathsInAllApps (${new Date().toString()})`);
        console.log('--------------------------------------------------');
        if ( files.length > 0 ) {
            console.log(`\n(${files.length}) PROCESSED FILES\n`);
            console.log(files.map(file => file.path).join('\n'));
        } else {
            console.log(`\nNO FILES FOUND TO PROCESS\n`);
        }
        console.log('**************************************************');
    }

    private async getAppRootPathsList(path: string): Promise<{ name: string; path: string; root: string }[]> {
        return await new Promise(resolve => {
            const files = [];
            const walker = walk.walk(path, { followLinks: false });
            walker.on('file', function(root, stat, next) {
                const path = join(root, stat.name);
                if (stat.name.match('.css') && !stat.name.match('.original') && !fs.existsSync(`${path}.original`)) {
                    files.push({ name: stat.name, path, root });
                }
                next();
            });

            walker.on('end', function() {
                resolve(files);
            });
        });
    }
}
