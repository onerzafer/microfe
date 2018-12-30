import { BundleItemIn } from './bundle.interface';

export interface Manifest {
    name: string;
    type: 'app' | 'service' | 'resource';
    bundle: BundleItemIn[];
    version: string;
    dependencies: { [key: string]: string };
    nonBlockingDependencies: { [key: string]: string };
    template?: string;
}
