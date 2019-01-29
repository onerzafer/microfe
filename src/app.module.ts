import { Module } from '@nestjs/common';
import { RegistryModule } from './modules/registry/registry.module';
import { TaskModule } from './tasks/task.module';

@Module({
    imports: [RegistryModule, TaskModule],
})
export class AppModule {}
