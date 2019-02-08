import { HttpModule, Module } from '@nestjs/common';
import { StitchingLayerController } from './stitching-layer.controller';
import { StitchingLayerService } from './stitching-layer.service';
import { ConfigModule } from '../config/config.module';
import { MicroAppServerStoreModule } from '../MicroAppServerStore/micro-app-server-store.module';

@Module({
    imports: [ConfigModule, MicroAppServerStoreModule, HttpModule],
    controllers: [StitchingLayerController],
    providers: [StitchingLayerService],
})
export class StitchingLayerModule {}
