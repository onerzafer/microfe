import { Module } from '@nestjs/common';
import { RegistryModule } from './modules/registry/registry.module';
import { TestModule } from './modules/test/test.module';

@Module({
    imports: [
        RegistryModule,
        TestModule,
    ],
})
export class AppModule {}
