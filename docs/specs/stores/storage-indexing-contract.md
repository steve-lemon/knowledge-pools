# Spec: Storage And Indexing Contract

This spec defines the first P0 foundation for implementation-near work.

It must be reviewed before finalizing common IDs and refs.

Storage and indexing boundaries determine which IDs are needed, which refs must be resolvable, and how later media types can extend the system without changing the pipeline shape.

## Purpose

Define a strong contract for:

- source object storage;
- source versions;
- source manifests;
- access-unit addressing;
- derived and preview artifacts;
- local artifact storage;
- OpenSearch-compatible index projections;
- evidence fetch boundaries;
- lifecycle and status fields;
- media extension compatibility.

## Scope

This spec covers Markdown-first validation and future media expansion constraints.

It does not implement storage or OpenSearch.

It defines the behavior a future implementation must satisfy.

## Non-Goals

- No real OpenSearch deployment.
- No graph database.
- No vector database.
- No distributed queue.
- No multi-repository federation.
- No media parser implementation.
- No access-control engine beyond fields needed to preserve future policy.

## Core Decision

Use one logical repository with two primary persistence layers:

```text
source object store  ->  OpenSearch-compatible index projections
```

The source object store is the evidence source of truth.

The index is a retrieval map.

The index must never become the source of truth for original content.

## Storage Layers

| Layer | V1 backing | Owns | Must not own |
| --- | --- | --- | --- |
| Source object store | local filesystem-compatible paths | original sources, immutable source versions, manifests, derived previews | search ranking, answer evidence synthesis |
| Artifact store | local JSON files | stage artifacts, handoffs, validation summaries, run-local derived outputs | original source bytes |
| Trace store | append-only local records | tool calls, decisions, refs, timestamps | artifacts as primary payloads |
| Taxonomy store | local taxonomy bundle | category, attribute, relation, and schema refs | source version identity |
| Index projection store | OpenSearch-compatible JSON fixtures first | searchable projections and locators | full raw source content, high-resolution media, long transcripts |

## Repository Boundary

V1 uses a single logical repository.

Every stored object and index projection must carry:

- `repository_id`;
- source or artifact identity;
- schema version;
- provenance or creator metadata when applicable.

The repository boundary is the future unit for:

- source object prefixes;
- OpenSearch aliases;
- taxonomy bundle selection;
- retention policy;
- later multi-repository federation.

Do not design IDs that only work in a global single repository.

## Source Object Store Contract

Original sources are stored under a filesystem-compatible object path.

The object path may be local in development and S3-compatible later.

Required behavior:

- preserve original bytes;
- compute full SHA-256 from canonical bytes;
- create immutable source-version records;
- keep source versions addressable while evidence refs point to them;
- store source manifests beside or near the source version;
- store derived previews under the same source-version boundary when possible;
- support partial or bounded source access through manifest locators.

The source object store must not:

- mutate old source-version records in place;
- overwrite original bytes for an existing source version;
- require loading full large sources into model context;
- depend on OpenSearch to reconstruct evidence.

## StorageSupportable Interface

All object-like storage adapters should implement the same minimal interface.

In this spec, `OS` means OpenSearch or an OpenSearch-compatible indexing service.

It does not mean operating system.

This keeps local filesystem storage, S3-compatible storage, and OpenSearch-compatible projection storage behind the same small adapter shape where appropriate.

The interface is intentionally small:

```ts
export interface StorageSupportable<
  T = Buffer,
  Meta extends StorageObjectMeta = StorageObjectMeta
> {
  read(path: StoragePath): Promise<T>;
  save(path: StoragePath, data: T, options?: StorageSaveOptions): Promise<Meta>;
  describe(path: StoragePath): Promise<Meta>;
}
```

`Buffer` is the default transport type.

The default `StorageSupportable` is therefore equivalent to:

```ts
export type ByteStorage = StorageSupportable<Buffer>;
```

Markdown, text, and JSON can use a string-compatible specialization when the adapter explicitly supports encoding:

