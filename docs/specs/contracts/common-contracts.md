# Spec: Common Contracts And IDs

This spec defines the shared P0 contracts used by all implementation-near specs.

It follows [Storage And Indexing Contract](../stores/storage-indexing-contract.md).

Storage and indexing boundaries decide which IDs and refs must exist.

## Purpose

Define common contracts for:

- ID families;
- ref string format;
- source hash and version policy;
- timestamps, schema versions, and statuses;
- naming convention;
- result and error shapes;
- provenance;
- validation summary;
- TypeScript export structure;
- JSON compatibility;
- contract migration and versioning.

## Scope

This spec defines code-facing TypeScript contracts.

TypeScript fields use `camelCase`.

Persisted JSON, OpenSearch-compatible documents, and source records use `snake_case`.

Mapping between the two belongs to adapter or serializer boundaries.

## Non-Goals

- No runtime implementation.
- No full JSON Schema file.
- No OpenSearch mapping file.
- No agent-specific payload shape.
- No media-specific access-unit shape.

## Naming Convention

This rule is mandatory.

| Layer | Field style | Example |
| --- | --- | --- |
| TypeScript code | `camelCase` | `sourceVersionId`, `createdAt`, `byteSize` |
| Persisted JSON | `snake_case` | `source_version_id`, `created_at`, `byte_size` |
| OpenSearch-compatible projection | `snake_case` | `index_document_id`, `source_content_hash` |

Code-facing types in this spec use `camelCase`.

Persisted examples use `snake_case`.

Do not mix the two in one contract unless the type explicitly models raw JSON.

## Primitive Types

```ts
export type IsoDateTime = string;
export type SchemaVersion = string;
export type MediaType = string;
export type MediaHint =
  | "md"
  | "txt"
  | "json"
  | "pdf"
  | "jpg"
  | "png"
  | "wav"
  | "mp4"
  | "code"
  | string;

export type HashAlgorithm = "sha256";
export type ContentHash = `sha256:${string}`;
export type HashPrefix = `sha256_${string}`;
```

Rules:

- timestamps use ISO 8601 strings;
- SHA-256 is the default hash algorithm;
- `ContentHash` stores the full hash;
- `HashPrefix` may appear in readable IDs but is not collision-proof;
- media hints are routing/readability hints, not authoritative MIME type.

## ID Families

Every ID belongs to one family.

Do not reuse one ID to represent multiple layers.

```ts
export type RepositoryId = string;
export type SourceId = string;
export type SourceVersionId = string;
export type SourceManifestId = string;
export type AccessUnitId = string;
export type PreviewArtifactId = string;
export type ArtifactId = string;
export type HandoffId = string;
export type RunId = string;
export type SessionId = string;
export type TaskId = string;
export type TraceEventId = string;
export type CandidateId = string;
export type RelationId = string;
export type EvidenceId = string;
export type LifecycleEventId = string;
export type IndexDocumentId = string;
export type TaxonomyBundleId = string;
export type TaxonomyVersion = string;
```

Required distinction:

| ID | Represents | Must not represent |
| --- | --- | --- |
| `SourceId` | logical source identity | immutable bytes |
| `SourceVersionId` | immutable source bytes | current pointer |
| `SourceManifestId` | parser/access-unit view of one source version | source bytes |
| `AccessUnitId` | retrievable source unit under one manifest | source version |
| `ArtifactId` | stage output payload | source object |
| `HandoffId` | stage transition contract | full artifact payload |
| `IndexDocumentId` | OpenSearch-compatible projection id | source truth |
| `EvidenceId` | evidence item inside an evidence bundle | raw source path |
| `TraceEventId` | audit event | artifact payload |

## ID Shape Policy

IDs should be deterministic when they identify derived or projected objects.

IDs may be assigned when they identify workflow objects.

Recommended shapes:

```text
repo_{slug_or_ulid}
src_{assigned_or_path_hash}
srcv_{media_hint}_{hash_prefix}
manifest_{source_version_id}_{parser_policy_hash}
au_{kind}_{locator_scope_hash}
preview_{kind}_{source_version_id}_{generator_hash}
artifact_{stage}_{ulid}
handoff_{from_stage}_{to_stage}_{ulid}
run_{ulid}
session_{ulid}
task_{stage}_{ulid}
trace_{ulid}
candidate_{kind}_{ulid}
relation_{kind}_{ulid}
evidence_{ulid}
life_{kind}_{ulid}
kp:{repository_id}:{document_kind}:{media_hint}:{hash_prefix}:{scope}
```

Rules:

- source versions are content-addressed;
- source IDs remain stable across source versions;
- access-unit IDs are stable within source version, parser policy, and locator policy;
- index document IDs are projection IDs;
- run, task, handoff, artifact, and trace IDs may use ULIDs;
- never use filename, title, or generated summary as the only durable ID.

## Ref Strings

Refs are typed pointers across stores and artifacts.

Use refs when one object needs to point to another without embedding the full payload.

```ts
export type RefKind =
  | "repository"
  | "source"
  | "sourceVersion"
  | "manifest"
  | "accessUnit"
  | "preview"
  | "artifact"
  | "handoff"
  | "run"
  | "session"
  | "task"
  | "trace"
  | "candidate"
  | "relation"
  | "evidence"
  | "lifecycle"
  | "indexDocument"
  | "taxonomy";

export type RefString = `${RefKind}:${string}`;
```

Recommended examples:

```text
source:src_path_a91c72
sourceVersion:srcv_md_sha256_ab12cd34ef90
manifest:manifest_srcv_md_sha256_ab12cd34ef90_parser_v1
accessUnit:srcv_md_sha256_ab12cd34ef90#au_section_intro
artifact:artifact_ingest_01HXYZ
indexDocument:kp:repo_main:source:md:sha256_ab12cd34ef90:root
```

Rules:

- every ref must include a kind prefix;
- refs must be resolvable through a declared store or artifact;
- refs should not embed full source text or generated rationale;
- a ref to an access unit must remain resolvable while retained evidence points to it;
- `indexDocument` refs resolve projections, not exact evidence.

## Source Hash And Version Policy

```ts
export interface SourceHash {
  algorithm: HashAlgorithm;
  value: ContentHash;
  prefix: HashPrefix;
  byteSize: number;
}

export interface SourceVersionIdentity {
  sourceId: SourceId;
  sourceVersionId: SourceVersionId;
  contentHash: ContentHash;
  hashAlgorithm: HashAlgorithm;
  mediaType: MediaType;
  mediaHint: MediaHint;
}
```

Rules:

- source byte changes create a new `SourceVersionId` when the full hash is new to the repository;
- metadata changes do not create a new source version;
- taxonomy changes do not create a new source version;
- parser policy changes create new manifests and access units, not new source versions;
- reverting to an existing full hash reuses the existing source version;
- source hash validation happens before promoting a version to current.

## Common Status Types

```ts
export type LifecycleStatus =
  | "current"
  | "superseded"
  | "hidden"
  | "archived"
  | "quarantined"
  | "retracted"
  | "deleted"
  | "purged";

export type ProjectionStatus =
  | "active"
  | "hidden"
  | "tombstoned"
  | "archived"
  | "quarantined"
  | "retracted"
  | "deleted"
  | "purged";

export type ValidationStatus =
  | "passed"
  | "passedWithWarnings"
  | "failed"
  | "notRun";
```

Persisted JSON uses:

```json
{
  "version_status": "current",
  "projection_status": "active",
  "validation_status": "passed"
}
```

## Result And Error Shapes

Runtime functions should return typed results instead of throwing unstructured strings across module boundaries.

