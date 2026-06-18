# Media Concept Proofs

This document walks five media types through the current Knowledge Pools architecture.

The goal is to prove the concept, not to finalize implementation details.

Each proof follows the same architecture:

```text
source object
  -> SourceRecord
  -> SourceManifest
  -> AccessUnit[]
  -> preview artifacts
  -> media analysis
  -> taxonomy classification
  -> IngestArtifact
  -> content-minimal index documents
  -> source-unit fetch for answer grounding
```

## Preview Artifact Principle

Preview artifacts are derived objects created to make browsing, triage, and retrieval inspection faster.

They are not the source of truth.

Examples:

- Markdown: outline and short document summary;
- image: thumbnail and standard-size rendition;
- audio: waveform preview, spectrogram, low-bitrate proxy, or short bounded clip when policy allows;
- PDF: document summary, page thumbnails, and section/page summaries;
- video: poster frame, keyframes, storyboard, low-bitrate proxy, waveform, and subtitle summary refs.

Preview artifacts should be stored beside the source version, usually under `derived/`.

The index may store preview references, preview hashes, preview type, and generator metadata. It should not store large preview content directly.

## Identifier Principle

Every proof should be compatible with [Index ID Policy](index-id-policy.md).

Minimal ID shape:

```text
kp:{repository_id}:{document_kind}:{media_hint}:{source_hash_prefix}:{scope}
```

Examples:

```text
kp:repo_main:source:md:sha256_ab12cd34ef90:root
kp:repo_main:access_unit:pdf:sha256_ab12cd34ef90:page_001_block_003
kp:repo_main:preview:jpg:sha256_ab12cd34ef90:thumb_320
```

The hash prefix and media hint are useful in IDs, but every indexed document must still store the full hash and authoritative `media_type`.

## Proof 1: Basic Markdown File

Example source:

```text
knowledge/sources/wiki/src_md_001/versions/v001/original.md
```

Example content:

```markdown
# Taxonomy vs Versioning

Taxonomy defines meaning. Versioning defines change over time.

See [[Index Content Policy]].

Tags: architecture, ingest
```

### SourceRecord

```json
{
  "source_id": "src_md_001",
  "source_version": "v001",
  "media_type": "text/markdown",
  "object_uri": "knowledge/sources/wiki/src_md_001/versions/v001/original.md",
  "content_hash": "sha256:...",
  "title": "Taxonomy vs Versioning",
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0"
}
```

### SourceManifest and AccessUnits

```json
{
  "source_id": "src_md_001",
  "manifest_version": "v001",
  "derived_objects": [
    {
      "object_id": "outline_preview_v001",
      "kind": "document_outline_preview",
      "object_uri": "knowledge/sources/wiki/src_md_001/versions/v001/derived/outline.json",
      "derived_from": ["src_md_001#section_001"]
    },
    {
      "object_id": "summary_preview_v001",
      "kind": "document_summary_preview",
      "object_uri": "knowledge/sources/wiki/src_md_001/versions/v001/derived/summary.json",
      "derived_from": ["src_md_001#section_001"],
      "generator": "summary_generator",
      "generator_version": "placeholder"
    }
  ],
  "access_units": [
    {
      "unit_id": "section_001",
      "kind": "markdown_section",
      "locator": {
        "heading_path": ["Taxonomy vs Versioning"],
        "block_start": 1,
        "block_end": 5
      }
    },
    {
      "unit_id": "link_001",
      "kind": "wiki_link",
      "locator": {
        "from_unit_id": "section_001",
        "target_title": "Index Content Policy"
      }
    }
  ]
}
```

### Wiki Signals

```json
{
  "outgoing_links": [
    {
      "target_title": "Index Content Policy",
      "relation_candidate": "references",
      "evidence_ref": "src_md_001#link_001"
    }
  ],
  "tags": ["architecture", "ingest"]
}
```

### Content-Minimal Index Document

```json
{
  "index_document_id": "kp:repo_main:source:md:sha256_ab12cd34ef90:root",
  "index_document_type": "source",
  "repository_id": "repo_main",
  "source_id": "src_md_001",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "source_version": "v001",
  "title": "Taxonomy vs Versioning",
  "media_type": "text/markdown",
  "media_hint": "md",
  "category_ids": ["source"],
  "attribute_values": {
    "source_type": "markdown"
  },
  "wiki_signal_refs": ["src_md_001#link_001"],
  "access_unit_refs": ["src_md_001#section_001"],
  "preview_refs": ["outline_preview_v001", "summary_preview_v001"],
  "outgoing_link_titles": ["Index Content Policy"],
  "tag_values": ["architecture", "ingest"],
  "source_uri": "knowledge/sources/wiki/src_md_001/versions/v001/original.md",
  "source_content_hash": "sha256:..."
}
```

