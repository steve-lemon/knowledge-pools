# Spec: Local Store Layout

This spec defines the local filesystem layout for Markdown-first validation.

It implements:

- [Storage And Indexing Contract](storage-indexing-contract.md)
- [Common Contracts And IDs](../contracts/common-contracts.md)

It is a specification, not a request to create runtime directories now.

## Purpose

Define where local development stores:

- repository config;
- original sources;
- immutable source versions;
- source manifests;
- derived and preview artifacts;
- stage artifacts;
- handoffs;
- runs, sessions, and tasks;
- append-only traces;
- taxonomy bundles;
- OpenSearch-compatible projection fixtures;
- fixtures and expected outputs.

## Scope

This layout is for a single logical repository.

The backing implementation is local filesystem storage through `StorageSupportable<Buffer, StorageObjectMetaLocal>`.

The shape should remain compatible with later S3-compatible object storage and OpenSearch-compatible projection storage.

## Non-Goals

- No real OpenSearch index.
- No S3 bucket layout.
- No database schema.
- No multi-repository federation.
- No media-specific derived object implementation.
- No physical cleanup automation.

## Naming Convention

Path segments should be lowercase kebab-case or stable IDs.

Persisted JSON fields use `snake_case`.

TypeScript code uses `camelCase`.

Do not use display titles as path segments.

## Local Root

The default local data root is:

```text
knowledge/
```

The root must be configurable.

Recommended config key:

```json
{
  "repository_id": "repo_main",
  "local_data_root": "knowledge"
}
```

Code-facing config type:

```ts
export interface LocalStoreConfig {
  repositoryId: RepositoryId;
  localDataRoot: StoragePath;
}
```

Rules:

- all runtime-written local data stays under `localDataRoot`;
- local adapters must reject path traversal before filesystem access;
- absolute local paths must not be persisted in artifacts, manifests, or index projections by default;
- persisted records should use repository-scoped logical paths.

## Root Layout

```text
knowledge/
  repository.json
  sources/
  artifacts/
  handoffs/
  runs/
  sessions/
  tasks/
  traces/
  taxonomy/
  index-projections/
  fixtures/
  quarantine/
  tombstones/
```

## Repository Metadata

```text
knowledge/repository.json
```

Purpose:

- identify repository boundary;
- declare schema version;
- declare active taxonomy bundle;
- declare local layout version.

Persisted JSON shape:

```json
{
  "schema_version": "0.1.0",
  "repository_id": "repo_main",
  "layout_version": "0.1.0",
  "active_taxonomy_bundle_id": "knowledge-pools-core",
  "active_taxonomy_version": "0.1.0",
  "created_at": "2026-06-20T00:00:00Z",
  "updated_at": "2026-06-20T00:00:00Z"
}
```

## Source Storage Layout

Source layout:

```text
knowledge/sources/
  {source_id}/
    source.json
    current.json
    versions/
      {source_version_id}/
        original
        source-version.json
        manifest.json
        derived/
        previews/
```

Examples:

```text
knowledge/sources/src_path_a91c72/source.json
knowledge/sources/src_path_a91c72/current.json
knowledge/sources/src_path_a91c72/versions/srcv_md_sha256_ab12cd34/original.md
knowledge/sources/src_path_a91c72/versions/srcv_md_sha256_ab12cd34/source-version.json
knowledge/sources/src_path_a91c72/versions/srcv_md_sha256_ab12cd34/manifest.json
```

Rules:

- `source.json` owns logical source identity;
- `current.json` is a small pointer to the current source version;
- `versions/{source_version_id}/` is immutable after validation;
- `original` may include an extension when useful for local inspection;
- source version metadata must store the authoritative media type;
- old source versions remain addressable while any evidence ref points to them;
- parser-policy changes create new manifests, not new source versions.

## Source Record Files

`source.json` persisted JSON:

```json
{
  "schema_version": "0.1.0",
  "repository_id": "repo_main",
  "source_id": "src_path_a91c72",
  "source_kind": "file",
  "display_name": "vision.md",
  "source_aliases": [],
  "current_source_version_id": "srcv_md_sha256_ab12cd34",
  "created_at": "2026-06-20T00:00:00Z",
  "updated_at": "2026-06-20T00:00:00Z"
}
```

`current.json` persisted JSON:

```json
{
  "schema_version": "0.1.0",
  "source_id": "src_path_a91c72",
  "current_source_version_id": "srcv_md_sha256_ab12cd34",
  "promoted_at": "2026-06-20T00:00:00Z",
  "validation_ref": "artifact:artifact_ingest_01HXYZ"
}
```

## Source Version Files

`source-version.json` persisted JSON:

```json
{
  "schema_version": "0.1.0",
  "repository_id": "repo_main",
  "source_id": "src_path_a91c72",
  "source_version_id": "srcv_md_sha256_ab12cd34",
  "version_status": "current",
  "object_path": "knowledge/sources/src_path_a91c72/versions/srcv_md_sha256_ab12cd34/original.md",
  "media_type": "text/markdown",
  "media_hint": "md",
  "hash_algorithm": "sha256",
  "content_hash": "sha256:ab12cd34...",
  "byte_size": 1234,
  "created_at": "2026-06-20T00:00:00Z"
}
```

Rules:

- `content_hash` is full SHA-256;
- `byte_size` is observed byte size;
- provider ETags are not source hashes;
- source version records are immutable except lifecycle/status fields managed by policy.

## Manifest Layout

Manifest path:

```text
knowledge/sources/{source_id}/versions/{source_version_id}/manifest.json
```

Purpose:

- connect source version to access units;
- locate bounded evidence;
- list derived objects and preview refs.

Rules:

- every source version must have one active manifest;
- old manifests remain addressable when referenced;
- manifest fields use persisted `snake_case`;
- access-unit IDs are scoped to source version and parser policy.

## Derived And Preview Layout

```text
knowledge/sources/{source_id}/versions/{source_version_id}/derived/
knowledge/sources/{source_id}/versions/{source_version_id}/previews/
```

Markdown-first examples:

```text
derived/outline.json
previews/summary.json
```

Rules:

- previews are derived artifacts, not source truth;
- long summaries should live here or in artifact storage, not in index projections;
- derived files must include generator metadata and source refs;
- binary previews must use `Buffer` storage.

## Artifact Store Layout

```text
knowledge/artifacts/
  ingest/
  understand/
  connect/
  plan/
  retrieve/
  reason/
  verify/
  update/
  curation/
  evaluate/
  validation/
```

Artifact path:

```text
knowledge/artifacts/{stage}/{artifact_id}.json
```

Rules:

- artifact files are JSON-compatible;
- every artifact has metadata, payload, provenance, and validation summary;
- artifact payloads should reference source-sized content instead of embedding it;
- artifact IDs may use ULIDs;
- artifact writes are append-oriented by default.

## Handoff Store Layout

```text
knowledge/handoffs/
  {from_stage}-{to_stage}/
    {handoff_id}.json
```

Example:

```text
knowledge/handoffs/ingest-understand/handoff_ingest_understand_01HXYZ.json
```

Rules:

- handoffs reference artifacts and required next-stage inputs;
- handoffs must not duplicate long artifact payloads;
- failed handoff validation blocks stage transition.

## Run, Session, And Task Layout

```text
knowledge/runs/{run_id}/run.json
knowledge/runs/{run_id}/tasks/{task_id}.json
knowledge/runs/{run_id}/artifacts.json
knowledge/runs/{run_id}/handoffs.json
knowledge/sessions/{session_id}/session.json
knowledge/tasks/{task_id}.json
```

Rules:

- `run.json` is the workflow execution index;
- task records may be duplicated by ref under run and task stores only if refs remain consistent;
- sessions store continuity refs, not raw stage payloads;
- runs do not decide durable truth.

## Trace Store Layout

Append-only traces:

