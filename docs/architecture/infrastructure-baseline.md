# Infrastructure Baseline

This document defines the simplified infrastructure baseline for Knowledge Pools.

The goal is to keep implementation practical while preserving the core architecture: source-grounded, taxonomy-aware, graph-capable retrieval.

## Baseline Decision

Use one logical repository boundary with two primary infrastructure layers:

```text
source object store  ->  ingest/analysis pipeline  ->  OpenSearch index
```

The implementation posture is [Single Repository First](single-repository-first.md).

## 1. Source Object Store

Original sources are stored in a filesystem-compatible object store.

Examples:

- local filesystem for development;
- AWS S3 for production;
- any S3-compatible storage later.

Sources include:

- text;
- Markdown;
- PDF;
- image;
- JSON;
- code;
- web exports;
- selected conversation exports.

The source object store is the ground truth for original material.

## 2. Large Source Access

Large files or long documents must support partial access.

The system should not require loading an entire source into an LLM context.

Media-specific access strategies are defined in [Media Ingest Strategies](media-ingest-strategies.md).

Required access patterns:

- byte-range or object-range access where supported;
- page-level access for PDFs;
- section-level access for structured text;
- chunk-level access for long text;
- image-region or derived-description access for images later;
- JSON path access for large JSON files.

Ingest should create a source manifest that describes how the source can be revisited.

Example:

```json
{
  "source_id": "src_01",
  "object_uri": "s3://knowledge-pools/sources/src_01/original.pdf",
  "content_hash": "sha256:...",
  "media_type": "application/pdf",
  "access_units": [
    {
      "unit_id": "page_001",
      "kind": "page",
      "locator": { "page": 1 }
    },
    {
      "unit_id": "span_001",
      "kind": "text_span",
      "locator": { "page": 1, "char_start": 120, "char_end": 540 }
    }
  ]
}
```

## 3. Taxonomy-Aware Analysis

The ingest/analysis pipeline reads sources, applies the active taxonomy bundle, and emits graph-ready ingest artifacts.

The pipeline produces:

- source records;
- source manifests;
- parsed access units;
- category assignments;
- attribute values;
- entity instance candidates;
- relation instance candidates;
- taxonomy proposals when unknown concepts appear.

## 4. Main Indexing Server: OpenSearch

OpenSearch is the main indexing and query server for v1.

OpenSearch should be treated as a retrieval map, not a content store. The content-minimal policy is defined in [Index Content Policy](index-content-policy.md).

OpenSearch stores searchable projections of:

- source records;
- parsed access units;
- ingest artifacts;
- knowledge records;
- entity instances;
- relation instances;
- taxonomy metadata needed for filtering;
- source provenance links.

OpenSearch should support:

- keyword search;
- structured filters;
- taxonomy filters;
- nested entity/relation queries;
- date/range queries;
- full-text search when indexed-but-not-stored text is explicitly enabled;
- later vector search if needed.

The first implementation should design OpenSearch mappings intentionally rather than treating it as a blob store.

By default, indexed documents should not store full source content, full chunks, full OCR output, or high-resolution media bytes. They should store enough metadata and locators to find the relevant `AccessUnit`, then fetch exact evidence from the source object store.

## 5. Source Link Contract

Every indexed document must retain a link back to the original source.

Required fields:

- `source_id`
- `source_uri`
- `source_content_hash`
- `taxonomy_bundle_id`
- `taxonomy_version`
- `access_unit_refs`
- `evidence_refs`

When a later answer needs detailed grounding, the system should:

1. search OpenSearch for relevant indexed records;
2. read source references from the search result;
3. fetch exact source units from object storage;
4. use those source units as evidence for answer generation;
5. cite source and access unit references in the answer.

## Baseline Data Flow

```text
source file
  -> object store
  -> source record
  -> source manifest
  -> parser/access-unit extraction
  -> taxonomy-aware analysis
  -> ingest artifact
  -> OpenSearch indexed documents
  -> retrieval result
  -> source unit fetch
  -> grounded answer
```

## What OpenSearch Is Not

OpenSearch is not the ground truth for original files.

OpenSearch is also not the primary evidence store for answer generation.

OpenSearch stores searchable projections and references. If an indexed field conflicts with the source object, the source object plus source manifest wins.

## Deferred Infrastructure

These are deferred until needed:

- multiple repositories;
- repository clusters;
- standalone graph database;
- separate vector database;
- relational metadata database;
- workflow queue;
- distributed processing;
- full web UI.

The architecture should leave room for these later, but v1 should not require them.
