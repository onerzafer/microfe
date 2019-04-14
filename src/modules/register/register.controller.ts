import { Body, Controller, Header, Post } from '@nestjs/common';
import * as mfhtml from 'mfhtml/index';
@Controller('register')
export class RegisterController {
    constructor() {}

    @Post()
    @Header('Access-Control-Allow-Methods', 'POST')
    async registerMicroAppServer(
        @Body() MicroAppHTML: string
    ): Promise<boolean> {
        return mfhtml.register(MicroAppHTML);
    }
}
