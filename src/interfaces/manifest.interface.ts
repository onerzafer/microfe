import { BundleItemIn } from './bundle.interface';

export interface Manifest {
  name: string;
  bundle: BundleItemIn[];
  version: string;
  dependencies: { [key: string]: string };
  nonBlockingDependencies: { [key: string]: string };
}
