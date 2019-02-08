import { Body, Controller, Header, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { MicroAppServerStoreService } from '../MicroAppServerStore/micro-app-server-store.service';
import { MicroAppServerDeclarationDTO } from '../../dto/micro-app-server-dto';

@Controller('register')
export class RegisterController {
    constructor(private readonly microAppServerStoreService: MicroAppServerStoreService) {}

    @Post()
    @Header('Access-Control-Allow-Methods', 'POST')
    @UsePipes(new ValidationPipe({ transform: true }))
    async registerMicroAppServer(
        @Body() declaration: MicroAppServerDeclarationDTO
    ): Promise<boolean> {
        return this.microAppServerStoreService.add(declaration);
    }
}