```ts
export type Result<T, E extends ContractError = ContractError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type ErrorSeverity = "info" | "warning" | "error" | "fatal";

export type ErrorCode =
  | "invalidInput"
  | "invalidId"
  | "invalidRef"
  | "unresolvedRef"
  | "missingSourceObject"
  | "hashMismatch"
  | "schemaValidationFailed"
  | "storagePermissionDenied"
  | "toolPermissionDenied"
  | "mappingViolation"
  | "contentPolicyViolation"
  | "insufficientEvidence"
  | "conflictDetected"
  | "unsupportedMedia"
  | "providerFailure"
  | "unknownFailure";

export interface ContractError {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  ref?: RefString;
  cause?: unknown;
  retryable?: boolean;
  createdAt: IsoDateTime;
}
```

Rules:

- module boundaries return `Result` for expected failures;
- fatal unexpected failures may still throw inside implementations, but must be converted before crossing the boundary;
- error codes use `camelCase` in TypeScript;
- persisted error records use `snake_case`.

## Provenance

Provenance records where an object came from and which refs support it.

```ts
export type ProvenanceKind =
  | "source"
  | "parser"
  | "tool"
  | "agent"
  | "model"
  | "human"
  | "system";

export interface Provenance {
  kind: ProvenanceKind;
  createdBy: string;
  createdAt: IsoDateTime;
  inputRefs: RefString[];
  sourceRefs: RefString[];
  artifactRefs: RefString[];
  toolRefs?: RefString[];
  modelRef?: string;
  policyRefs?: RefString[];
}
```

Rules:

- artifacts must include provenance;
- update candidates must include evidence/source provenance;
- model outputs must not become durable truth without source refs;
- OpenSearch-compatible projections must preserve source and manifest refs.

## Validation Summary

```ts
export interface ValidationIssue {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  ref?: RefString;
  path?: string;
}

export interface ValidationSummary {
  status: ValidationStatus;
  schemaVersion: SchemaVersion;
  validatedAt: IsoDateTime;
  validatorId: string;
  issues: ValidationIssue[];
}
```

Rules:

- every artifact has a validation summary;
- handoffs with failed validation must not move to the next stage;
- index projections with content-policy violations must not be written as active projections;
- validation paths use code-facing `camelCase` when describing TypeScript objects and persisted `snake_case` when describing raw JSON.

## TypeScript Export Structure

Future implementation should group common contracts as:

```text
src/contracts/common/
  ids.ts
  refs.ts
  hash.ts
  status.ts
  result.ts
  errors.ts
  provenance.ts
  validation.ts
  naming.ts
  index.ts
```

Rules:

- common contracts must not import stage-specific contracts;
- stage-specific contracts may import common contracts;
- adapter contracts may import common IDs, refs, result, provenance, and validation;
- raw JSON mapper types should be isolated from code-facing contracts.

## JSON Compatibility

All common contracts must serialize to JSON-compatible values.

Allowed values:

- string;
- number;
- boolean;
- null;
- arrays;
- plain objects.

Avoid in persisted contracts:

- `Date` objects;
- `Map`;
- `Set`;
- functions;
- class instances;
- `undefined`.

Serialization rules:

- omit optional fields rather than writing `undefined`;
- represent timestamps as ISO strings;
- represent binary content as object storage refs, not inline buffers;
- represent hashes as strings;
- convert TypeScript `camelCase` keys to persisted `snake_case` keys at the boundary.

## Contract Versioning

Every persisted object must carry a schema version.

```ts
export interface VersionedContract {
  schemaVersion: SchemaVersion;
}
```

Rules:

- additive optional fields may bump patch version;
- required fields or enum changes must bump minor or major version;
- persisted migrations must be explicit;
- readers should reject unsupported major versions;
- writers should produce the latest supported version;
- index projections include `index_document_version` in persisted JSON.

## Acceptance Criteria

This spec is ready when:

- ID families are separated by storage/indexing boundary;
- ref strings are typed and resolvable;
- source hash/version policy follows source object storage rules;
- timestamp, schema version, and status conventions are explicit;
- naming boundary is explicit;
- `Result` and error shapes are defined;
- provenance is defined;
- validation summary is defined;
- TypeScript export structure is defined;
- JSON compatibility rules are defined;
- contract versioning and migration rules are defined.
