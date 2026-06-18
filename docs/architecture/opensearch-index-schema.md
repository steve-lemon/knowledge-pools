# OpenSearch Index Schema

This document defines the v1 OpenSearch-compatible storage schema for Knowledge Pools.

The goal is to make index documents searchable without turning OpenSearch into the source of truth.

## Core Rule

The same field name must always have the same OpenSearch data type.

This is non-negotiable.

Do not index arbitrary JSON objects with uncontrolled dynamic mappings.

Especially avoid:

```json
{
  "attribute_values": {
    "confidence": 0.82,
    "source_type": "markdown",
    "valid_from": "2026-06-19"
  }
}
```

That shape is convenient, but it can create mapping conflicts if the same attribute key is later sent with a different value type.

Instead, store runtime attributes in a typed attribute array.

## Schema Posture

Use explicit mappings.

Recommended index setting:

```json
{
  "mappings": {
    "dynamic": "strict"
  }
}
```

For fields that must keep arbitrary shape but should not be queried, use disabled object fields:

```json
{
  "raw_locator": {
    "type": "object",
    "enabled": false
  }
}
```

Do not allow OpenSearch to infer schema from the first document it sees.

## Index Families

V1 may start with one physical index or fixture file, but documents should be shaped as if they belong to these logical families:

| Family | Purpose |
| --- | --- |
| `source` | source-level records |
| `access_unit` | retrievable source units |
| `preview` | preview artifact projections |
| `ingest_artifact` | ingest run outputs |
| `shallow_candidate` | parser-visible ingest candidates |
| `knowledge_candidate` | understand-stage candidates |
| `relation_candidate` | proposed relations |

The field `index_document_type` identifies the projection type.

## Required Base Fields

Every indexed document should include these fields with stable types:

| Field | Type | Notes |
| --- | --- | --- |
| `index_document_id` | `keyword` | Also used as OpenSearch `_id` |
| `index_document_type` | `keyword` | `source`, `access_unit`, `preview`, etc. |
| `index_document_version` | `keyword` | Projection schema version |
| `repository_id` | `keyword` | Logical repository boundary |
| `source_id` | `keyword` | Logical source id |
| `source_version_id` | `keyword` | Immutable source version id |
| `source_version` | `keyword` | Human-readable source version label |
| `version_status` | `keyword` | `current`, `superseded`, `hidden`, `tombstoned`, `archived`, `quarantined`, `retracted`, `deleted`, or `purged` |
| `is_current` | `boolean` | Default filter for current-state retrieval |
| `projection_status` | `keyword` | `active`, `hidden`, `tombstoned`, `archived`, `quarantined`, `retracted`, `deleted`, or `purged` |
| `rollback_event_id` | `keyword` | Rollback event that changed this projection, when applicable |
| `tombstone_id` | `keyword` | Tombstone marker when content was hidden or deleted |
| `supersedes_source_version_id` | `keyword` | Previous version ref when applicable |
| `superseded_by_source_version_id` | `keyword` | Newer version ref when applicable |
| `source_uri` | `keyword` | Object store URI or path |
| `source_content_hash` | `keyword` | Full source hash |
| `media_type` | `keyword` | Authoritative MIME-like type |
| `media_hint` | `keyword` | Compact hint such as `md`, `pdf`, `mp4` |
| `taxonomy_bundle_id` | `keyword` | Taxonomy bundle id |
| `taxonomy_version` | `keyword` | Taxonomy bundle version |
| `category_ids` | `keyword[]` | Taxonomy category ids |
| `source_manifest_ref` | `keyword` | Manifest reference |
| `access_unit_refs` | `keyword[]` | References to access units |
| `evidence_refs` | `keyword[]` | Evidence references |
| `preview_refs` | `keyword[]` | Preview artifact references |
| `derived_object_refs` | `keyword[]` | Derived object references |
| `summary_ref` | `keyword` | Summary artifact reference |
| `wiki_signal_refs` | `keyword[]` | Wiki signal references |
| `outgoing_link_titles` | `keyword[]` | Extracted wiki-style outgoing link titles |
| `tag_values` | `keyword[]` | Extracted tag values |
| `created_at` | `date` | Projection creation time |
| `updated_at` | `date` | Projection update time |

## Display and Label Fields

| Field | Type | Notes |
| --- | --- | --- |
| `title` | `text` with `keyword` subfield | Short title only |
| `short_label` | `text` with `keyword` subfield | Bounded display label |
| `short_description` | `text` | Bounded description if policy allows |
| `tags` | `keyword[]` | Normalized tags |
| `aliases` | `keyword[]` | Normalized aliases |

