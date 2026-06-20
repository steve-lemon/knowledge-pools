import type { StoragePath } from "../contracts/common.js";
import type {
  StorageObjectMeta,
  StorageSupportable
} from "../stores/storage-supportable.js";

export interface SummaryReadRequest {
  path: StoragePath;
}

export interface SummaryReadResult<
  TStorageData = Buffer,
  TStorageMeta extends StorageObjectMeta = StorageObjectMeta
> {
  data: TStorageData;
  meta: TStorageMeta;
}

export interface SummaryReadTool<
  TStorageData = Buffer,
  TStorageMeta extends StorageObjectMeta = StorageObjectMeta
> {
  read(
    request: SummaryReadRequest
  ): Promise<SummaryReadResult<TStorageData, TStorageMeta>>;
}

export class StorageSummaryReadTool<
  TStorageData = Buffer,
  TStorageMeta extends StorageObjectMeta = StorageObjectMeta
> implements SummaryReadTool<TStorageData, TStorageMeta>
{
  constructor(
    private readonly storage: StorageSupportable<TStorageData, TStorageMeta>
  ) {}

  async read(
    request: SummaryReadRequest
  ): Promise<SummaryReadResult<TStorageData, TStorageMeta>> {
    const meta = await this.storage.describe(request.path);
    const data = await this.storage.read(request.path);
    return { data, meta };
  }
}