```ts
export type TextStorage = StorageSupportable<string>;
```

Callers may also keep byte storage and convert at the caller boundary:

```ts
const markdown = (await storage.read(path)).toString("utf8");
await storage.save(path, Buffer.from(JSON.stringify(payload, null, 2), "utf8"), options);
```

Recommended P0 posture:

- use `StorageSupportable<Buffer>` for source objects, derived media, previews, and hash-sensitive writes;
- allow `StorageSupportable<string>` for Markdown, text, and JSON helper adapters;
- allow `StorageSupportable<IndexProjectionDocument>` or serialized JSON for OpenSearch-compatible projection adapters after projection contracts are stable;
- never compute source hashes from a string after implicit encoding conversion unless the encoding is explicitly fixed as UTF-8;
- keep parser behavior outside the storage adapter.

The storage adapter should not parse Markdown, JSON, PDF, image, audio, or video.

Parsing belongs to tool ports such as `parse.document` or `parse.media`.

### Data Type Policy

`T` is the adapter transport type.

Allowed P0 transport types:

```ts
export type StorageData = Buffer | string;
```

Rules:

- `Buffer` is required for binary-safe storage;
- `string` is allowed for UTF-8 text helpers only;
- JSON should be serialized before `save` and parsed after `read` by the caller or a higher-level store;
- storage adapters must not infer domain type from extension and then parse content;
- media storage must use `Buffer`.

Possible later extensions:

- `Readable` stream for large local/S3 reads;
- provider-specific upload body types;
- OpenSearch-compatible projection document objects;
- range-read support for media and large documents.

Those extensions should be additive and must not change the P0 method names.

### StoragePath

`StoragePath` is a logical object path, not necessarily a local absolute path.

```ts
export type StoragePath = string;
```

Allowed examples:

```text
knowledge/sources/src_001/versions/srcv_md_sha256_ab12/original.md
s3://bucket/repository/sources/src_001/versions/srcv_md_sha256_ab12/original.md
os://repo_main/projections/kp_repo_main_source_md_sha256_ab12_root
```

Rules:

- callers should pass repository-scoped logical paths;
- local adapters may map logical paths to local filesystem paths;
- S3-compatible adapters may map logical paths to bucket keys;
- path traversal such as `../` must be rejected by local adapters;
- adapter-specific credentials, bucket names, and roots belong to adapter configuration, not artifact payloads.

### StorageSaveOptions

`options` on `save` is optional because some objects can be described from bytes and path alone.

This object is useful, but it is not storage-observed metadata.

It should be treated as a save request hint.

It should not be named `StorageObjectMetaInput` because that makes it look like the caller can define the stored object's truth.

```ts
export interface StorageSaveOptions {
  media_type?: string;
  media_hint?: string;
  encoding?: "utf8" | "binary" | "base64";
  expected_content_hash?: string;
  expected_byte_size?: number;
  source_id?: string;
  source_version_id?: string;
  artifact_id?: string;
  schema_version?: string;
  created_by?: string;
  tags?: string[];
  attributes?: TypedAttribute[];
  user_meta?: Record<string, string>;
  overwrite?: boolean;
  if_absent?: boolean;
}
```

Rules:

- `expected_content_hash` and `expected_byte_size` are preconditions or hints, not observed state;
- adapters may use options to set provider user metadata where supported;
- adapters may ignore fields that the backing store cannot persist;
- `describe` must still return storage-observed metadata;
- immutable source-version paths should use `if_absent = true`;
- mutable projection writes may use `overwrite = true` only when the higher-level index tool allows it.

### StorageObjectMeta

`describe(path)` returns observed object or projection metadata.

