import { IsAlphanumeric, IsArray, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class MicroAppServerDeclarationDTO {
    @IsAlphanumeric()
    @IsNotEmpty()
    readonly appName: string;

    // validate server url format
    @IsString()
    @IsNotEmpty()
    readonly accessUri: string;

    // validate path format
    @IsString()
    @IsNotEmpty()
    readonly route: string;

    @ValidateIf(o => o.uses !== undefined)
    @IsArray()
    readonly uses: string[];
}
