import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';

@Module({
  controllers: [RegisterController],
})
export class RegisterModule {}
