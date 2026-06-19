# Media Retrieve Concept Proofs

This document validates the `retrieve` stage across supported media types.

It focuses only on retrieval.

It does not redefine ingest, understand, connect, plan, reason, verify, update, or curation.

## Retrieve Stage Rule

`retrieve` consumes a validated `RetrievalPlan` and produces an `EvidenceBundle`.

It should fetch bounded evidence units, not whole source dumps.

```text
PlanToRetrieveHandoff
  -> Retrieval Agent
  -> EvidenceBundle
  -> RetrieveToReasonHandoff
```

For every media type, retrieve must preserve:

- evidence ref;
- source id;
- source version id;
- access unit ref or record ref;
- retrieval step id;
- freshness and lifecycle status;
- missing evidence notes;
- conflict refs when requested;
- preview refs only as inspection aids.

## Common Evidence Item Shape

Recommended shape:

```json
{
  "evidence_ref": "src_md_001#section_001",
  "evidence_type": "markdown_section",
  "source_ref": "src_md_001",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "access_unit_ref": "src_md_001#section_001",
  "retrieval_step_id": "s1",
  "rank": 1,
  "content_ref": "artifact://runs/run_001/retrieve/evidence/src_md_001_section_001.txt",
  "preview_refs": [],
  "is_current": true,
  "version_status": "current",
  "lifecycle_status": "active"
}
```

`content_ref` is optional when the evidence item is a durable record, graph result, or preview-only inspection aid.

Large source content should stay behind refs.

## Proof 1: Markdown

Plan request:

```text
Find evidence explaining why taxonomy and versioning are different.
```

Expected retrieval path:

1. `keyword_search` or `source_lookup` finds Markdown source and section refs.
2. `source.locate` resolves `src_md_001`.
3. `retrieval.fetch_evidence` fetches only `src_md_001#section_001`.
4. `artifact.write` stores bounded section text as a run artifact.
5. `EvidenceBundle` lists the section as selected evidence.

Evidence item:

```json
{
  "evidence_ref": "src_md_001#section_001",
  "evidence_type": "markdown_section",
  "source_ref": "src_md_001",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "access_unit_ref": "src_md_001#section_001",
  "retrieval_step_id": "s1",
  "content_ref": "artifact://runs/run_001/retrieve/evidence/src_md_001_section_001.txt",
  "preview_refs": ["summary_preview_v001"],
  "is_current": true
}
```

Validation:

- the full Markdown file is not copied into the evidence bundle;
- preview summary can help selection but is not treated as final evidence;
- wiki links may appear as related refs, not as proof by themselves.

## Proof 2: Image, JPG or PNG

Plan request:

```text
Find visual evidence that the uploaded architecture sketch contains an OpenSearch box.
```

Expected retrieval path:

1. `keyword_search` or `record_search` finds image source metadata, detected labels, or region candidates.
2. `preview.lookup` loads thumbnail or standard rendition for inspection.
3. `source.locate` resolves the original image and derived standard rendition.
4. `retrieval.fetch_evidence` fetches a bounded region or image-level access unit.
5. `EvidenceBundle` lists the region ref and the preview refs used for inspection.

Evidence item:

```json
{
  "evidence_ref": "src_img_001#region_003",
  "evidence_type": "image_region",
  "source_ref": "src_img_001",
  "source_version_id": "srcv_img_sha256_cd34ef56ab12",
  "access_unit_ref": "src_img_001#region_003",
  "retrieval_step_id": "s2",
  "content_ref": "artifact://runs/run_001/retrieve/evidence/src_img_001_region_003.json",
  "preview_refs": ["thumb_320_v001", "standard_1600_v001"],
  "is_current": true
}
```

Validation:

- a thumbnail is not the source of truth;
- region locator must preserve coordinates and rendition basis;
- if only image-level evidence exists, mark the access unit as `image_full`;
- OCR text or detected labels should be treated as derived evidence with generator metadata.

## Proof 3: WAV Audio or Music

Plan request:

```text
Find the part of the audio where the speaker mentions rollback.
```

Expected retrieval path:

1. `keyword_search` searches transcript access units or audio metadata.
2. `source.locate` resolves the WAV source version.
3. `retrieval.fetch_evidence` fetches a transcript span and optional bounded audio clip ref.
4. `preview.lookup` may provide waveform or spectrogram refs for inspection.
5. `EvidenceBundle` includes transcript span evidence and optional clip artifact refs.

Evidence item:

