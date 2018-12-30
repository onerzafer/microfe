export interface BundleItemIn {
    type: 'css' | 'js' | 'template';
    path: string;
}

export interface BundleItemOut {
    type: 'css' | 'js' | 'template';
    file: string;
}