Do not store the full Markdown body in the index document.

The summary preview is useful for document selection, but final answers should still fetch the exact Markdown section.

### Retrieval Proof

Query:

```text
taxonomy versioning index policy
```

Expected result:

1. Index returns `src_md_001#section_001`.
2. Retrieval service fetches that section from the source object using the manifest.
3. Answer generation uses fetched section text as evidence.

## Proof 2: Image File, JPG or PNG

Example source:

```text
knowledge/sources/images/src_img_001/versions/v001/original.jpg
```

### SourceRecord

```json
{
  "source_id": "src_img_001",
  "source_version": "v001",
  "media_type": "image/jpeg",
  "object_uri": "knowledge/sources/images/src_img_001/versions/v001/original.jpg",
  "content_hash": "sha256:...",
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0"
}
```

### SourceManifest and Renditions

```json
{
  "source_id": "src_img_001",
  "manifest_version": "v001",
  "renditions": [
    {
      "rendition_id": "original",
      "kind": "original",
      "object_uri": "knowledge/sources/images/src_img_001/versions/v001/original.jpg"
    },
    {
      "rendition_id": "standard",
      "kind": "standard",
      "object_uri": "knowledge/sources/images/src_img_001/versions/v001/derived/standard.jpg",
      "max_side_px": 1600
    },
    {
      "rendition_id": "thumbnail",
      "kind": "thumbnail",
      "object_uri": "knowledge/sources/images/src_img_001/versions/v001/derived/thumb.jpg",
      "max_side_px": 320,
      "preview": true
    }
  ],
  "access_units": [
    {
      "unit_id": "image_full",
      "kind": "image_full",
      "locator": {
        "rendition": "standard"
      }
    },
    {
      "unit_id": "region_001",
      "kind": "image_region",
      "locator": {
        "rendition": "standard",
        "bbox": [0.12, 0.18, 0.44, 0.72],
        "coordinate_space": "normalized"
      }
    }
  ]
}
```

### Taxonomy and Graph Candidates

```json
{
  "entity_candidates": [
    {
      "id": "ent_object_001",
      "type": "concept",
      "category_ids": ["knowledge_record"],
      "attribute_values": {
        "knowledge_kind": "concept",
        "confidence": 0.72
      },
      "evidence_refs": ["src_img_001#region_001"]
    }
  ],
  "taxonomy_proposals": []
}
```

The exact entity type should remain conservative unless the taxonomy has accepted image-specific entity types.

### Content-Minimal Index Document

```json
{
  "index_document_id": "kp:repo_main:access_unit:jpg:sha256_ab12cd34ef90:region_001",
  "index_document_type": "access_unit",
  "repository_id": "repo_main",
  "source_id": "src_img_001",
  "source_version_id": "srcv_jpg_sha256_ab12cd34ef90",
  "source_version": "v001",
  "media_type": "image/jpeg",
  "media_hint": "jpg",
  "access_unit_id": "region_001",
  "locator": {
    "kind": "image_region",
    "rendition": "standard",
    "bbox": [0.12, 0.18, 0.44, 0.72]
  },
  "category_ids": ["source"],
  "attribute_values": {
    "source_type": "image"
  },
  "short_label": "detected visual region",
  "preview_refs": ["thumbnail"],
  "source_uri": "knowledge/sources/images/src_img_001/versions/v001/original.jpg",
  "source_content_hash": "sha256:..."
}
```

Do not store image bytes or verbose unrestricted vision descriptions in the index.

Use the thumbnail as the default preview. Use the standard rendition for inspection and vision analysis. Use the original only when exact visual evidence is needed.

### Retrieval Proof

Query:

```text
visual region with object
```

Expected result:

1. Index returns `src_img_001#region_001`.
2. Retrieval service fetches the standard rendition or original image region.
3. Answer generation uses fetched image region or derived artifact as evidence.

## Proof 3: WAV File With Speech or Song

Example source:

```text
knowledge/sources/audio/src_wav_001/versions/v001/original.wav
```

### SourceRecord

```json
{
  "source_id": "src_wav_001",
  "source_version": "v001",
  "media_type": "audio/wav",
  "object_uri": "knowledge/sources/audio/src_wav_001/versions/v001/original.wav",
  "content_hash": "sha256:...",
  "duration_ms": 184000,
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0"
}
```

