import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { StoragePath } from "../contracts/common.js";
import type {
  StorageObjectMeta,
  StorageSaveOptions,
  StorageSupportable
} from "./storage-supportable.js";

export interface LocalStorageOptions {
  rootDir?: string;
}

export interface StorageObjectMetaLocal extends StorageObjectMeta {
  provider: "local";
  absolutePath: string;
}

export class LocalStorage
  implements StorageSupportable<Buffer, StorageObjectMetaLocal>
{
  private readonly rootDir: string;

  constructor(options: LocalStorageOptions = {}) {
    this.rootDir = resolve(options.rootDir ?? process.cwd());
  }

  async read(path: StoragePath): Promise<Buffer> {
    return readFile(this.resolvePath(path));
  }

  async save(
    path: StoragePath,
    data: Buffer,
    options: StorageSaveOptions = {}
  ): Promise<StorageObjectMetaLocal> {
    const absolutePath = this.resolvePath(path);

    if (options.overwrite === false) {
      try {
        await stat(absolutePath);
        throw new Error(`Refusing to overwrite existing file: ${path}`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, data);
    return this.describe(path);
  }

  async describe(path: StoragePath): Promise<StorageObjectMetaLocal> {
    const absolutePath = this.resolvePath(path);
    const info = await stat(absolutePath);
    const data = await readFile(absolutePath);

    return {
      path,
      provider: "local",
      absolutePath,
      byteSize: info.size,
      contentHash: `sha256:${createHash("sha256").update(data).digest("hex")}`,
      createdAt: info.birthtime.toISOString(),
      updatedAt: info.mtime.toISOString()
    };
  }

  private resolvePath(path: StoragePath): string {
    const absolutePath = resolve(this.rootDir, path);

    if (!absolutePath.startsWith(this.rootDir)) {
      throw new Error(`Path escapes storage root: ${path}`);
    }

    return absolutePath;
  }
}
