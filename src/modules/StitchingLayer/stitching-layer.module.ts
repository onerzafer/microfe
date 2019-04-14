import { HttpModule, Module } from '@nestjs/common';
import { StitchingLayerController } from './stitching-layer.controller';

@Module({
    imports: [HttpModule],
    controllers: [StitchingLayerController],
})
export class StitchingLayerModule {}