```text
knowledge/traces/
  runs/
    {run_id}.jsonl
  tools/
    {run_id}.jsonl
```

Rules:

- trace files are append-only JSON Lines;
- each line is one trace event;
- trace events use persisted `snake_case`;
- traces reference artifacts, handoffs, tasks, tools, and source refs;
- traces do not replace artifacts.

## Taxonomy Store Layout

```text
knowledge/taxonomy/
  bundles/
    {taxonomy_bundle_id}/
      {taxonomy_version}/
        taxonomy.json
        attributes.json
        relations.json
        migrations/
```

Rules:

- taxonomy bundles are read-only during normal stage execution;
- taxonomy changes require explicit evolution workflow;
- unknown taxonomy attributes are rejected or stored as review issues.

## OpenSearch-Compatible Projection Fixture Layout

Local projection fixtures:

```text
knowledge/index-projections/
  mappings/
    opensearch-v1.json
  documents/
    source/
    access-unit/
    preview/
    ingest-artifact/
    shallow-candidate/
    knowledge-candidate/
    relation-candidate/
```

Projection path:

```text
knowledge/index-projections/documents/{index_document_type}/{index_document_id}.json
```

Rules:

- projection files are OpenSearch-compatible JSON;
- projection fields use `snake_case`;
- projection files must follow content-minimal index policy;
- full source content must not be stored here;
- exact evidence must be fetched from source storage using manifest and access-unit refs;
- local projection documents should be shaped so they can later be sent to OS/OpenSearch.

## Fixture Layout

```text
knowledge/fixtures/
  markdown/
    inputs/
    expected/
      ingest/
      understand/
      connect/
      plan/
      retrieve/
      reason/
      verify/
      update/
      curation/
      evaluate/
```

Rules:

- fixture inputs are stable and reviewed;
- expected outputs are JSON-compatible;
- fixture expected outputs may use partial match rules only when explicitly documented;
- Markdown-first regression fixtures must remain valid before media expansion.

## Quarantine And Tombstone Layout

```text
knowledge/quarantine/
  sources/
  projections/
  artifacts/
knowledge/tombstones/
  sources/
  projections/
  records/
```

Rules:

- quarantine hides or blocks bad data before physical deletion;
- tombstones record intentional deletion or hiding events;
- normal retrieval excludes quarantined and tombstoned projections;
- audit retrieval may inspect them when explicitly authorized.

## Read, Write, And Overwrite Policy

| Store | Default write mode | Overwrite allowed? |
| --- | --- | --- |
| Source version original | write once | No |
| Source version metadata | write once, status policy exception | No for identity fields |
| Source manifest | write once per parser policy | No, create a new manifest on parser-policy change |
| Derived/previews | write once per source version and generator config | No, create new derived id |
| Artifacts | append/write once | No |
| Handoffs | append/write once | No |
| Run/session/task records | update status and refs | Yes, controlled |
| Trace files | append only | No line mutation |
| Taxonomy bundles | read-only during runtime | No |
| Projection fixtures | replace only through index projection tool | Yes, controlled |
| Quarantine/tombstones | append/write once | No |

## Path Resolution Rules

Code-facing paths use `StoragePath`.

Persisted paths are logical repository-scoped paths.

Rules:

- local adapter maps logical paths to filesystem paths under `localDataRoot`;
- local adapter rejects `../` traversal;
- local adapter should normalize path separators;
- durable records should not store absolute paths by default;
- OS/OpenSearch projection paths use `os://` logical refs only after projection contracts are stable.

## Acceptance Criteria

This spec is ready when:

- local data root and config behavior are defined;
- source storage layout is defined;
- source version layout is defined;
- manifest layout is defined;
- artifact layout is defined;
- run/session/task layout is defined;
- append-only trace layout is defined;
- taxonomy bundle layout is defined;
- OpenSearch-compatible projection fixture layout is defined;
- fixture and expected-output layout is defined;
- read/write/overwrite policy is defined;
- quarantine and tombstone layout is defined.
