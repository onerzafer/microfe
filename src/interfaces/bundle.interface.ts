export interface BundleItemIn {
  type: 'css' | 'js';
  path: string;
}

export interface BundleItemOut {
  type: 'css' | 'js';
  file: string;
}
