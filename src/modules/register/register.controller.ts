import { Controller, Header, Post } from '@nestjs/common';
import { MfhtmlService } from '../mfhtml/mfhtml.service';
import { Plain } from '../../decorators/plain.decorator';

@Controller('register')
export class RegisterController {
    constructor(private mfhtml: MfhtmlService) {}

    @Post()
    @Header('Access-Control-Allow-Methods', 'POST')
    @Header('content-type', 'text/html')
    async registerMicroAppServer(
        @Plain() MicroAppHTML: string
    ): Promise<boolean> {
        console.log(MicroAppHTML);
        this.mfhtml.register(MicroAppHTML);
        console.log(this.mfhtml.getAppNames());
        return true;
    }
}
