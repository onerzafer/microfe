import { BundleItem } from './bundle.interface';

export interface Manifest {
    name: string;
    type: 'app' | 'service' | 'webcomponent' | 'web component'  | 'static';
    entry?: string;
    bundle?: BundleItem[];
    version: string;
    dependencies?: { [key: string]: string };
    nonBlockingDependencies?: { [key: string]: string };
}
