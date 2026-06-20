# Spec: Source Tool Ports

This spec defines source storage and versioning tool ports.

## Purpose

Define implementation-facing contracts for:

- `source.locate`;
- `source.read`;
- `source.write`;
- `source.version`;
- shared source view types used by source and document-structure tools.

## Scope

These ports preserve original source bytes, source identity, immutable source
versions, manifests, access-unit refs, and source lifecycle metadata.

They sit above `StorageSupportable<Buffer>` and use the common runtime boundary
from [Common Tool Port Contracts](common-tool-port-contracts.md).

## Non-Goals

- No parser implementation.
- No semantic knowledge extraction.
- No index projection write.
- No model summary or answer synthesis.
- No media-specific range-read extension.

## Dependencies

This spec depends on:

- [Common Tool Port Contracts](common-tool-port-contracts.md);
- [Storage And Indexing Contract](../stores/storage-indexing-contract.md);
- [Common Contracts And IDs](../contracts/common-contracts.md);
- [Local Store Layout](../stores/local-store-layout.md).

## Core Rules

The source object store is the evidence source of truth.

The `source.*` ports must preserve these boundaries:

- `SourceId` identifies a logical source.
- `SourceVersionId` identifies immutable source bytes.
- `SourceManifestId` identifies a parser/access-unit view of one source version.
- `AccessUnitId` identifies bounded retrievable units under one manifest.
- OpenSearch-compatible index documents are locators only, not evidence truth.

Source ports must not:

- parse Markdown into knowledge candidates;
- summarize or synthesize source content;
- write index projections;
- promote unvalidated model output to durable knowledge;
- treat provider ETags, filesystem mtimes, or S3 version IDs as source hashes.

## Side Effects

| Port | Side effects |
| --- | --- |
| `source.locate` | `read` |
| `source.read` | `read` |
| `source.write` | `writeImmutable`, and optionally `writeMutablePointer` when promoting current |
| `source.version` | `read` by default, `writeMutablePointer` when promoting or changing lifecycle state |

All calls also produce trace entries through the registry or `audit.trace`.

## Source Port Model

The source port family owns source-specific policy that the generic storage
adapter must not own:

- deterministic source-version ID creation;
- full SHA-256 validation;
- source record and current pointer semantics;
- source-version immutability;
- source lifecycle status rules;
- manifest lookup for bounded source access.

The storage adapter owns only byte-safe read, save, and describe behavior.

## `source.locate`

Purpose:

Resolve a source identity, source version, manifest, access unit, or repository
path into source metadata and usable refs without reading full source bytes.

Typical callers:

- CLI commands preparing an ingest or summary task;
- orchestrator context assembly;
- retrieval tools resolving an index locator back to source truth;
- agents checking that an input ref is resolvable.

### Input

```ts
export type SourceLocateTarget =
  | { kind: "sourceRef"; ref: RefString }
  | { kind: "sourceVersionRef"; ref: RefString }
  | { kind: "manifestRef"; ref: RefString }
  | { kind: "accessUnitRef"; ref: RefString }
  | { kind: "objectPath"; path: StoragePath }
  | { kind: "sourceId"; sourceId: SourceId };

export interface SourceLocateInput {
  target: SourceLocateTarget;
  preferCurrent?: boolean;
  includeManifest?: boolean;
  includeAccessUnits?: boolean;
  includeHistorical?: boolean;
}
```

Rules:

- `preferCurrent` defaults to `true` when target kind is `sourceId` or `sourceRef`.
- `includeHistorical` is required to resolve superseded, archived, hidden, or retracted versions.
- locating by `objectPath` must stay inside the configured repository root.
- locating by `objectPath` may return no source if the path has not been registered.
- `includeAccessUnits` must not inline large text bodies.

### Output

```ts
export interface SourceLocateOutput {
  repositoryId: RepositoryId;
  source?: SourceRecordView;
  sourceVersion?: SourceVersionView;
  manifest?: SourceManifestView;
  accessUnits?: SourceAccessUnitView[];
  refs: SourceResolvedRefs;
}

export interface SourceResolvedRefs {
  repositoryRef: RefString;
  sourceRef?: RefString;
  sourceVersionRef?: RefString;
  manifestRef?: RefString;
  accessUnitRefs?: RefString[];
}
```

Rules:

- returned views contain metadata and locators, not full source bytes.
- manifest refs must belong to the requested source version.
- access-unit refs must belong to the resolved manifest.

### Failure Modes

- unresolved source ref;
- current pointer points to a missing version;
- source version is not readable under request constraints;
- object path escapes repository root;
- access unit belongs to another source version.

## `source.read`

Purpose:

Read exact source bytes or a bounded source segment from the source object store.

This is the evidence read path. It must read from source storage, not from an
index projection or generated summary.

### Input

```ts
export type SourceReadTarget =
  | { kind: "sourceVersionRef"; ref: RefString }
  | { kind: "accessUnitRef"; ref: RefString }
  | { kind: "objectPath"; path: StoragePath };

export interface SourceReadInput {
  target: SourceReadTarget;
  encoding?: "buffer" | "utf8";
  range?: SourceByteRange;
  maxBytes?: number;
  expectedContentHash?: ContentHash;
  includeMeta?: boolean;
}

export interface SourceByteRange {
  start: number;
  endExclusive: number;
}
```

Rules:

- `encoding` defaults to `buffer`.
- Markdown helpers may request `utf8`; binary media should use `buffer`.
- `maxBytes` is required when reading through an agent context unless the caller is a parser or validation tool.
- an access-unit read must use manifest locators and must not guess offsets from index snippets.
- `expectedContentHash`, when provided, must be checked against full source bytes, not only the returned range.

### Output

```ts
export interface SourceReadOutput<TData = Buffer | string> {
  data: TData;
  dataEncoding: "buffer" | "utf8";
  repositoryId: RepositoryId;
  sourceRef?: RefString;
  sourceVersionRef: RefString;
  manifestRef?: RefString;
  accessUnitRef?: RefString;
  objectPath: StoragePath;
  mediaType: MediaType;
  mediaHint: MediaHint;
  byteSize: number;
  contentHash: ContentHash;
  returnedRange?: SourceByteRange;
  truncated: boolean;
}
```

Rules:

- `contentHash` is the full source-version hash.
- `byteSize` is the full source object size.
- `truncated` is `true` when `maxBytes` or a bounded access-unit locator returns less than the full source.
- response envelopes and trace records must not duplicate large `data` payloads.

### Failure Modes

- missing original bytes;
- source-version metadata exists but hash validation fails;
- requested historical or quarantined read is not allowed;
- `maxBytes` is exceeded and no bounded range/access-unit was provided;
- unsupported encoding for the media type.

## `source.write`

Purpose:

Register or update a logical source by writing immutable source-version bytes,
source metadata, and current pointer records.

This port creates source truth. It must be stricter than generic storage writes.

### Input

```ts
export type SourceKind = "file" | "note" | "import" | "generatedFixture" | string;

export interface SourceWriteInput {
  sourceId?: SourceId;
  sourceKind: SourceKind;
  displayName?: string;
  sourceAliases?: string[];
  data: Buffer | string;
  dataEncoding?: "buffer" | "utf8";
  mediaType: MediaType;
  mediaHint: MediaHint;
  sourcePathHint?: StoragePath;
  expectedContentHash?: ContentHash;
  promoteToCurrent: boolean;
  ifSourceExists?: "reuse" | "fail" | "createNewVersion";
  createManifest?: "empty" | "deferToParser";
}
```

Rules:

- source bytes must be converted to canonical bytes before hashing.
- `expectedContentHash`, when provided, must match canonical bytes.
- source-version IDs are derived from media hint and full SHA-256 prefix policy.
- the immutable source-version path must be written with an if-absent rule.
- reverting to an existing full hash reuses the existing source version.
- metadata-only updates must not create a new source version.
- `promoteToCurrent = true` requires a current-pointer side effect grant.

### Output

```ts
export interface SourceWriteOutput {
  repositoryId: RepositoryId;
  source: SourceRecordView;
  sourceVersion: SourceVersionView;
  manifest?: SourceManifestView;
  refs: SourceResolvedRefs;
  writeDisposition:
    | "createdSource"
    | "createdSourceVersion"
    | "reusedExistingVersion"
    | "updatedMetadataOnly";
  promotedToCurrent: boolean;
  objectMeta: StorageObjectMeta;
}
```

Rules:

- source-version metadata owns the authoritative hash.
- `promotedToCurrent` must be false when validation fails.
- output refs must include `sourceRef` and `sourceVersionRef`.
- if a manifest is created, output refs must include `manifestRef`.

### Failure Modes

- hash mismatch;
- attempt to overwrite an immutable source-version object;
- source exists and `ifSourceExists = "fail"`;
- write succeeds but validation fails before current promotion;
- current pointer update denied by constraints;
- storage provider failure during object write or metadata write.

## `source.version`

Purpose:

Inspect or manage source-version state without reading or rewriting original
source bytes.

This port owns version metadata, current pointer review, and lifecycle state
changes. It does not parse, summarize, index, or fetch evidence content.

### Input

