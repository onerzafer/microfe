import { Injectable } from '@nestjs/common';
import { Cron, NestSchedule } from 'nest-schedule';

@Injectable()
export class CssTasks extends NestSchedule {
    constructor() {
        super();
    }

    @Cron('*/10 * * * *')
    async fixRelativeCssPathsInAllApps() {
        // every ten minus check all un handeled files and fix paths
    }
}