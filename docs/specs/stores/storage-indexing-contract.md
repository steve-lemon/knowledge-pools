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
- source object store is confirmed as evidence source of truth;
- OpenSearch-compatible index is confirmed as retrieval map only;
- required projection fields are defined;
- content-minimal indexing rules are explicit;
- lifecycle/status behavior is separated from source versions;
- media extension constraints are clear;
- ID policy implications are listed;
- validation and failure behavior are defined.
