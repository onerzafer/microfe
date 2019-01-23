export class TemplateUtils {
    static base = `${__dirname}/../templates/`;

    static templatePath(type) {
        return `${TemplateUtils.base}${TemplateUtils.templateFileName(type)}`;
    }

    static templateFileName(type) {
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
