import { Module } from '@nestjs/common';
import { CssTasks } from './css.tasks';

@Module({
    providers: [CssTasks]
})
export class TaskModule {
    constructor(private cssTask: CssTasks) {
        cssTask.fixRelativeCssPathsInAllApps();
    }
}
