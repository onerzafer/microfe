import { Module } from '@nestjs/common';
import { StitchingLayerModule } from './modules/StitchingLayer/stitching-layer.module';
import { RegisterModule } from './modules/register/register.module';

@Module({
    imports: [StitchingLayerModule, RegisterModule],
})
export class AppModule {}
