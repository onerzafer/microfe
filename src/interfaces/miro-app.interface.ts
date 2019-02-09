export interface MicroAppGraphItem {
    appName: string;
    accessUri: string;
    isRoot: boolean;
}


export interface MicroAppFragment extends MicroAppGraphItem {
    fragment: string;
}

export interface MicroAppFragmentTransformed extends MicroAppGraphItem {
    fragment: any;
}