```ts
export interface StorageObjectMeta {
  path: StoragePath;
  exists: boolean;
  byte_size: number;
  content_hash?: string;
  hash_algorithm?: "sha256";
  media_type?: string;
  media_hint?: string;
  encoding?: "utf8" | "binary" | "base64";
  created_at?: string;
  updated_at?: string;
  last_modified?: string;
  storage_provider: "local" | "s3_compatible" | "os";
  storage_class?: string;
  user_meta?: Record<string, string>;
}

export interface StorageObjectMetaLocal extends StorageObjectMeta {
  storage_provider: "local";
  root_path?: string;
  relative_path?: string;
  mode?: number;
  uid?: number;
  gid?: number;
  inode?: number;
  device_id?: number;
  symlink_policy?: "follow" | "preserve" | "reject";
}

export interface StorageObjectMetaS3Compatible extends StorageObjectMeta {
  storage_provider: "s3_compatible";
  bucket?: string;
  key?: string;
  region?: string;
  endpoint?: string;
  etag?: string;
  version_id?: string;
}

export interface StorageObjectMetaOS extends StorageObjectMeta {
  storage_provider: "os";
  index_name?: string;
  index_alias?: string;
  document_id?: string;
  document_type?: string;
  seq_no?: number;
  primary_term?: number;
  routing?: string;
  index_version?: string;
}

export type StorageObjectMetaResolved =
  | StorageObjectMetaLocal
  | StorageObjectMetaS3Compatible
  | StorageObjectMetaOS;
```

Common metadata lives in `StorageObjectMeta`.

Provider-specific metadata belongs in the provider-specific subtype.

For local storage:

- `etag` may be omitted;
- `version_id` may be omitted;
- `last_modified` should come from filesystem metadata where available.
- filesystem-specific metadata such as mode, uid, gid, inode, and device id may be exposed;
- absolute paths must not be stored in durable artifacts unless explicitly allowed by environment policy;
- repository-scoped logical paths should remain the stable path used by artifacts and manifests.

For S3-compatible storage:

- `etag` may not equal SHA-256;
- `version_id` may be present only when bucket versioning is enabled;
- caller code must not treat provider `version_id` as `source_version_id`.

For OS/OpenSearch-compatible storage:

- OS metadata describes index projection state, not original source bytes;
- `document_id` should match `index_document_id` when available;
- `seq_no` and `primary_term` are provider concurrency metadata, not Knowledge Pools source version IDs;
- OS metadata must not be used as evidence metadata;
- exact answer evidence still comes from source storage through manifests and access units.

### Local Storage Adapter

Local filesystem access can implement `StorageSupportable<Buffer>`.

Recommended shape:

```ts
export type LocalStorage = StorageSupportable<Buffer, StorageObjectMetaLocal>;
```

The local adapter is useful for:

- local development;
- fixture storage;
- test repositories;
- import/export workflows;
- environments where object storage is mounted as a filesystem.

Rules:

- local adapters must map logical repository paths to a configured root;
- local adapters must reject path traversal before touching the filesystem;
- local adapters should return `StorageObjectMetaLocal`;
- local adapters should not leak absolute paths into source manifests or index projections by default;
- local adapters should preserve bytes exactly;
- local adapters should treat symlinks according to explicit configuration.

If symlinks are allowed, `describe` must state whether metadata describes the link or the target.

### OS Projection Adapter

OpenSearch-compatible projection storage may implement `StorageSupportable<T>` for index projection documents.

Recommended shape after projection contracts are stable:

```ts
export type OSProjectionStorage<TProjection> =
  StorageSupportable<TProjection, StorageObjectMetaOS>;
```

The OS adapter is useful for:

- writing active index projections;
- reading projection documents by deterministic projection id;
- describing projection state;
- hiding, deactivating, or replacing projections through higher-level index tools.

Rules:

- OS adapters are for index projections, not original source objects;
- OS adapters must preserve content-minimal indexing rules;
- OS adapters must reject dynamic fields that violate mapping discipline;
- OS adapters should return `StorageObjectMetaOS`;
- OS `describe` should describe projection document state, not source object state;
- OS `read` must not be treated as evidence fetch;
- OS `save` must not make a projection current until validation passes at the higher-level index tool.

### Save Behavior

`save(path, data, options?)` writes data.

Rules:

- `data` is the source of truth for stored bytes or text;
- `Buffer` writes preserve bytes exactly;
- `string` writes must use explicit UTF-8 encoding unless a higher-level adapter declares otherwise;
- `expected_content_hash`, when provided in `options`, must be checked by the adapter or higher-level source-version logic;
- storage adapters may return observed hash metadata when they compute it;
- overwriting an existing path is allowed only for mutable locations such as temporary artifacts or current pointers;
- immutable source-version paths must be written once by policy above this adapter;
- `save` must return metadata for the stored object.

### Read Behavior

`read(path)` returns the configured transport type for the object at the path.

Rules:

- `read` does not parse content;
- `read` does not validate source version;
- `read` does not apply access-unit slicing by itself;
- bounded evidence fetch may call `read` and then apply manifest locators, or a later range-capable extension may add a specialized method.
- `StorageSupportable<Buffer>` must return exact bytes;
- `StorageSupportable<string>` must document its encoding and should default to UTF-8.

The P0 interface intentionally does not include range reads.

Large-file and media range access should be introduced later as an extension, not by complicating the first adapter.

### Describe Behavior

`describe(path)` must not read the full object body when metadata APIs are available.

Rules:

- local adapters may use filesystem stat plus optional sidecar metadata;
- S3-compatible adapters may use `HEAD Object`;
- `describe` should report `exists = false` only when the object is confirmed missing;
- permission failures should return a typed error, not `exists = false`.

## Storage Adapter Roles

`StorageSupportable` can back multiple higher-level stores.

| Higher-level store | Uses `StorageSupportable` for | Additional policy above adapter |
| --- | --- | --- |
| Source object store | original bytes, source manifests, derived previews | immutability, source-version hash policy |
| Artifact store | JSON artifacts and handoffs | schema validation, artifact metadata |
| Trace store | append-only trace segments | append discipline and run/task refs |
| Taxonomy store | taxonomy bundles | schema version and compatibility checks |
| Index projection fixture store | local JSON projection documents | OpenSearch mapping compatibility and content-minimal audit |

The adapter should stay generic.

Store-specific rules belong to the higher-level store modules.

## Source Version Contract

`source_id` represents logical source identity.

`source_version_id` represents immutable source bytes.

Source bytes changing creates a new source version when the full hash is new to the repository.

Source metadata, taxonomy classification, parser policy, or index mapping changes do not create a new source version.

Required lifecycle states:

- `current`;
- `superseded`;
- `hidden`;
- `archived`;
- `quarantined`;
- `retracted`;
- `deleted`;
- `purged`.

Current-state retrieval should default to `current` and active projections.

Historical or audit retrieval must opt in to superseded or non-current versions.

## Source Manifest Contract

Every source version must have a manifest.

The manifest is the bridge from search result to exact evidence.

Minimum manifest responsibilities:

- identify `source_id`;
- identify `source_version_id`;
- identify parser policy and parser version;
- list `AccessUnit` records;
- list derived objects and preview artifacts;
- provide locators for bounded source fetch;
- preserve raw locator details for reconstruction;
- record validation status.

Manifests may be regenerated when parser policy changes.

Regenerating a manifest does not change the source version unless source bytes changed.

## Access Unit Contract

An `AccessUnit` is the smallest source unit the system may fetch as evidence.

Markdown-first access units may be:

- document;
- section;
- block;
- wiki link;
- frontmatter field.

Later media access units may be:

- image full object;
- image region;
- OCR span;
- PDF page;
- PDF block;
- PDF table;
- audio transcript span;
- audio time range;
- video scene;
- video subtitle span;
- video frame range.

Access-unit identity must be scoped by:

- repository;
- source version;
- parser policy;
- locator policy.

Access-unit IDs do not need to be stable across parser-policy changes.

Old access units must remain resolvable while retained artifacts, evidence bundles, or traces reference them.

## Derived And Preview Artifact Contract

Preview artifacts help browsing, triage, and retrieval inspection.

They are not source of truth.

Examples:

- Markdown outline;
- Markdown bounded summary;
- image thumbnail;
- image standard rendition;
- PDF page thumbnail;
- waveform preview;
- video storyboard.

Preview artifacts must record:

- preview id;
- preview kind;
- source version ref;
- derived-from access-unit refs;
- generator id;
- generator version;
- generator config hash when output depends on config;
- preview hash;
- object URI;
- access policy hints when needed.

Index projections may store preview refs and small preview metadata.

Index projections must not store preview bytes or long preview text.

## Artifact Store Contract

Stage artifacts are written to local JSON-compatible storage first.

Required behavior:

- write artifacts by stage;
- preserve artifact metadata;
- preserve schema version;
- preserve provenance;
- preserve validation summary;
- keep artifact payload separate from handoff payload;
- allow read by artifact ref;
- reject unknown artifact type unless explicitly allowed in a migration.

Artifact store is not the original source store.

Artifact payloads may contain derived structured data, but source-sized content should remain referenced.

## Trace Store Contract

Trace records are append-only.

Trace events should include:

- trace event id;
- run id;
- task id when applicable;
- stage;
- agent or tool id;
- input refs;
- output refs;
- timestamp;
- status;
- error code when applicable.

Traces explain what happened.

They do not replace artifacts, manifests, or handoffs.

## Index Projection Contract

OpenSearch-compatible projections are searchable maps.

They must retain enough information to find and fetch source evidence.

They must not store full original content.

Every index projection must include:

- `index_document_id`;
- `index_document_type`;
- `index_document_version`;
- `repository_id`;
- `source_id`;
- `source_version_id`;
- `source_version`;
- `version_status`;
- `is_current`;
- `projection_status`;
- `source_uri`;
- `source_content_hash`;
- `media_type`;
- `media_hint`;
- `source_manifest_ref`;
- `access_unit_refs`;
- `evidence_refs`;
- `preview_refs`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `created_at`;
- `updated_at`.

OpenSearch `_id` should equal `index_document_id`.

`index_document_id` is a projection id, not the only durable system id.

## Content-Minimal Index Rule

The index may store:

- IDs and refs;
- object URIs;
- hashes;
- lifecycle status;
- short labels;
- titles;
- taxonomy category ids;
- typed attribute values;
- normalized locators;
- preview refs;
- evidence refs;
- derived object refs;
- short descriptors when policy allows.

The index must not store:

- full Markdown body;
- full chunks;
- full PDF page text;
- full OCR output;
- full transcript text;
- full JSON payloads;
- high-resolution image bytes;
- audio or video bytes;
- long generated summaries that replace source lookup.

If full-text search is needed, use indexed-but-not-stored search text and still fetch exact evidence from source storage.

## Mapping Discipline

OpenSearch-compatible mappings must be explicit and strict.

Rules:

- use stable field names;
- the same field name must always have the same type;
- do not index arbitrary dynamic JSON;
- do not use `attribute_values.{key}` fields;
- use typed nested `attributes`;
- store arbitrary raw locators in disabled objects;
- store arbitrary raw media metadata in disabled objects.

Unknown queryable fields must be rejected until mapping is reviewed.

## Typed Attribute Contract

Runtime taxonomy attributes use a typed array.

Shape:

```ts
export interface TypedAttribute {
  key: string;
  value_type: "keyword" | "text" | "number" | "boolean" | "date";
  keyword_value?: string;
  keyword_values?: string[];
  text_value?: string;
  number_value?: number;
  boolean_value?: boolean;
  date_value?: string;
}
```

Rules:

- one attribute key has one declared type in the taxonomy bundle;
- only the matching value field may be populated;
- unknown attributes are rejected or stored in disabled raw metadata;
- field names do not change by attribute key.

## Evidence Fetch Contract

Retrieval must follow this path:

```text
index.search
  -> projection refs
  -> source.locate
  -> source.read
  -> EvidenceBundle
```

Answer generation and verification should use fetched source units, not index projection contents, as evidence.

Verification must fail or warn when:

