import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { ConfigModule } from '../config/config.module';
import { MicroAppServerStoreModule } from '../MicroAppServerStore/micro-app-server-store.module';

@Module({
    imports: [ConfigModule, MicroAppServerStoreModule],
    controllers: [RegisterController],
})
export class RegisterModule {}
