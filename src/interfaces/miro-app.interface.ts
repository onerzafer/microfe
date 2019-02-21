import { JSDOM } from 'jsdom';
import { MicroAppServerDeclarationDTO } from '../dto/micro-app-server-dto';

export interface MicroAppGraph {
    [key: string]: MicroAppGraphItem;
}

export interface MicroAppGraphItem extends MicroAppServerDeclarationDTO {
    isRoot: boolean;
}


export interface MicroAppFragment extends MicroAppGraphItem {
    fragment: string;
}

export interface MicroAppFragmentTransformed extends MicroAppGraphItem {
    fragment: JSDOM;
}