Do not put full source text, full summaries, full transcripts, or full OCR output here.

## Current Retrieval Filter

Normal retrieval should include only active current projections.

Default filter:

```text
is_current = true
projection_status = active
version_status not in [hidden, tombstoned, archived, quarantined, retracted, deleted, purged]
```

Audit retrieval may include hidden, tombstoned, archived, quarantined, or retracted projections only when explicitly requested and authorized.

## Typed Runtime Attributes

Runtime taxonomy attributes must use a typed array.

Recommended shape:

```json
{
  "attributes": [
    {
      "key": "source_type",
      "value_type": "keyword",
      "keyword_value": "markdown"
    },
    {
      "key": "confidence",
      "value_type": "number",
      "number_value": 0.82
    },
    {
      "key": "valid_from",
      "value_type": "date",
      "date_value": "2026-06-19T00:00:00Z"
    }
  ]
}
```

Mapping:

| Field | Type |
| --- | --- |
| `attributes` | `nested` |
| `attributes.key` | `keyword` |
| `attributes.value_type` | `keyword` |
| `attributes.keyword_value` | `keyword` |
| `attributes.keyword_values` | `keyword[]` |
| `attributes.text_value` | `text` |
| `attributes.number_value` | `double` |
| `attributes.boolean_value` | `boolean` |
| `attributes.date_value` | `date` |

Rules:

- an attribute key has exactly one declared type in the taxonomy bundle;
- a document may use only the matching typed value field;
- `confidence` is always numeric;
- `source_type`, `knowledge_kind`, and `lifecycle_status` are always keyword values;
- unknown attributes must be rejected or stored only in a disabled `raw_attributes` object until reviewed;
- never create dynamic fields like `attribute_values.{key}`.

## Locator Fields

Access-unit locators vary by media type.

Do not rely on arbitrary locator objects for queryable fields.

Use stable normalized fields for common queries:

| Field | Type | Applies to |
| --- | --- | --- |
| `locator_kind` | `keyword` | all access units |
| `locator_path` | `keyword` | files, JSON, code |
| `heading_path` | `keyword[]` | Markdown |
| `page_number` | `integer` | PDF |
| `block_index` | `integer` | document blocks |
| `char_start` | `integer` | text spans |
| `char_end` | `integer` | text spans |
| `start_ms` | `long` | audio/video |
| `end_ms` | `long` | audio/video |
| `duration_ms` | `long` | audio/video |
| `frame_index` | `long` | video |
| `bbox` | `float[]` | image/PDF/video regions |
| `coordinate_space` | `keyword` | visual regions |
| `track_ref` | `keyword` | audio/video tracks |
| `transcript_ref` | `keyword` | transcript spans |
| `subtitle_ref` | `keyword` | subtitle spans |

Also store the full locator as disabled raw data:

```json
{
  "raw_locator": {
    "kind": "video_frame_region",
    "time_ms": 45000,
    "frame_index": 120,
    "bbox": [0.20, 0.18, 0.62, 0.74]
  }
}
```

`raw_locator` is for reconstruction and debugging, not OpenSearch filtering.

## Media Metadata Fields

Use shared typed fields where possible:

| Field | Type |
| --- | --- |
| `width` | `integer` |
| `height` | `integer` |
| `frame_rate` | `double` |
| `page_count` | `integer` |
| `language` | `keyword` |
| `encoding` | `keyword` |
| `byte_size` | `long` |

Do not put media-specific values into a dynamic `metadata` object unless it is disabled.

If arbitrary metadata must be kept:

```json
{
  "raw_media_metadata": {
    "type": "object",
    "enabled": false
  }
}
```

## Candidate Fields

Knowledge and relation candidates should remain candidates until later stages validate them.

Common fields:

| Field | Type |
| --- | --- |
| `candidate_id` | `keyword` |
| `candidate_kind` | `keyword` |
| `candidate_status` | `keyword` |
| `confidence` | `double` |
| `statement_ref` | `keyword` |
| `relation_type` | `keyword` |
| `from_ref` | `keyword` |
| `to_ref` | `keyword` |

If a statement is long, store it outside OpenSearch and index only a ref or bounded label.

## Search Text Fields

Text search has two modes.

### Metadata-Only

Use:

- `title`;
- `short_label`;
- `short_description`;
- `tags`;
- `aliases`;
- taxonomy fields;
- locator metadata.

### Indexed-But-Not-Stored

When keyword search over source text is required, use a field such as:

```json
{
  "search_text": {
    "type": "text",
    "store": false
  }
}
```

Rules:

- exclude `search_text` from `_source`;
- do not use it as answer evidence;
- fetch exact source units after retrieval;
- do not enable this mode for sensitive corpora without review.

