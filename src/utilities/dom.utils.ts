import { MicroAppFragmentTransformed } from '../interfaces/miro-app.interface';

export const moveTagFromFragmentHeadTo = (wrapper: HTMLElement, document: Document, tag: string) =>
    wrapper.append(...document.getElementsByTagName('head')[0].getElementsByTagName(tag));

export const getRootFragment = (fragments: MicroAppFragmentTransformed[]) =>
    fragments.length > 1 ? fragments.find(fragment => fragment.isRoot) : fragments[0];
