export function searchExec(node, comperator, execFn) {
    if (node.childNodes && node.childNodes.length) {
        node.childNodes.map(child => searchExec(child, comperator, execFn));
    }
    if (comperator.call(null, node)) {
        node = execFn.call(null, node);
    }
    return { ...node };
}

export const isTag = t => n => n.tagName === t;

export const hasAttr = attr => n => {
    const foundAttr = n.attrs && n.attrs.length && n.attrs.find(a => a.name === attr);
    return !!(foundAttr && foundAttr.value);
};

export const or = (...fns) => n => fns.some(fn => fn.call(null, n));

export const and = (...fns) => n => fns.length > 0 && fns.filter(fn => fn.call(null, n)).length === fns.length;

export const get = (n) => ({
    attr: (attr, val?) => {
        let index = n.attrs && n.attrs.length && n.attrs.findIndex(a => a.name === attr);
        if(val && index > -1) {
            n.attrs[index].value = val;
        } else if (val && index === -1) {
            console.log(attr, val, index, n.attrs);
            n.attrs.push({name: attr, value: val});
        }
        return val ? val : index > -1 && n.attrs[index] && n.attrs[index].value;
    }
})