## Dynamic Mapping Rule

V1 should use one of these policies:

1. `dynamic: strict` for all queryable documents.
2. `enabled: false` for raw/debug objects.

Never use uncontrolled dynamic mappings for:

- attributes;
- locators;
- media metadata;
- generated analysis;
- extracted entities;
- arbitrary JSON source payloads.

## Minimal Mapping Skeleton

```json
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "index_document_id": { "type": "keyword" },
      "index_document_type": { "type": "keyword" },
      "index_document_version": { "type": "keyword" },
      "repository_id": { "type": "keyword" },
      "source_id": { "type": "keyword" },
      "source_version_id": { "type": "keyword" },
      "source_version": { "type": "keyword" },
      "version_status": { "type": "keyword" },
      "is_current": { "type": "boolean" },
      "projection_status": { "type": "keyword" },
      "rollback_event_id": { "type": "keyword" },
      "tombstone_id": { "type": "keyword" },
      "supersedes_source_version_id": { "type": "keyword" },
      "superseded_by_source_version_id": { "type": "keyword" },
      "source_uri": { "type": "keyword" },
      "source_content_hash": { "type": "keyword" },
      "media_type": { "type": "keyword" },
      "media_hint": { "type": "keyword" },
      "taxonomy_bundle_id": { "type": "keyword" },
      "taxonomy_version": { "type": "keyword" },
      "category_ids": { "type": "keyword" },
      "source_manifest_ref": { "type": "keyword" },
      "access_unit_refs": { "type": "keyword" },
      "evidence_refs": { "type": "keyword" },
      "preview_refs": { "type": "keyword" },
      "derived_object_refs": { "type": "keyword" },
      "summary_ref": { "type": "keyword" },
      "wiki_signal_refs": { "type": "keyword" },
      "outgoing_link_titles": { "type": "keyword" },
      "tag_values": { "type": "keyword" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" },
      "title": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "short_label": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "short_description": { "type": "text" },
      "tags": { "type": "keyword" },
      "aliases": { "type": "keyword" },
      "locator_kind": { "type": "keyword" },
      "heading_path": { "type": "keyword" },
      "page_number": { "type": "integer" },
      "block_index": { "type": "integer" },
      "char_start": { "type": "integer" },
      "char_end": { "type": "integer" },
      "start_ms": { "type": "long" },
      "end_ms": { "type": "long" },
      "duration_ms": { "type": "long" },
      "frame_index": { "type": "long" },
      "bbox": { "type": "float" },
      "coordinate_space": { "type": "keyword" },
      "track_ref": { "type": "keyword" },
      "transcript_ref": { "type": "keyword" },
      "subtitle_ref": { "type": "keyword" },
      "width": { "type": "integer" },
      "height": { "type": "integer" },
      "frame_rate": { "type": "double" },
      "page_count": { "type": "integer" },
      "byte_size": { "type": "long" },
      "language": { "type": "keyword" },
      "attributes": {
        "type": "nested",
        "properties": {
          "key": { "type": "keyword" },
          "value_type": { "type": "keyword" },
          "keyword_value": { "type": "keyword" },
          "keyword_values": { "type": "keyword" },
          "text_value": { "type": "text" },
          "number_value": { "type": "double" },
          "boolean_value": { "type": "boolean" },
          "date_value": { "type": "date" }
        }
      },
      "candidate_id": { "type": "keyword" },
      "candidate_kind": { "type": "keyword" },
      "candidate_status": { "type": "keyword" },
      "confidence": { "type": "double" },
      "relation_type": { "type": "keyword" },
      "from_ref": { "type": "keyword" },
      "to_ref": { "type": "keyword" },
      "raw_locator": { "type": "object", "enabled": false },
      "raw_attributes": { "type": "object", "enabled": false },
      "raw_media_metadata": { "type": "object", "enabled": false }
    }
  }
}
```

## Validation Rules

Before writing an index document:

1. Validate `index_document_id` against [Index ID Policy](index-id-policy.md).
2. Validate required base fields.
3. Validate `media_type` and `media_hint`.
4. Validate every runtime attribute against the taxonomy bundle.
5. Reject attributes whose value does not match the taxonomy-declared type.
6. Normalize locators into stable typed fields.
7. Put full locator details into `raw_locator` only.
8. Reject unknown queryable fields.
9. Ensure no raw source content is stored in `_source`.
10. Ensure evidence can be fetched from source refs.

## Design Rule

OpenSearch stores typed retrieval projections.

It does not store source truth, unrestricted generated interpretation, or arbitrary schema-free metadata.
