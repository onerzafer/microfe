import { Global, Module } from '@nestjs/common';
import { MfhtmlService } from './mfhtml.service';

@Global()
@Module({
  providers: [MfhtmlService],
  exports: [MfhtmlService]
})
export class MfhtmlModule {}
