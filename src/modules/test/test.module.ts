import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { ManifestTasks } from '../../tasks/manifest.task';

@Module({
    imports: [],
    controllers: [TestController],
    providers: [ManifestTasks],
})
export class TestModule {}
