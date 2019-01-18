import { BundleItem } from './bundle.interface';

export interface Manifest {
    name: string;
    type: 'app' | 'service' | 'webcomponent' | 'web component';
    bundle?: BundleItem[];
    version: string;
    dependencies?: { [key: string]: string };
    nonBlockingDependencies?: { [key: string]: string };
}
