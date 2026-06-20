# Markdown-First Implementation Strategy

This document defines the implementation strategy for turning the architecture into a working MVP.

The architecture remains multi-media.

The first implementation should not be.

Current work should prepare implementation-near specifications before runtime code.

See [Implementation-Near Specification Preparation](implementation-near-spec.md).

## Decision

Build the first working vertical slice with Markdown/text files only.

After the full loop works end to end, add image, audio, video, and PDF support as media-specific extensions.

```text
v1 implementation:
Markdown/text only
  -> ingest
  -> understand
  -> connect
  -> plan
  -> retrieve
  -> reason
  -> verify
  -> update candidate
  -> trace/evaluate

later:
add image
add PDF
add audio
add video
```

Media expansion belongs to P3 in [Specification Review Checklist](spec-review-checklist.md).

The planned order is:

```text
P3a image
P3b PDF
P3c audio
P3d video
```

Each media type must extend the same source, manifest, access-unit, index, evidence, verification, and trace contracts rather than creating a separate pipeline.

## Rationale

The current architecture defines a broad target system.

Implementing all media types at once would make it hard to tell whether failures come from:

- agent orchestration;
- schema design;
- source storage;
- retrieval planning;
- evidence packaging;
- reasoning;
- verification;
- media parsing complexity.

Markdown/text is the best first slice because it can prove the complete data flow with deterministic tools.

It also exercises the most important contracts:

- source record;
- source version;
- manifest;
- access unit;
- ingest artifact;
- knowledge candidate;
- relationship proposal;
- retrieval plan;
- evidence bundle;
- draft answer;
- verification report;
- update candidate;
- trace.

## Implementation Scope

### V1: Markdown/Text Vertical Slice

V1 should support:

- local Markdown file discovery;
- source record and source version creation;
- heading-aware access units;
- outline and summary preview refs as optional derived artifacts;
- deterministic structural understanding;
- simple claim, concept, decision, procedure, and question candidates;
- deterministic duplicate, mention, and support relationship proposals;
- local fixture index search;
- retrieval planning for source lookup, keyword search, decision recall, and source audit;
- bounded evidence bundle creation from Markdown sections or blocks;
- cited draft answers from evidence bundles;
- basic answer verification against cited evidence refs;
- run traces and quality reports.

V1 should not require:

- image OCR;
- PDF parsing;
- audio transcription;
- video scene detection;
- vector search;
- graph database;
- real OpenSearch server;
- LLM provider dependency;
- durable memory writes before curation.

### V2: Image Support

Add image only after Markdown/text flow is stable.

Focus on:

- image source records;
- image renditions and thumbnails;
- image-level and region access units;
- OCR and visual label derived artifacts;
- region-based evidence refs;
- cautious reasoning with detection confidence.

### V3: PDF Support

Add PDF after image or in parallel only if the Markdown flow is stable.

Focus on:

- page, block, table, figure, and OCR span access units;
- page thumbnails and section summaries;
- page/block evidence refs;
- PDF-specific current-version and OCR-confidence handling.

### V4: Audio Support

Add audio after text evidence flow and confidence handling are stable.

Focus on:

- transcript spans;
- timestamp locators;
- waveform previews;
- bounded clip refs;
- transcription confidence and missing transcript behavior.

### V5: Video Support

Add video last unless a product requirement forces it earlier.

Focus on:

- subtitles;
- scene segments;
- frame ranges;
- keyframes;
- storyboard previews;
- audio/visual conflict notes.

## Agent Implementation Focus By Media

| Agent | Markdown/Text V1 | Image | Audio | Video | PDF |
| --- | --- | --- | --- | --- | --- |
| Ingestion Agent | file scan, source record, hash, heading access units | renditions, regions, OCR refs | waveform, transcript refs | storyboard, scenes, subtitle refs | pages, blocks, OCR refs |
| Understanding Agent | deterministic claims, concepts, decisions, questions | OCR/label candidates with confidence | transcript-based candidates | subtitle/OCR/scene candidates | page/block/table candidates |
| Connection Agent | duplicate, mention, support proposals | visual/OCR mention proposals | transcript mention proposals | scene/subtitle relation proposals | citation/table/section relation proposals |
| Retrieval Planner | source lookup, keyword search, decision recall | region/OCR evidence requirements | transcript/time-range requirements | scene/frame/subtitle requirements | page/block/table requirements |
| Retrieval Agent | section/block evidence bundle | region/image evidence bundle | transcript span/clip evidence bundle | scene/frame/subtitle evidence bundle | page/block/table evidence bundle |
| Reasoning Agent | cited draft claims from text evidence | cautious visual claims and assumptions | transcript/time-based claims | scene/frame claims and conflict notes | page/block/table claims |
| Verifier Agent | cited text support checks | region/OCR support checks | transcript/time support checks | scene/frame/subtitle support checks | page/block/table support checks |
| Knowledge Update Agent | update candidates from verified text claims | defer until visual verification is reliable | defer until transcript confidence is reliable | defer until multimodal verification is reliable | update candidates from verified PDF refs |

