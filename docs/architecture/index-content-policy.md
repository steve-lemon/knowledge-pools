# Index Content Policy

This document defines what may and may not be stored in OpenSearch-compatible index documents.

## Core Principle

The index is a retrieval map, not a content store.

Original content belongs in the source object store and is accessed through `SourceManifest` and `AccessUnit` locators.

OpenSearch-compatible documents should help the system find the right source, media object, page, region, section, span, or graph candidate. They should not become the place where full document content lives.

## Default Policy

Do not store raw source content directly in index document `_source`.

Avoid storing:

- full document text;
- full chunk text;
- full PDF page text;
- full OCR output;
- full conversation turns;
- full JSON payloads;
- high-resolution image data;
- long generated summaries that can substitute for source reading.

Prefer storing:

- source identifiers;
- source object URI;
- content hash;
- media type;
- taxonomy identifiers;
- category IDs;
- attribute values allowed by taxonomy;
- entity instance metadata;
- relation instance metadata;
- access unit locators;
- evidence references;
- short display labels;
- generated descriptors when policy allows;
- indexing/version metadata.

## Search Text Boundary

There are two possible levels of text indexing.

### Level 1: Metadata-Only Search

Only taxonomy metadata, labels, titles, aliases, and structured fields are indexed.

Use when:

- privacy is more important than recall;
- the source corpus is sensitive;
- exact full-text search is not required.

Tradeoff:

- safer and simpler;
- weaker keyword recall.

### Level 2: Indexed-But-Not-Stored Search Text

Text may be sent to OpenSearch for analysis into the inverted index, but raw text should not be retrievable from document `_source`.

Use when:

- keyword search over source content is required;
- the system still wants object storage to remain the content source of truth.

Rules:

- exclude raw text fields from `_source`;
- do not enable stored fields for raw text;
- do not enable term vectors unless needed and reviewed;
- do not rely on OpenSearch highlighting as the evidence source;
- fetch exact text from object storage using access-unit locators after retrieval.

This mode still indexes terms, so it is not appropriate for highly sensitive content without additional security review.

## Summary Policy

Summaries are derived content.

Default:

- store summary artifacts outside the main index when they are long;
- index only summary metadata and source refs;
- fetch summary text from object storage or artifact storage when needed.

Allowed in index:

- short labels;
- short descriptions;
- bounded captions;
- summary hashes;
- summary artifact refs;
- quality/confidence metadata.

Avoid in index:

- long summaries that replace source lookup;
- generated text without source refs;
- summaries of restricted sources unless access policy allows it.

## Media-Specific Policy

### Text and Markdown

Index:

- title;
- heading path;
- section locator;
- taxonomy metadata;
- optional analyzed search text if Level 2 is enabled.

Do not store:

- full section text in `_source`;
- full chunk text as retrievable fields.

### PDF

Index:

- page number;
- layout block type;
- bounding box;
- table/figure locator;
- taxonomy metadata;
- optional analyzed text if Level 2 is enabled.

Do not store:

- full page text;
- full OCR output;
- rendered page image bytes.

### Image

Index:

- media metadata;
- rendition refs;
- region locators;
- detected object labels;
- taxonomy metadata;
- short captions if policy allows.

Do not store:

- image bytes;
- high-resolution derived images;
- unrestricted verbose vision descriptions.

### Audio

Index:

- media metadata;
- duration;
- time segment locators;
- transcript refs;
- short descriptors if policy allows;
- taxonomy metadata.

Do not store:

- audio bytes;
- full transcript text;
- lyrics-like text;
- unrestricted verbose audio descriptions.

### JSON

Index:

- JSON path;
- structural type;
- selected scalar values allowed by policy;
- taxonomy metadata.

Do not store:

- full JSON payloads;
- large nested objects.

### Code

Index:

- file path;
- symbol name;
- symbol kind;
- line ranges;
- import/export refs;
- taxonomy metadata;
- optional analyzed comments/docstrings if Level 2 is enabled.

Do not store:

- full source files;
- large function bodies as retrievable fields.

## Required Link Fields

Every indexed document must include enough information to fetch the original evidence:

- `repository_id`
- `source_id`
- `source_version`
- `source_uri`
- `source_content_hash`
- `source_manifest_ref`
- `access_unit_refs`
- `evidence_refs`
- `taxonomy_bundle_id`
- `taxonomy_version`
- `index_document_version`

## Answer Generation Flow

Answer generation must not rely on index document content as the final evidence.

The flow should be:

```text
query
  -> search index
  -> get candidate source/access-unit refs
  -> fetch exact source units from object storage
  -> build evidence bundle
  -> reason over fetched evidence
  -> cite source/access-unit refs
```

## Design Rule

OpenSearch helps find evidence.

Object storage provides evidence.

The answer should be grounded in fetched source units, not in raw content copied into the index.
