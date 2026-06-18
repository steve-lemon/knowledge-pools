# Index ID Policy

This document defines identifier policy for source storage, manifests, access units, preview artifacts, and OpenSearch-compatible index documents.

## Core Principle

IDs should be deterministic, stable, scoped, and traceable.

Use content hashes for immutability and deduplication. Use media type or extension as a routing and readability hint, not as the source of truth.

Do not rely on filenames, titles, or generated summaries as primary IDs.

## ID Layers

The system should keep these IDs separate:

| Layer | Purpose | Stability |
| --- | --- | --- |
| `repository_id` | Logical repository boundary | Stable across repository lifetime |
| `source_id` | Logical source identity | Stable across source versions |
| `source_version_id` | Immutable source version | Changes when source bytes change |
| `object_key` | Physical object storage path | May move if storage layout changes |
| `access_unit_id` | Retrievable source part | Stable within one source version and parser policy |
| `preview_artifact_id` | Derived preview object | Stable for source version, generator, and config |
| `index_document_id` | OpenSearch `_id` | Stable for a projected indexed document |

OpenSearch `_id` should not be the only durable system identifier. It is a projection identifier.

## Recommended ID Shape

Use a readable, deterministic compound ID:

```text
kp:{repository_id}:{document_kind}:{media_hint}:{hash_prefix}:{scope_hash}
```

Examples:

```text
kp:repo_main:source:md:sha256_ab12cd34ef90:root
kp:repo_main:access_unit:pdf:sha256_ab12cd34ef90:page_001_block_003
kp:repo_main:preview:jpg:sha256_ab12cd34ef90:thumb_v1
kp:repo_main:entity:json:sha256_ab12cd34ef90:ent_claim_01
```

Where:

- `kp` is the namespace prefix;
- `repository_id` prevents future cross-repository collisions;
- `document_kind` describes the indexed projection. In index documents this should match `index_document_type`;
- `media_hint` is a normalized extension or compact media type hint;
- `hash_prefix` comes from the canonical source or derived object hash;
- `scope_hash` or scope id identifies the specific unit, preview, or graph candidate.

## Hash Policy

Use SHA-256 by default.

Store the full hash in metadata:

```json
{
  "hash_algorithm": "sha256",
  "content_hash": "sha256:...",
  "content_hash_prefix": "sha256_ab12cd34ef90"
}
```

The ID may use a short prefix for readability, but the indexed document must store the full hash for collision checks.

Rules:

- compute hashes from canonical bytes;
- include parser or generator config hashes for derived objects when output depends on configuration;
- never treat a hash prefix as globally collision-proof;
- reject or disambiguate if two full hashes share the same prefix inside one repository.

## Media Hint and Extension Policy

Including a type or extension hint is useful.

Recommended hints:

- `md`
- `pdf`
- `jpg`
- `png`
- `wav`
- `mp4`
- `json`
- `code`
- `txt`

The hint should be derived from validated media type detection, not only from the original filename.

Rules:

- keep `media_type` as the authoritative field;
- keep original filename and extension as metadata;
- use normalized extension only as an ID hint;
- do not change identity only because a file extension was renamed;
- if media detection conflicts with filename extension, preserve both and mark a validation warning.

## Source IDs

`source_id` represents logical source identity.

It should be assigned once and then remain stable across source versions.

Recommended options:

```text
src_{ulid}
src_{normalized_path_hash}
```

Use path-derived or assigned IDs when the source is expected to update over time.

Content-derived source IDs are acceptable only for immutable imports where the same bytes should be treated as the same logical source:

```text
src_{media_hint}_{hash_prefix}
```

Example:

```text
src_pdf_sha256_ab12cd34ef90
```

If the same source path receives new bytes, keep `source_id` and create a new `source_version_id`.

If the same bytes are imported from a different path, either:

- reuse the existing source version and add another source alias; or
- create a separate source record that points to the same content hash.

The first implementation should use the simpler rule: same repository and same full content hash means same immutable source version. Whether that source version is attached to one or many logical source records is a source-alias decision, not a hash decision.

## Source Version Lifecycle

Original source updates are expected.

The ID policy must support repeated updates without losing old evidence.

Recommended model:

```text
source_id = logical source identity
source_version_id = immutable content version
current_source_version_id = pointer to the active version
```

Example:

```json
{
  "source_id": "src_path_a91c72",
  "current_source_version_id": "srcv_md_sha256_2222bbbbcccc",
  "versions": [
    {
      "source_version_id": "srcv_md_sha256_1111aaaabbbb",
      "content_hash": "sha256:1111...",
      "version_status": "superseded"
    },
    {
      "source_version_id": "srcv_md_sha256_2222bbbbcccc",
      "content_hash": "sha256:2222...",
      "version_status": "current"
    }
  ]
}
```

Rules:

- keep `source_id` stable for the logical source;
- create a new `source_version_id` whenever source bytes change to a content hash not already known in the repository;
- reuse the existing `source_version_id` when a source reverts to a previously seen full content hash;
- update `current_source_version_id` only after the new version is fully ingested and validated;
- never mutate old source-version objects in place;
- keep old source versions addressable while any evidence refs point to them;
- mark old versions as `superseded`, not deleted, unless retention or compliance policy requires removal.

## Version Update Risks

Source versioning creates operational risks that must be handled explicitly.