### SourceManifest and AccessUnits

```json
{
  "source_id": "src_wav_001",
  "manifest_version": "v001",
  "derived_objects": [
    {
      "object_id": "waveform_preview",
      "kind": "waveform_preview",
      "object_uri": "knowledge/sources/audio/src_wav_001/versions/v001/derived/waveform.json",
      "derived_from": ["src_wav_001#audio_full"]
    },
    {
      "object_id": "audio_proxy_preview",
      "kind": "audio_proxy_preview",
      "object_uri": "knowledge/sources/audio/src_wav_001/versions/v001/derived/preview.m4a",
      "derived_from": ["src_wav_001#audio_full"],
      "policy": "bounded_preview_only"
    },
    {
      "object_id": "transcript_v001",
      "kind": "transcript",
      "object_uri": "knowledge/sources/audio/src_wav_001/versions/v001/derived/transcript.json",
      "processor": "speech_to_text",
      "processor_version": "placeholder"
    }
  ],
  "access_units": [
    {
      "unit_id": "audio_full",
      "kind": "audio_full",
      "locator": {
        "start_ms": 0,
        "end_ms": 184000
      }
    },
    {
      "unit_id": "segment_001",
      "kind": "audio_segment",
      "locator": {
        "start_ms": 12000,
        "end_ms": 28000
      }
    },
    {
      "unit_id": "transcript_span_001",
      "kind": "transcript_span",
      "locator": {
        "transcript_ref": "transcript_v001",
        "start_ms": 12000,
        "end_ms": 28000,
        "char_start": 0,
        "char_end": 180
      }
    }
  ]
}
```

### Speech vs Song Handling

Audio can contain speech, music, or both.

Initial strategy:

- preserve original WAV;
- create time-based access units;
- create transcript-derived access units only when speech transcription exists;
- store song/music descriptors as short bounded metadata only when policy allows;
- keep lyrics-like or transcript-like full text outside the index by default.

### Content-Minimal Index Document

```json
{
  "index_document_id": "kp:repo_main:access_unit:wav:sha256_ab12cd34ef90:segment_001",
  "index_document_type": "access_unit",
  "repository_id": "repo_main",
  "source_id": "src_wav_001",
  "source_version_id": "srcv_wav_sha256_ab12cd34ef90",
  "source_version": "v001",
  "media_type": "audio/wav",
  "media_hint": "wav",
  "access_unit_id": "segment_001",
  "locator": {
    "kind": "audio_segment",
    "start_ms": 12000,
    "end_ms": 28000
  },
  "category_ids": ["source"],
  "attribute_values": {
    "source_type": "audio"
  },
  "short_label": "audio segment with speech or music",
  "derived_object_refs": ["transcript_v001"],
  "preview_refs": ["waveform_preview", "audio_proxy_preview"],
  "source_uri": "knowledge/sources/audio/src_wav_001/versions/v001/original.wav",
  "source_content_hash": "sha256:..."
}
```

Do not store full transcript text, lyrics, or audio data in the index.

For speech, transcript previews can help users select a segment. For songs or copyrighted audio, default to waveform or spectrogram previews unless access policy explicitly allows richer previews.

### Retrieval Proof

Query:

```text
audio segment about taxonomy decision
```

Expected result:

1. Index returns `src_wav_001#segment_001` or `src_wav_001#transcript_span_001`.
2. Retrieval service fetches the transcript artifact or audio segment via manifest.
3. Answer generation uses fetched transcript span or audio evidence.

## Proof 4: MP4 Video File

Example source:

```text
knowledge/sources/video/src_mp4_001/versions/v001/original.mp4
```

### SourceRecord

```json
{
  "source_id": "src_mp4_001",
  "source_version": "v001",
  "media_type": "video/mp4",
  "object_uri": "knowledge/sources/video/src_mp4_001/versions/v001/original.mp4",
  "content_hash": "sha256:...",
  "duration_ms": 642000,
  "width": 1920,
  "height": 1080,
  "frame_rate": 29.97,
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0"
}
```

### SourceManifest and AccessUnits