## Object Focus By Media

| Object | Markdown/Text V1 | Image | Audio | Video | PDF |
| --- | --- | --- | --- | --- | --- |
| SourceRecord | path, title, hash, media type | image metadata, dimensions | duration, codec | duration, codec, tracks | page count, parser metadata |
| SourceManifest | heading tree and blocks | renditions and regions | transcript and time spans | scenes, subtitles, frames | pages, blocks, tables, figures |
| AccessUnit | section, block, wiki link | image full, region, OCR span | transcript span, time range | scene, subtitle span, frame range | page, block, table, figure, OCR span |
| PreviewArtifact | outline, short summary | thumbnail, standard rendition | waveform, spectrogram | poster, keyframes, storyboard | page thumbnails, section summaries |
| KnowledgeCandidate | claim, decision, concept, procedure, question | OCR/label-derived candidate | transcript-derived candidate | subtitle/OCR/scene candidate | page/block/table-derived candidate |
| RelationshipProposal | duplicate, support, mention | visual/OCR mention | transcript mention | subtitle/scene support | citation/table/section relation |
| RetrievalPlan | keyword/source lookup | region/OCR lookup | transcript/time lookup | scene/frame lookup | page/block/table lookup |
| EvidenceBundle | cited sections/blocks | cited regions/OCR spans | cited transcript spans | cited scenes/frames/subtitles | cited pages/blocks/tables |
| DraftAnswer | text claims with refs | cautious visual claims | transcript-timed claims | scene/frame claims | page/block claims |
| VerificationReport | claim-to-section support | claim-to-region support | claim-to-transcript support | claim-to-scene support | claim-to-page/block support |

## Tool Focus By Media

| Tool Port | Markdown/Text V1 | Image | Audio | Video | PDF |
| --- | --- | --- | --- | --- | --- |
| `source.locate` | path and section/block refs | rendition and region refs | time-span refs | scene/frame refs | page/block refs |
| `source.read` | exact section/block text | bounded region metadata or image object | transcript span or clip | subtitle/span/scene metadata | page/block/table text |
| `parse.document` | Markdown parser | OCR text import only later | transcript import only later | subtitle/OCR import later | PDF text/block parser later |
| `parse.media` | not required | OCR/metadata later | transcription later | scene/frame/OCR later | OCR/rendering later |
| `chunk.create` | heading/block access units | region access units later | transcript span units later | scene/subtitle units later | page/block units later |
| `preview.create` | outline/summary optional | thumbnail/rendition | waveform/spectrogram | poster/storyboard | page thumbnail |
| `index.search` | local fixture keyword search | metadata/OCR search | transcript search | subtitle/OCR search | page/block text search |
| `retrieval.fetch_evidence` | section/block fetch | region/OCR fetch | transcript/time fetch | scene/frame fetch | page/block/table fetch |
| `model.complete` | optional after deterministic flow | optional visual captioning later | optional transcript cleanup later | optional scene summary later | optional PDF summary later |
| `verification.check` | deterministic citation support | region/OCR support later | transcript support later | scene/frame support later | page/block support later |

## V1 Acceptance Gate

Do not expand to other media types until Markdown/text can prove:

- ingest creates source records, manifests, access units, and traces;
- understand creates candidates with evidence refs;
- connect creates relationship proposals without durable graph mutation;
- plan creates retrieval plans without fetching evidence;
- retrieve creates evidence bundles with bounded Markdown evidence;
- reason creates draft answers with cited evidence refs;
- verify flags unsupported claims;
- update emits candidates without durable memory writes;
- every stage writes typed artifacts and trace events;
- the whole flow can run locally through CLI commands.

## Expansion Rule

When adding a new media type:

1. Add or update the media concept proof.
2. Add source manifest and access-unit shapes.
3. Add preview and derived-artifact policy.
4. Add index projection fields without storing raw content.
5. Add media-specific retrieval and reasoning validation.
6. Add verifier checks before allowing update candidates from that media.
7. Keep the Markdown/text regression suite passing.