| Risk | Cause | Policy |
| --- | --- | --- |
| stale retrieval | old index projections remain active | active queries should filter by `version_status = current` unless history is requested |
| broken evidence refs | old access units are removed | keep old manifests and access units for retained versions |
| duplicate search results | multiple versions index similar content | collapse by `source_id` for current-state queries |
| unstable access unit IDs | parser output changes between versions | scope access unit IDs to `source_version_id` and parser policy |
| preview drift | preview regenerated from newer bytes | preview IDs must include source version and generator config |
| hash reappearance | a source reverts to older content | reuse existing immutable source version and move current pointer |
| race condition | query sees partial ingest | switch current pointer or active alias only after validation completes |
| storage growth | every version keeps derived objects | apply retention to superseded versions after evidence policy review |

## Current vs Historical Queries

Retrieval must distinguish current-state queries from historical queries.

Current-state query:

```text
source_id = src_path_a91c72
version_status = current
```

Historical query:

```text
source_id = src_path_a91c72
include_superseded = true
```

Default behavior:

- user asks "현재", "latest", or no time scope: search current versions first;
- user asks "이전", "history", "why changed", or cites an old evidence ref: allow superseded versions;
- verification should warn when an answer uses superseded evidence as if it were current.

## Source Version IDs

`source_version_id` should be content-addressed:

```text
srcv_{media_hint}_{hash_prefix}
```

Example:

```text
srcv_pdf_sha256_ab12cd34ef90
```

Changing source bytes creates a new source version when the resulting full content hash is new to the repository.

If the resulting full content hash already exists, reuse that immutable source version and update the current pointer.

Changing taxonomy classification does not create a new source version.

Changing parser policy creates new manifests, access units, and index projections, but not a new source version unless source bytes changed.

## Access Unit IDs

Access units should be stable within:

- source version;
- parser version;
- locator policy version.

Recommended shape:

```text
au_{kind}_{locator_scope}
```

Examples:

```text
au_markdown_section_001
au_pdf_page_001_block_003
au_image_region_a91c72
au_audio_12000_28000
```

For structured locators, use the natural locator when it is stable. For complex locators, use a hash of canonical locator JSON.

```text
au_image_region_{sha256(locator_json)[0:12]}
```

The full locator must remain in the manifest.

## Preview Artifact IDs

Preview artifact identity depends on:

- source version;
- preview kind;
- generator name;
- generator version;
- generator config;
- target access unit or source version.

Recommended shape:

```text
prev_{preview_kind}_{generator_version}_{target_scope}
```

Examples:

```text
prev_outline_v1_root
prev_thumb_v1_320
prev_waveform_v1_root
prev_pdf_page_thumb_v1_page_001
```

The object metadata should store:

- `preview_artifact_id`;
- `derived_from`;
- `content_hash`;
- `generator`;
- `generator_version`;
- `generator_config_hash`;
- `media_type`;
- `object_uri`;
- `access_policy`.

## OpenSearch Index Document IDs

OpenSearch `_id` should be deterministic and idempotent.

Recommended shape:

```text
kp:{repository_id}:{index_document_type}:{media_hint}:{source_version_hash_prefix}:{projection_scope}
```

Examples:

```text
kp:repo_main:source:md:sha256_ab12cd34ef90:root
kp:repo_main:access_unit:pdf:sha256_ab12cd34ef90:page_001_block_003
kp:repo_main:preview:jpg:sha256_ab12cd34ef90:thumb_320
kp:repo_main:relation:md:sha256_ab12cd34ef90:rel_001
```

`projection_scope` may be:

- `root`;
- access unit id;
- preview artifact id;
- entity candidate id;
- relation candidate id;
- hash of canonical projection metadata.

Every OpenSearch projection should include:

- `source_id`;
- `source_version_id`;
- `version_status`;
- `is_current`;
- `supersedes_source_version_id` when applicable;
- `superseded_by_source_version_id` when applicable.

For current-state aliases or filtered queries, `is_current = true` should be the default filter.

## Update Behavior

When source bytes change:

- create a new source version id;
- regenerate manifest if needed;
- regenerate access units if parser output changes;
- regenerate preview artifacts;
- create new index document IDs for the new source version;
- mark old index projections as superseded or remove them from active aliases;
- update the current pointer only after the new projections pass validation.

When taxonomy changes:

- keep source version id;
- keep preview artifact ids unless generation depends on taxonomy;
- create new classification and graph projection documents;
- include taxonomy bundle id and version in the index document.

When preview generator changes:

- keep source version id;
- create new preview artifact ids;
- update preview refs in index projections;
- keep old preview artifacts until retention policy removes them.

## Collision and Validation Rules

On ingest:

1. Compute full source hash.
2. Detect media type.
3. Normalize media hint.
4. Check whether the full hash already exists in the repository.
5. Create or reuse source version.
6. Generate deterministic IDs for access units and previews.
7. Validate that every index document has source, version, manifest, and access-unit or preview refs.

Reject or warn when:

- hash prefix collides;
- filename extension and detected media type disagree;
- an index document lacks a source hash;
- an access unit id cannot be traced to a manifest;
- a preview lacks `derived_from`;
- an OpenSearch `_id` would change across repeated ingest of the same source and same policies.

## Minimal V1 Rule

For the first implementation:

```text
id = kp:{repository_id}:{index_document_type}:{media_hint}:{source_hash_prefix}:{scope}
```

Store full hashes and exact locators in the document body.

This gives the system deterministic IDs now while leaving room for future multi-repository and clustered indexing.
