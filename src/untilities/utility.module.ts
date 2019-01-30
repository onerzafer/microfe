import { HttpModule, Module } from '@nestjs/common';
import { FileUtils } from './file.utils';
import { TemplateUtils } from './template.utils';
import { CSSUtils } from './css.utils';
import { HTMLUtils } from './html.utils';
import { JSUtils } from './js.utils';
import { RemoteFileUtils } from './remote-file.utils';

@Module({
    imports: [HttpModule],
    providers: [
        { provide: FileUtils, useValue: new FileUtils() },
        RemoteFileUtils,
        TemplateUtils,
        CSSUtils,
        HTMLUtils,
        JSUtils,
    ],
    exports: [
        FileUtils,
        RemoteFileUtils,
        TemplateUtils,
        CSSUtils,
        HTMLUtils,
        JSUtils,
    ]
})
export class UtilityModule {}