```json
{
  "source_id": "src_mp4_001",
  "manifest_version": "v001",
  "derived_objects": [
    {
      "object_id": "video_proxy_preview",
      "kind": "video_proxy_preview",
      "object_uri": "knowledge/sources/video/src_mp4_001/versions/v001/derived/preview_480p.mp4",
      "derived_from": ["src_mp4_001#video_full"],
      "policy": "bounded_preview_only"
    },
    {
      "object_id": "poster_frame_001",
      "kind": "poster_frame_preview",
      "object_uri": "knowledge/sources/video/src_mp4_001/versions/v001/derived/poster.jpg",
      "derived_from": ["src_mp4_001#frame_000120"]
    },
    {
      "object_id": "storyboard_v001",
      "kind": "storyboard_preview",
      "object_uri": "knowledge/sources/video/src_mp4_001/versions/v001/derived/storyboard.jpg",
      "derived_from": ["src_mp4_001@v001"]
    },
    {
      "object_id": "subtitle_v001",
      "kind": "subtitle_or_transcript",
      "object_uri": "knowledge/sources/video/src_mp4_001/versions/v001/derived/subtitles.json",
      "derived_from": ["src_mp4_001#audio_track_001"],
      "processor": "speech_to_text_or_subtitle_extractor",
      "processor_version": "placeholder"
    }
  ],
  "access_units": [
    {
      "unit_id": "video_full",
      "kind": "video_full",
      "locator": {
        "start_ms": 0,
        "end_ms": 642000
      }
    },
    {
      "unit_id": "scene_001",
      "kind": "video_scene",
      "locator": {
        "start_ms": 45000,
        "end_ms": 91000
      }
    },
    {
      "unit_id": "frame_000120",
      "kind": "video_frame",
      "locator": {
        "time_ms": 45000,
        "frame_index": 120
      }
    },
    {
      "unit_id": "frame_region_001",
      "kind": "video_frame_region",
      "locator": {
        "time_ms": 45000,
        "frame_index": 120,
        "bbox": [0.20, 0.18, 0.62, 0.74],
        "coordinate_space": "normalized"
      }
    },
    {
      "unit_id": "audio_track_001",
      "kind": "video_audio_track",
      "locator": {
        "track": "audio:0",
        "start_ms": 0,
        "end_ms": 642000
      }
    },
    {
      "unit_id": "subtitle_span_001",
      "kind": "subtitle_span",
      "locator": {
        "subtitle_ref": "subtitle_v001",
        "start_ms": 45000,
        "end_ms": 58000,
        "char_start": 0,
        "char_end": 160
      }
    }
  ]
}
```

### Video Handling

MP4 is a container format. It may contain video tracks, audio tracks, subtitles, chapters, metadata, and embedded thumbnails.

Initial strategy:

- preserve original MP4 unchanged;
- create time-based video scene access units;
- extract keyframes or poster frames as visual evidence units;
- create frame-region locators for object-level evidence;
- treat audio tracks like audio sources when transcription is available;
- treat subtitles as source-derived artifacts, not raw index content;
- create low-bitrate proxy previews only when access policy allows;
- keep full frame images, video bytes, full transcript text, and subtitles outside the index by default.

### Content-Minimal Index Document

```json
{
  "index_document_id": "kp:repo_main:access_unit:mp4:sha256_ab12cd34ef90:scene_001",
  "index_document_type": "access_unit",
  "repository_id": "repo_main",
  "source_id": "src_mp4_001",
  "source_version_id": "srcv_mp4_sha256_ab12cd34ef90",
  "source_version": "v001",
  "media_type": "video/mp4",
  "media_hint": "mp4",
  "access_unit_id": "scene_001",
  "locator": {
    "kind": "video_scene",
    "start_ms": 45000,
    "end_ms": 91000
  },
  "category_ids": ["source"],
  "attribute_values": {
    "source_type": "video"
  },
  "short_label": "video scene with visual and audio evidence",
  "derived_object_refs": ["subtitle_v001"],
  "preview_refs": ["poster_frame_001", "storyboard_v001", "video_proxy_preview"],
  "source_uri": "knowledge/sources/video/src_mp4_001/versions/v001/original.mp4",
  "source_content_hash": "sha256:..."
}
```

Do not store video bytes, frame images, full subtitles, full transcripts, or unrestricted scene descriptions in the index.

For video answers, retrieval should fetch the exact time range, keyframe, subtitle span, audio segment, or frame region needed for evidence.

### Retrieval Proof

Query:

```text
video segment explaining index policy
```

Expected result:

1. Index returns `src_mp4_001#scene_001` and possibly `src_mp4_001#subtitle_span_001`.
2. Retrieval service fetches the bounded video segment, subtitle span, or keyframe via manifest.
3. Answer generation uses fetched video/subtitle/frame evidence instead of the index document itself.

## Proof 5: Long PDF

Example source:

```text
knowledge/sources/pdf/src_pdf_001/versions/v001/original.pdf
```

### SourceRecord

