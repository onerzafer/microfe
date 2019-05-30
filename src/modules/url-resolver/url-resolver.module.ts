import { Module } from '@nestjs/common';
import { UrlResolverService } from './url-resolver.service';

@Module({
  providers: [UrlResolverService],
  exports: [UrlResolverService],
})
export class UrlResolverModule {}
