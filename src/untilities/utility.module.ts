import { Module } from '@nestjs/common';
import { FileUtils } from './file.utils';
import { TemplateUtils } from './template.utils';
import { CSSUtils } from './css.utils';
import { HTMLUtils } from './html.utils';
import { JSUtils } from './js.utils';

@Module({
    providers: [
        { provide: FileUtils, useValue: new FileUtils() },
        TemplateUtils,
        CSSUtils,
        HTMLUtils,
        JSUtils,
    ],
    exports: [
        FileUtils,
        TemplateUtils,
        CSSUtils,
        HTMLUtils,
        JSUtils,
    ]
})
export class UtilityModule {}
