import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateUtils {
    base = `${__dirname}/../templates/`;

    templatePath(type) {
        return `${this.base}${this.templateFileName(type)}`;
    }

    templateFileName(type) {
        switch (type) {
            case 'webcomponent':
            case 'web component':
                return 'web-component.wrapper.template.js';
            case 'service':
                return 'service.wrapper.template.js';
            case 'global':
                return 'global-inject.template.js';
            default:
                return 'app.wrapper.template.js';
        }
    }
}
