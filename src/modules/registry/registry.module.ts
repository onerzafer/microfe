import { Module } from '@nestjs/common';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { UtilityModule } from '../../untilities/utility.module';
import { ConfigModule } from '../config/config.module';

@Module({
    imports: [UtilityModule, ConfigModule],
    controllers: [RegistryController],
    providers: [RegistryService],
})
export class RegistryModule {}