```json
{
  "source_id": "src_pdf_001",
  "source_version": "v001",
  "media_type": "application/pdf",
  "object_uri": "knowledge/sources/pdf/src_pdf_001/versions/v001/original.pdf",
  "content_hash": "sha256:...",
  "page_count": 280,
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0"
}
```

### SourceManifest and AccessUnits

```json
{
  "source_id": "src_pdf_001",
  "manifest_version": "v001",
  "derived_objects": [
    {
      "object_id": "summary_doc_v001",
      "kind": "document_summary",
      "object_uri": "knowledge/sources/pdf/src_pdf_001/versions/v001/derived/summary.json",
      "derived_from": ["src_pdf_001@v001"]
    },
    {
      "object_id": "page_thumbnail_001",
      "kind": "page_thumbnail_preview",
      "object_uri": "knowledge/sources/pdf/src_pdf_001/versions/v001/derived/pages/page_001_thumb.jpg",
      "derived_from": ["src_pdf_001#page_001"]
    }
  ],
  "access_units": [
    {
      "unit_id": "page_001",
      "kind": "pdf_page",
      "locator": { "page": 1 }
    },
    {
      "unit_id": "page_001_block_003",
      "kind": "pdf_text_block",
      "locator": {
        "page": 1,
        "bbox": [72, 144, 520, 240]
      }
    },
    {
      "unit_id": "page_001_table_001",
      "kind": "pdf_table",
      "locator": {
        "page": 1,
        "bbox": [72, 300, 520, 520]
      }
    }
  ]
}
```

### Summary and Detail Split

For long PDFs, create multiple retrieval levels:

- source-level summary artifact;
- chapter or section summaries when structure is available;
- page-level access units;
- text-block access units;
- table/figure access units.

The index stores refs and metadata. Summary text and extracted text live as source-derived artifacts or access units, not as full index content.

### Content-Minimal Index Document

```json
{
  "index_document_id": "kp:repo_main:access_unit:pdf:sha256_ab12cd34ef90:page_001_block_003",
  "index_document_type": "access_unit",
  "repository_id": "repo_main",
  "source_id": "src_pdf_001",
  "source_version_id": "srcv_pdf_sha256_ab12cd34ef90",
  "source_version": "v001",
  "media_type": "application/pdf",
  "media_hint": "pdf",
  "access_unit_id": "page_001_block_003",
  "locator": {
    "kind": "pdf_text_block",
    "page": 1,
    "bbox": [72, 144, 520, 240]
  },
  "summary_ref": "summary_doc_v001",
  "preview_refs": ["summary_doc_v001", "page_thumbnail_001"],
  "category_ids": ["source"],
  "attribute_values": {
    "source_type": "pdf"
  },
  "source_uri": "knowledge/sources/pdf/src_pdf_001/versions/v001/original.pdf",
  "source_content_hash": "sha256:..."
}
```

Do not store full page text or full extracted PDF text in `_source`.

For long PDFs, preview artifacts make navigation practical. The summary preview helps select a candidate area, while page thumbnails help humans inspect layout before fetching exact blocks.

### Retrieval Proof

Query:

```text
find the section discussing index policy
```

Expected result:

1. Index returns a small set of page/block refs.
2. Retrieval service fetches exact page/block text from derived text artifacts or re-parses the source range.
3. Answer generation uses fetched text blocks as evidence.

## Cross-Proof Observations

The architecture holds if these rules remain true:

- original content stays in object storage;
- manifests describe how to re-access source units;
- preview artifacts speed up browsing without replacing source evidence;
- indexes store retrieval metadata, not full source content;
- taxonomy controls meaning, not chunking or file layout;
- media strategies differ internally but produce shared contracts;
- answers are generated from fetched source units.

## Additional Implementation Checks

Before implementation, verify these points:

- every index document has deterministic ID behavior across repeated ingest;
- every preview artifact has a `derived_from` chain;
- every derived object records generator name, generator version, and config hash when applicable;
- extension-based hints never override detected `media_type`;
- hash prefixes are checked against full hashes for collision;
- large previews are stored as objects, not copied into OpenSearch;
- access control applies to previews as well as originals;
- source updates create new source versions, while taxonomy updates create new projections;
- parser policy changes can regenerate manifests and access units without changing source version IDs.

## Concept Proof Result

The current architecture can support all five media types with the same high-level contract.

The main missing implementation detail is concrete schema work for:

- `SourceRecord`;
- `SourceManifest`;
- `AccessUnit`;
- `IngestArtifact`;
- content-minimal `OpenSearchDocument`;
- media-specific `locator` variants.
