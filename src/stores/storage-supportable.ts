import type { StoragePath } from "../contracts/common.js";

export interface StorageSaveOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  overwrite?: boolean;
}

export interface StorageObjectMeta {
  path: StoragePath;
  provider: string;
  byteSize?: number;
  contentType?: string;
  contentHash?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, string>;
}

export interface StorageSupportable<
  T = Buffer,
  Meta extends StorageObjectMeta = StorageObjectMeta
> {
  read(path: StoragePath): Promise<T>;
  save(path: StoragePath, data: T, options?: StorageSaveOptions): Promise<Meta>;
  describe(path: StoragePath): Promise<Meta>;
}
