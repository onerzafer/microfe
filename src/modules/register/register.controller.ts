import { Controller, Header, Post } from '@nestjs/common';
import { MfhtmlService } from '../../services/mfhtml/mfhtml.service';
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
        try {
            this.mfhtml.register(MicroAppHTML);
        } catch (e) {
            console.log(MicroAppHTML);
            console.log(e);
        }
        return true;
    }
}
