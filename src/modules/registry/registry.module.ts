import { Module } from '@nestjs/common';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { UtilityModule } from '../../untilities/utility.module';

@Module({
    imports: [UtilityModule],
    controllers: [RegistryController],
    providers: [RegistryService],
})
export class RegistryModule {}
