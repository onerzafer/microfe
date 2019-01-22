import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { CssTasks } from '../../tasks/css.tasks';

@Module({
    imports: [],
    controllers: [TestController],
    providers: [CssTasks],
})
export class TestModule {}