```ts
export type SourceVersionOperation =
  | "describe"
  | "listVersions"
  | "promoteCurrent"
  | "setLifecycleStatus";

export interface SourceVersionInput {
  operation: SourceVersionOperation;
  sourceRef?: RefString;
  sourceId?: SourceId;
  sourceVersionRef?: RefString;
  sourceVersionId?: SourceVersionId;
  lifecycleStatus?: LifecycleStatus;
  validationRef?: RefString;
  reason?: string;
  includeManifest?: boolean;
}
```

Rules:

- `describe` requires a source version or a source whose current version can be resolved.
- `listVersions` requires a source.
- `promoteCurrent` requires a source version, `validationRef`, and current-pointer write grant.
- `setLifecycleStatus` requires a source version, target status, reason, and lifecycle write grant.
- lifecycle transitions must not remove bytes while retained evidence refs point to the version.

### Output

```ts
export interface SourceVersionOutput {
  repositoryId: RepositoryId;
  source: SourceRecordView;
  currentSourceVersionRef?: RefString;
  sourceVersions: SourceVersionView[];
  manifest?: SourceManifestView;
  changed: boolean;
  previousStatus?: LifecycleStatus;
  newStatus?: LifecycleStatus;
  promotedToCurrent?: boolean;
}
```

Rules:

- `describe` returns exactly one source version unless it describes current state through a source.
- `listVersions` returns all retained versions visible under constraints.
- `promoteCurrent` updates `current.json` and may mark the previous current version `superseded`.
- `setLifecycleStatus` updates status fields only; it must not overwrite original bytes.

### Failure Modes

- requested source version does not belong to the source;
- requested current pointer target is not validated;
- status transition is not allowed;
- missing reason for lifecycle-changing operation;
- current pointer write denied by constraints.

## Shared Source View Types

These are code-facing views. Persisted source files use `snake_case`.

```ts
export interface SourceRecordView {
  schemaVersion: SchemaVersion;
  repositoryId: RepositoryId;
  sourceId: SourceId;
  sourceKind: SourceKind;
  displayName?: string;
  sourceAliases: string[];
  currentSourceVersionId?: SourceVersionId;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface SourceVersionView {
  schemaVersion: SchemaVersion;
  repositoryId: RepositoryId;
  sourceId: SourceId;
  sourceVersionId: SourceVersionId;
  versionStatus: LifecycleStatus;
  objectPath: StoragePath;
  mediaType: MediaType;
  mediaHint: MediaHint;
  hashAlgorithm: HashAlgorithm;
  contentHash: ContentHash;
  byteSize: number;
  createdAt: IsoDateTime;
}

export interface SourceManifestView {
  schemaVersion: SchemaVersion;
  repositoryId: RepositoryId;
  sourceId: SourceId;
  sourceVersionId: SourceVersionId;
  sourceManifestId: SourceManifestId;
  parserPolicyRef?: RefString;
  accessUnits: SourceAccessUnitView[];
  createdAt: IsoDateTime;
}

export interface SourceAccessUnitView {
  accessUnitId: AccessUnitId;
  accessUnitRef: RefString;
  kind: "document" | "section" | "paragraph" | "table" | "codeBlock" | "frontmatter" | string;
  locator: SourceAccessLocator;
  contentHash?: ContentHash;
}

export type SourceAccessLocator =
  | { kind: "fullDocument" }
  | { kind: "byteRange"; start: number; endExclusive: number }
  | { kind: "lineRange"; startLine: number; endLineInclusive: number }
  | { kind: "markdownHeading"; headingPath: string[] };
```

## Persisted JSON Example

`source.read` response metadata persisted inside an artifact should refer to
source refs and hashes, not inline source bytes:

```json
{
  "source_version_ref": "sourceVersion:srcv_md_sha256_ab12cd34ef90",
  "object_path": "knowledge/sources/src_path_a91c72/versions/srcv_md_sha256_ab12cd34ef90/original.md",
  "media_type": "text/markdown",
  "media_hint": "md",
  "byte_size": 1234,
  "content_hash": "sha256:ab12cd34ef90..."
}
```

## Open Questions

- Should `source.write` create a minimal manifest in P0, or should manifest
  creation belong only to `chunk.create`?
- Should lifecycle transition validation live fully in `source.version`, or move
  to a later lifecycle tool in P2?
- Should source path hints be retained for display/debugging, or treated as
  import-only metadata?

## Acceptance Criteria

This source-port spec is ready when:

- `source.locate` can resolve source refs without reading full source bytes;
- `source.read` can return exact or bounded source bytes with hash validation;
- `source.write` can create immutable source versions and safe current pointers;
- `source.version` can inspect and manage source-version state without rewriting bytes;
- all source ports preserve the source object store as evidence truth.
