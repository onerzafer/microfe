import { Module } from '@nestjs/common';
import { StitchingLayerModule } from './modules/StitchingLayer/stitching-layer.module';
import { RegisterModule } from './modules/register/register.module';
import { MfhtmlModule } from './modules/mfhtml/mfhtml.module';

@Module({
  imports: [MfhtmlModule, StitchingLayerModule, RegisterModule],
})
export class AppModule {}
