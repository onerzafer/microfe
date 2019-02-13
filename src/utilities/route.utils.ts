export const wildcardToRegExp = (wildcardTerm: string, regexpFlag: string = 'g'): RegExp =>
    new RegExp('^\/?' + wildcardTerm.split('/*').map(s => escapeRegExp(s)).join('\/?.*') + '$', regexpFlag);

export const routeToRegExp = (wildcardTerm: string, regexpFlag: string = 'g'): RegExp =>
    new RegExp('^\/?' + escapeRegExp(wildcardTerm.split('/').filter(s => s && s !== '').join('/')) + '\/?$', regexpFlag);

export const escapeRegExp = (str: string): string => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
