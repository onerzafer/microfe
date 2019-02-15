import { JSDOM } from 'jsdom';
import { MicroAppServerDeclarationDTO } from '../dto/micro-app-server-dto';

export interface MicroAppGraph {
    [key: string]: MicroAppServerDeclarationDTO;
}

export interface MicroAppGraphItem {
    appName: string;
    accessUri: string;
    uses: string[];
    isRoot: boolean;
    type: 'page' | 'fragment' | 'extendable';
    extends: string;
}


export interface MicroAppFragment extends MicroAppGraphItem {
    fragment: string;
}

export interface MicroAppFragmentTransformed extends MicroAppGraphItem {
    fragment: JSDOM;
}
