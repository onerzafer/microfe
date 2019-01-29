import { Module } from '@nestjs/common';
import { CssTasks } from './css.tasks';
import { UtilityModule } from '../untilities/utility.module';

@Module({
    imports: [UtilityModule],
    providers: [CssTasks]
})
export class TaskModule {
    constructor(private cssTask: CssTasks) {
        cssTask.fixRelativeCssPathsInAllApps();
    }
}
