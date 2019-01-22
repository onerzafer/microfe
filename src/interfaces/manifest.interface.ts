import { BundleItem } from './bundle.interface';

export interface Manifest {
    conatinerId?: string;
    name: string;
    type: 'app' | 'service' | 'webcomponent' | 'web component';
    bundle?: BundleItem[];
    globalBundle?: BundleItem[];
    version: string;
    dependencies?: { [key: string]: string };
}
