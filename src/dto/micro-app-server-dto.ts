import { IsAlphanumeric, IsArray, IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class MicroAppServerDeclarationDTO {
    @IsAlphanumeric()
    @IsNotEmpty()
    readonly appName: string;

    // validate server url format
    @IsString()
    @IsNotEmpty()
    readonly accessUri: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['page', 'fragment'])
    readonly type: string;

    // validate path format
    @ValidateIf(o => o.type === 'page')
    @IsString()
    readonly route: string;

    @ValidateIf(o => o.uses !== undefined)
    @IsArray()
    readonly uses: string[];
}
