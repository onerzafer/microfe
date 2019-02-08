import { Global, Module } from '@nestjs/common';
import { MicroAppServerStoreService } from './micro-app-server-store.service';

@Global()
@Module({
    providers: [MicroAppServerStoreService],
    exports: [MicroAppServerStoreService]
})
export class MicroAppServerStoreModule {}
