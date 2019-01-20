import { Injectable } from "@nestjs/common";
import { Cron, NestSchedule } from 'nest-schedule';

@Injectable()
export class ManifestTasks extends NestSchedule {
    constructor() {
        super();
    }

    @Cron('*/10 * * * *')
    async addContainerId() {
        // every ten minutes check all un handeled manifest files and add container Id
    }
}