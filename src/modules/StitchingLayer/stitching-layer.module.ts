import { HttpModule, Module } from '@nestjs/common';
import { StitchingLayerController } from './stitching-layer.controller';
import { UrlResolverModule } from '../url-resolver/url-resolver.module';

@Module({
  imports: [HttpModule, UrlResolverModule],
  controllers: [StitchingLayerController],
})
export class StitchingLayerModule {}