- an evidence ref cannot be resolved;
- an access unit no longer exists;
- a source hash does not match;
- evidence comes from a superseded version but is presented as current;
- a projection is inactive, quarantined, retracted, deleted, or purged without explicit audit mode.

## Lifecycle And Projection Status Contract

Source lifecycle and projection lifecycle are related but separate.

Source version status describes the source version.

Projection status describes a searchable projection.

Normal retrieval defaults:

```text
is_current = true
projection_status = active
version_status = current
```

Rollback, quarantine, deletion, and retraction should change projection visibility before physical deletion.

Physical purge is a final retention/compliance event and should not be part of normal correction workflows.

## Media Extension Contract

Later media types must extend the same storage/indexing model.

Allowed extensions:

- media-specific access-unit kinds;
- media-specific normalized locator fields;
- media-specific preview kinds;
- media-specific parser metadata;
- media-specific confidence fields through typed attributes.

Forbidden extensions:

- separate evidence pipeline per media type;
- index documents that store full media-derived content;
- media IDs that cannot link back to source version and manifest;
- update candidates that bypass verification.

## ID Policy Implications

The common ID policy must support this storage/indexing contract.

Therefore IDs must distinguish:

- logical source identity;
- immutable source version;
- physical object path;
- source manifest;
- access unit;
- preview artifact;
- stage artifact;
- handoff;
- index projection;
- evidence ref;
- trace event.

The ID policy should be defined after this contract so IDs are shaped around storage and retrieval boundaries, not the other way around.

## Validation Rules

Minimum validation:

- `StorageSupportable<T = Buffer>` defaults to byte-safe storage;
- `StorageSupportable.read` returns the declared transport type for an existing object;
- `StorageSupportable.save` returns observed metadata for written data;
- `StorageSupportable.describe` returns metadata without requiring content parsing;
- provider-specific metadata is separated into local, S3-compatible, and OS/OpenSearch-compatible subtypes;
- source hash matches stored bytes;
- source version is immutable;
- every source version has a manifest;
- every access-unit ref resolves through a manifest;
- every index projection has required source link fields;
- every index projection follows content-minimal policy;
- every queryable field is in an explicit mapping;
- every typed attribute uses the declared value type;
- every evidence bundle can fetch exact source units;
- every trace event references existing run/task/artifact refs where applicable.

## Failure Modes

| Failure | Required behavior |
| --- | --- |
| missing source object | block evidence fetch and emit validation failure |
| storage permission failure | return typed permission error, not `exists = false` |
| path traversal attempt | reject path before local filesystem access |
| local absolute path leaked into durable artifact | fail validation unless explicitly allowed |
| string storage used for binary media | reject or route to byte storage |
| S3 `etag` treated as source hash | fail validation; source hash must be explicit SHA-256 |
| OS projection used as answer evidence | fail verification; exact evidence must come from source storage |
| hash mismatch | quarantine source version or block promotion |
| missing manifest | block ingest-to-understand handoff |
| unresolved access unit | block evidence bundle creation |
| dynamic index field | reject projection write |
| full content in projection | reject projection write |
| stale projection current flag | fail current retrieval validation |
| inactive projection used as current evidence | fail verification |
| media parser emits unsupported locator | store as review issue, not active evidence |

## Acceptance Criteria

This spec is ready when:

- storage layers and ownership are clear;
- `StorageSupportable<T = Buffer>` is defined for local, S3-compatible, and OS/OpenSearch-compatible adapters;
- `StorageObjectMeta` is common metadata and provider implementations are named with suffixes such as `StorageObjectMetaOS` and `StorageObjectMetaLocal`;
- buffer/string compatibility for Markdown and JSON is explicit;
- source object store is confirmed as evidence source of truth;
- OpenSearch-compatible index is confirmed as retrieval map only;
- required projection fields are defined;
- content-minimal indexing rules are explicit;
- lifecycle/status behavior is separated from source versions;
- media extension constraints are clear;
- ID policy implications are listed;
- validation and failure behavior are defined.
