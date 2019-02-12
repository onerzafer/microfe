export const isLocalURL = (url: string) => /^(?!https?:\/\/).*/g.test(url);

export const setLocalLinkFor = (elementList: HTMLCollection, attrName: string, accessUri: string) => {
    for (let element of elementList) {
        const srcValue = element.hasAttribute(attrName) && element.attributes.getNamedItem(attrName).value;
        if (srcValue && isLocalURL(srcValue)) {
            element.setAttribute(
                attrName,
                [accessUri, ...srcValue.split('/').filter(s => s && s !== '')].join('/')
            );
        }
    }
};
