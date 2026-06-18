# Media Ingest Strategies

This document defines how ingest differs by media type while preserving a shared output contract.

## Core Principle

Media-specific parsing should vary, but ingest outputs should remain consistent.

Every media strategy should produce:

- `SourceRecord`
- `SourceManifest`
- `AccessUnit[]`
- `PreviewArtifact[]`
- `IngestArtifact`
- `GraphCandidate[]`
- content-minimal OpenSearch index documents

## Shared Pipeline

```text
source
  -> store original
  -> create source record
  -> create source manifest
  -> create access units
  -> create preview artifacts
  -> media-specific analysis
  -> taxonomy-aware classification
  -> OpenSearch indexing
```

## Strategy Interface

```ts
interface MediaIngestStrategy {
  detect(source: SourceRecord): boolean;
  createManifest(source: SourceRecord): SourceManifest;
  createAccessUnits(source: SourceRecord, manifest: SourceManifest): AccessUnit[];
  createPreviewArtifacts(source: SourceRecord, manifest: SourceManifest): PreviewArtifact[];
  analyze(units: AccessUnit[], taxonomy: TaxonomyBundle): IngestArtifact;
  buildIndexDocuments(artifact: IngestArtifact): OpenSearchDocument[];
}
```

## Preview Artifacts

Preview artifacts are source-derived objects optimized for fast browsing, triage, and retrieval inspection.

They should be generated after access units are known because every preview needs a `derived_from` chain back to the source or access unit.

Preview artifacts belong to source version storage, not the main index.

The index may keep:

- preview refs;
- preview kind;
- preview hash;
- generator name and version;
- access policy metadata.

The index should not keep:

- image bytes;
- audio bytes;
- long summary text;
- full transcript text;
- large rendered document pages.

Recommended preview artifacts:

| Media type | Preview artifacts |
| --- | --- |
| Markdown | outline, short summary, heading tree |
| PDF | document summary, page thumbnails, section summaries |
| Image | thumbnail, standard rendition |
| Audio | waveform, spectrogram, low-bitrate proxy when policy allows |
| JSON | schema sketch, object shape summary |
| Code | symbol outline, file summary |
| Conversation | thread summary, turn outline |

Preview artifacts are hints for selection. Grounded answers still fetch the exact source access units.

## Text and Markdown

Access units:

- document
- heading section
- paragraph
- table block
- code block
- text span

Chunking strategy:

- Prefer structural chunks before token-sized chunks.
- Preserve heading hierarchy.
- Keep stable locators such as heading path, block index, and character offsets.
- Split oversized sections by paragraph or semantic boundary.
- Avoid splitting tables or code blocks unless necessary.

Indexed views:

- document summary
- section summaries
- exact text access units
- extracted claims, concepts, decisions, and questions

Preview artifacts:

- heading outline
- short source summary
- section summary refs for long files

Locator examples:

```json
{ "kind": "markdown_section", "heading_path": ["Architecture", "Ingest"], "block_start": 4, "block_end": 9 }
```

## PDF

Access units:

- page
- text block
- table
- figure
- OCR block
- bounding-box text span

Chunking strategy:

- Page is the first stable boundary.
- Use text blocks or layout regions inside pages.
- Preserve page number and bounding boxes.
- Use OCR fallback when embedded text is missing.
- Keep table extraction separate from paragraph text.

Indexed views:

- document summary
- page summaries
- text blocks
- tables as structured units when possible
- figure captions or derived descriptions

Preview artifacts:

- source-level summary
- page thumbnails
- section or page summaries
- table previews when extraction is reliable

Locator examples:

```json
{ "kind": "pdf_text_span", "page": 12, "bbox": [80, 120, 520, 180], "char_start": 0, "char_end": 240 }
```

## Image

Access units:

- original image
- standard rendition
- thumbnail
- region
- detected object
- generated caption
- OCR text region

Resolution strategy:

- Store the original image unchanged.
- Generate standard renditions for analysis and UI.
- Keep at least one thumbnail for preview.
- Use region locators for object-level evidence.

Recommended renditions:

- `original`: unchanged source object
- `standard`: bounded longest side for general analysis
- `thumbnail`: small preview
- optional `ocr_ready`: preprocessing for OCR when useful

Indexed views:

- image-level description
- detected objects as entity instance candidates
- relations between detected objects when meaningful
- OCR text as access units
- visual attributes such as dominant colors or composition when taxonomy allows

Preview artifacts:

- thumbnail
- standard rendition
- optional OCR-ready rendition

Locator examples:

```json
{ "kind": "image_region", "rendition": "standard", "bbox": [0.12, 0.18, 0.44, 0.72] }
```

Use normalized coordinates unless a pixel-specific rendition is required.

## Audio, WAV, Speech, and Song

Access units:

- audio file
- time segment
- transcript span
- speaker segment when available
- music segment
- waveform-derived marker

Chunking strategy:

- Use time ranges as the stable boundary.
- Preserve original audio unchanged.
- Create transcript access units only when speech recognition exists.
- Keep transcript text as a source-derived artifact, not as raw index content by default.
- For songs, avoid treating lyrics-like text as ordinary unrestricted text unless rights and policy allow it.
- Use short descriptors and time locators for retrieval.

Indexed views:

- media metadata
- time segment locators
- transcript refs
- short labels or bounded descriptors
- taxonomy metadata

Preview artifacts:

- waveform preview
- spectrogram preview
- low-bitrate proxy when access policy allows
- short transcript snippet refs when speech policy allows, with text stored outside the index

Locator examples:

```json
{ "kind": "audio_segment", "start_ms": 12000, "end_ms": 28000 }
```

```json
{ "kind": "transcript_span", "transcript_ref": "transcript_v001", "start_ms": 12000, "end_ms": 28000, "char_start": 0, "char_end": 180 }
```

## JSON

Access units:

- root object
- object node
- array item
- JSON path
- scalar field

Chunking strategy:

- Do not chunk by raw character count first.
- Prefer structural boundaries: object, array item, field path.
- For very large arrays, chunk by item windows.
- Preserve JSONPath-like locators.

Indexed views:

- schema summary
- object summaries
- selected scalar fields
- shallow entity candidates derived from repeated object structures

Locator examples:

```json
{ "kind": "json_path", "path": "$.items[42].description" }
```

## Code

Access units:

- file
- module
- symbol
- function
- class
- method
- import/export edge
- comment block

Chunking strategy:

- Prefer AST/symbol boundaries.
- Preserve line ranges.
- Keep import graph and symbol references.
- Avoid splitting a function body unless it is extremely large.

Indexed views:

- file summary
- symbol summaries
- API surface
- dependency edges
- comments and docstrings

Locator examples:

```json
{ "kind": "code_symbol", "path": "src/ingest/parser.ts", "symbol": "parseMarkdown", "line_start": 12, "line_end": 86 }
```

## Conversation

Access units:

- thread
- turn
- contiguous segment
- decision moment
- action item
- correction

Chunking strategy:

- Preserve speaker, timestamp, and turn order.
- Split by topic or decision boundary.
- Extract durable knowledge only after curation.
- Avoid storing raw conversation as memory by default.

Indexed views:

- session summary
- decision candidates
- open questions
- corrections
- action items

Locator examples:

```json
{ "kind": "conversation_turn", "thread_id": "thread_01", "turn": 18 }
```

## Document Summary and Detail Indexing

Long documents should be indexed at multiple levels:

- source-level summary reference;
- section/page-level summary reference;
- access-unit locator and metadata;
- extracted graph candidates;
- source locators for detailed grounding.

Summary records are retrieval aids. They do not replace source access units. Long summary text should be stored as an artifact or source-derived object, not copied into index document `_source` by default.

## Wiki-Style Document Connectivity

Wiki-like sources need link extraction.

Useful connection signals:

- explicit links;
- backlinks;
- tags/categories;
- heading references;
- aliases;
- redirects;
- embedded transclusions;
- citation links.

These should produce relation instance candidates such as:

- `mentions`
- `references`
- `derived_from`
- `depends_on`
- `same_as`

## Source Updates and Versions

Ingest must handle source updates explicitly.

Track:

- source object version;
- source content hash;
- source manifest version;
- parser version;
- taxonomy bundle version;
- indexed document version;
- supersession relationship between source records when needed.

Do not silently overwrite an old source record if the content hash changes.

## Responsibility Split

Taxonomy manages meaning.

Versioning and source manifests manage change, access, and evidence location.

OpenSearch manages searchable projections.

The object store manages original bytes and derived source objects.
