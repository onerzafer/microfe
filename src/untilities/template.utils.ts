export class TemplateUtils {
    static templatePath(type) {
        switch (type) {
            case 'webcomponent':
            case 'web component':
                return 'web-component.wrapper.template.js';
            case 'service':
                return 'service.wrapper.template.js';
            default:
                return 'app.wrapper.template.js';
        }
    }
}