```json
{
  "evidence_ref": "src_wav_001#transcript_span_014",
  "evidence_type": "audio_transcript_span",
  "source_ref": "src_wav_001",
  "source_version_id": "srcv_wav_sha256_ef56ab12cd34",
  "access_unit_ref": "src_wav_001#transcript_span_014",
  "retrieval_step_id": "s3",
  "content_ref": "artifact://runs/run_001/retrieve/evidence/src_wav_001_transcript_span_014.json",
  "preview_refs": ["waveform_preview_v001"],
  "locator": {
    "start_ms": 42100,
    "end_ms": 48750
  },
  "is_current": true
}
```

Validation:

- transcript evidence must identify generator metadata and confidence;
- music or non-speech evidence may use time ranges, acoustic tags, or human annotations;
- long WAV files must be retrieved by bounded time ranges, not full audio reads;
- if a transcript is missing, emit `missing_evidence` instead of inventing text.

## Proof 4: MP4 Video

Plan request:

```text
Find the segment where the demo shows the retrieval result list.
```

Expected retrieval path:

1. `keyword_search` searches subtitles, scene labels, frame OCR, or video metadata.
2. `preview.lookup` loads poster, keyframe, storyboard, or low-bitrate proxy refs.
3. `source.locate` resolves the MP4 source version.
4. `retrieval.fetch_evidence` fetches a bounded subtitle span, frame range, scene segment, or clip ref.
5. `EvidenceBundle` includes the bounded video locator and derived evidence metadata.

Evidence item:

```json
{
  "evidence_ref": "src_mp4_001#scene_006",
  "evidence_type": "video_scene_segment",
  "source_ref": "src_mp4_001",
  "source_version_id": "srcv_mp4_sha256_ab12ef56cd34",
  "access_unit_ref": "src_mp4_001#scene_006",
  "retrieval_step_id": "s4",
  "content_ref": "artifact://runs/run_001/retrieve/evidence/src_mp4_001_scene_006.json",
  "preview_refs": ["storyboard_v001", "keyframe_006_v001"],
  "locator": {
    "start_ms": 82000,
    "end_ms": 96400,
    "frame_start": 1968,
    "frame_end": 2314
  },
  "is_current": true
}
```

Validation:

- storyboard and poster frames are navigation aids;
- subtitle, OCR, frame, and scene evidence must identify derived-object provenance;
- video retrieval should prefer segments and frame ranges over full video copies;
- if audio and visual evidence disagree, preserve conflict refs for reasoning and verification.

## Proof 5: Long PDF

Plan request:

```text
Find the policy section that says indexed documents should not store full raw content.
```

Expected retrieval path:

1. `keyword_search` searches PDF page text, section summaries, or metadata.
2. `source.locate` resolves the PDF source version and manifest.
3. `retrieval.fetch_evidence` fetches page, block, or text-span access units.
4. `preview.lookup` may load page thumbnails or section summaries for inspection.
5. `EvidenceBundle` includes the exact page/block/span refs.

Evidence item:

```json
{
  "evidence_ref": "src_pdf_001#page_012_block_004",
  "evidence_type": "pdf_text_block",
  "source_ref": "src_pdf_001",
  "source_version_id": "srcv_pdf_sha256_56ab12cd34ef",
  "access_unit_ref": "src_pdf_001#page_012_block_004",
  "retrieval_step_id": "s5",
  "content_ref": "artifact://runs/run_001/retrieve/evidence/src_pdf_001_page_012_block_004.txt",
  "preview_refs": ["page_012_thumbnail_v001", "section_summary_v001"],
  "locator": {
    "page": 12,
    "block": 4
  },
  "is_current": true
}
```

Validation:

- document summary is not enough for final grounding;
- page and block locators must remain stable for the source version;
- OCR-derived text must preserve OCR engine metadata and confidence;
- large PDFs should be retrieved by page, section, block, or span.

## Cross-Media Checks

Every retrieve concept proof passes only if:

- selected evidence is bounded;
- selected evidence resolves to source version or durable record provenance;
- previews are marked as inspection aids;
- missing evidence is explicit;
- conflict refs are included when requested;
- lifecycle filters exclude hidden, tombstoned, archived, deleted, purged, quarantined, or retracted projections by default;
- current and historical versions are not mixed silently;
- generated derived evidence includes generator metadata;
- `RetrieveToReasonHandoff` carries refs and status, not final answer text.

## Terminology Check

Use:

- `AccessUnit` for retrievable source parts;
- `PreviewArtifact` for browsing and inspection aids;
- `EvidenceRef` for a resolvable evidence reference;
- `EvidenceItem` for one selected item inside an `EvidenceBundle`;
- `EvidenceBundle` for the retrieve output artifact;
- `RetrieveToReasonHandoff` for the transition to reasoning.

Avoid:

- calling previews evidence unless they are explicitly selected and grounded through `derived_from`;
- calling search hits evidence before retrieve resolves and packages them;
- calling an evidence bundle an answer;
- calling generated transcript, OCR, label, or summary text original source content.
