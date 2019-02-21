import { IsAlphanumeric, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

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
    @IsEnum(['page', 'fragment', 'extendable', 'navigable'])
    readonly type: string;

    // validate path format
    @ValidateIf(o => o.type === 'page' || o.type === 'navigable')
    @IsString()
    readonly route: string;

    @ValidateIf(o => o.type === 'page')
    @IsString()
    readonly extends: string;

    @ValidateIf(o => o.uses !== undefined)
    @IsArray()
    readonly uses: string[];

    @ValidateIf(o => o.type === 'page')
    @IsBoolean()
    readonly routerOutletDelegate: boolean;
}
