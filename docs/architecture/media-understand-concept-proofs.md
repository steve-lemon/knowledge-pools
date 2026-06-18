# Media Understand Concept Proofs

This document proves how the `understand` stage can work across different media types.

Ingest makes media addressable.

Understand makes media meaningful as source-grounded knowledge candidates.

## Core Rule

Media-specific understanding must still produce the same shared candidate contract.

```text
AccessUnit + derived readable artifact
  -> Understanding Agent
  -> KnowledgeCandidate
  -> evidence refs
  -> ambiguity/review refs
```

The output remains candidate-level.

Understand does not create durable knowledge records.

## Shared Candidate Kinds

All media types should map to the same v1 candidate kinds when possible:

| Candidate kind | Meaning |
| --- | --- |
| `claim_candidate` | A statement that may be true, false, scoped, or time-bound |
| `decision_candidate` | A possible decision with rationale or tradeoffs |
| `concept_candidate` | A named idea, object, term, or domain concept |
| `procedure_candidate` | A reusable workflow, process, or ordered steps |
| `question_candidate` | An unresolved or explicitly asked question |
| `constraint_candidate` | A rule, limitation, policy, or requirement |
| `summary_candidate` | A bounded interpretive summary of one source unit |

Media-specific details should live in evidence locators, ambiguity notes, and generator metadata.

## Media Content Matrix

| Media | Expected content types | Strong understand targets | Risky targets |
| --- | --- | --- | --- |
| Markdown/text | headings, paragraphs, lists, tables, links, tags, code blocks | claims, decisions, concepts, procedures, questions, constraints | inferred intent, unstated rationale |
| Image | OCR text, visual objects, labels, diagrams, screenshots, handwritten text | OCR-backed claims, depicted concepts, diagram elements, UI states | broad scene meaning, identity, unverifiable visual inference |
| WAV/audio | speech, music, silence, speaker turns, transcript spans, acoustic events | transcript-backed claims/questions/decisions, segment summaries | lyrics-like content, emotion, speaker identity, music meaning |
| MP4/video | subtitles, speech, scenes, frames, UI demos, gestures, screen recordings | transcript-backed claims, scene summaries, procedure steps, visual states | action interpretation without evidence, identity, intent |
| PDF | pages, headings, paragraphs, tables, figures, citations, footnotes | claims, concepts, procedures, constraints, table facts, section summaries | layout-only inference, table misread, citation meaning without context |

## Proof 1: Markdown/Text

### Expected Content

Markdown can contain:

- headings;
- paragraphs;
- lists;
- explicit decision blocks;
- question sections;
- glossary definitions;
- wiki links;
- tags;
- code blocks;
- tables.

### Understand Strategy

V1 should use deterministic structural extractors first.

Rules:

- heading and nearby paragraph can produce `concept_candidate`;
- explicit `Decision:` section can produce `decision_candidate`;
- heading ending with `?` can produce `question_candidate`;
- ordered list under process-like heading can produce `procedure_candidate`;
- requirement words such as `must`, `should`, `cannot`, `required` can produce `constraint_candidate`;
- short declarative design statements can produce `claim_candidate`.

### Concept Proof

Input access unit:

```markdown
# Index Content Policy

OpenSearch stores retrieval projections, not source truth.

The index must not store full source text.

## Open Question

Should source text be indexed but excluded from `_source`?
```

Output candidates:

```json
[
  {
    "candidate_kind": "claim_candidate",
    "short_label": "OpenSearch stores retrieval projections",
    "statement_ref": "artifact://understanding/kc_claim_001/statement",
    "evidence_refs": ["src_md_001#section_001"],
    "confidence": 0.9
  },
  {
    "candidate_kind": "constraint_candidate",
    "short_label": "Index must not store full source text",
    "statement_ref": "artifact://understanding/kc_constraint_001/statement",
    "evidence_refs": ["src_md_001#section_001"],
    "confidence": 0.88
  },
  {
    "candidate_kind": "question_candidate",
    "short_label": "Should source text be indexed but excluded from source?",
    "statement_ref": "artifact://understanding/kc_question_001/statement",
    "evidence_refs": ["src_md_001#section_002"],
    "confidence": 0.92
  }
]
```

### Ambiguity

Markdown ambiguity usually comes from:

- implicit claims;
- vague headings;
- mixed prose and examples;
- code blocks that look like text statements but are examples.

## Proof 2: Image

### Expected Content

Images can contain:

- OCR text;
- diagrams;
- charts;
- UI screenshots;
- signs and labels;
- visual objects;
- handwritten notes;
- regions with uncertain meaning.

### Understand Strategy

V1 should be conservative.

Strong candidates should come from:

- OCR text;
- explicit labels;
- diagrams with clear text;
- UI screenshots with visible states;
- human-reviewed visual annotations.

Visual-only inference should usually become ambiguity or review request.

### Concept Proof

Input access units:

```text
src_img_001#region_001
src_img_001#ocr_span_001
```

OCR text:

```text
Pipeline: ingest -> understand -> connect
```

Output candidates:

```json
[
  {
    "candidate_kind": "procedure_candidate",
    "short_label": "Pipeline from ingest to connect",
    "statement_ref": "artifact://understanding/kc_procedure_img_001/statement",
    "evidence_refs": ["src_img_001#ocr_span_001", "src_img_001#region_001"],
    "confidence": 0.76,
    "requires_review": true
  },
  {
    "candidate_kind": "concept_candidate",
    "short_label": "Pipeline diagram",
    "statement_ref": "artifact://understanding/kc_concept_img_001/statement",
    "evidence_refs": ["src_img_001#region_001"],
    "confidence": 0.66,
    "requires_review": true
  }
]
```

Review request:

```json
{
  "review_kind": "visual_check",
  "target_ref": "kc_procedure_img_001",
  "reason": "Procedure candidate is derived from OCR and diagram layout.",
  "evidence_refs": ["src_img_001#region_001"],
  "blocking": false
}
```

### Ambiguity

Image ambiguity usually comes from:

- OCR quality;
- cropped context;
- diagram arrows;
- visual object identity;
- chart axis interpretation;
- screenshot state without surrounding workflow.

## Proof 3: WAV/Audio

### Expected Content

Audio can contain:

- speech;
- speaker turns;
- meeting discussion;
- lecture explanation;
- music;
- silence or noise;
- transcript spans;
- timestamps.

### Understand Strategy

Understand should prefer transcript-backed candidates.

For speech:

- transcript spans can produce claims, decisions, questions, constraints, and summaries;
- time ranges become required evidence locators;
- speaker labels are optional and should be treated as uncertain unless verified.

For music or song:

- avoid full lyric-like extraction by default;
- use bounded descriptors and segment summaries only when policy allows;
- preserve waveform/spectrogram refs for navigation.

### Concept Proof

Transcript span:

```text
[00:12-00:28] We decided that OpenSearch should store only retrieval projections, not original document text.
```

Output candidates:

```json
[
  {
    "candidate_kind": "decision_candidate",
    "short_label": "OpenSearch stores retrieval projections only",
    "statement_ref": "artifact://understanding/kc_decision_audio_001/statement",
    "evidence_refs": ["src_wav_001#transcript_span_001"],
    "confidence": 0.84
  },
  {
    "candidate_kind": "constraint_candidate",
    "short_label": "Original document text should not be stored in OpenSearch",
    "statement_ref": "artifact://understanding/kc_constraint_audio_001/statement",
    "evidence_refs": ["src_wav_001#transcript_span_001"],
    "confidence": 0.8
  }
]
```

Evidence locator:

```json
{
  "evidence_ref": "src_wav_001#transcript_span_001",
  "start_ms": 12000,
  "end_ms": 28000,
  "transcript_ref": "transcript_v001"
}
```

### Ambiguity

Audio ambiguity usually comes from:

- transcription error;
- overlapping speakers;
- missing speaker identity;
- low audio quality;
- sarcasm or disagreement;
- music or lyrics policy limits.

## Proof 4: MP4/Video

### Expected Content

Video can contain:

- subtitle spans;
- speech transcript;
- scenes;
- frames;
- screen recordings;
- UI workflows;
- diagrams on screen;
- gestures and visual demonstrations.

### Understand Strategy

Video understanding should combine:

- subtitle/transcript spans for verbal claims;
- frame or scene refs for visual evidence;
- storyboard/poster refs for navigation;
- time ranges for every candidate.

V1 should prefer transcript-backed candidates.

Visual-only procedure extraction should require review.

### Concept Proof

Subtitle span:

```text
[00:45-00:58] First ingest the source, then understand it into candidates, then connect those candidates to existing knowledge.
```

Output candidates:

```json
[
  {
    "candidate_kind": "procedure_candidate",
    "short_label": "Ingest, understand, then connect",
    "statement_ref": "artifact://understanding/kc_procedure_video_001/statement",
    "evidence_refs": ["src_mp4_001#subtitle_span_001", "src_mp4_001#scene_001"],
    "confidence": 0.86
  },
  {
    "candidate_kind": "concept_candidate",
    "short_label": "Knowledge candidate pipeline",
    "statement_ref": "artifact://understanding/kc_concept_video_001/statement",
    "evidence_refs": ["src_mp4_001#subtitle_span_001"],
    "confidence": 0.72
  }
]
```

### Ambiguity

Video ambiguity usually comes from:

- scene boundaries;
- visual action without narration;
- screen text OCR quality;
- timing mismatch between subtitle and frame;
- inferred intent from gestures;
- edited clips missing context.

## Proof 5: PDF

### Expected Content

PDFs can contain:

- pages;
- headings;
- paragraphs;
- tables;
- figures;
- citations;
- footnotes;
- scanned OCR text;
- layout blocks.

### Understand Strategy

PDF understanding should work from page/block access units.

Strong candidates can come from:

- headings and paragraphs;
- explicit requirements;
- tables with clear headers;
- captions;
- section summaries.

Scanned PDFs should carry OCR quality notes.

Tables should preserve cell, row, column, and page refs when possible.

### Concept Proof

PDF text block:

```text
Section 3.2 Retention
All source versions must remain addressable while any evidence reference points to them.
```

Output candidates:

```json
[
  {
    "candidate_kind": "constraint_candidate",
    "short_label": "Source versions remain addressable while evidence refs depend on them",
    "statement_ref": "artifact://understanding/kc_constraint_pdf_001/statement",
    "evidence_refs": ["src_pdf_001#page_003_block_012"],
    "confidence": 0.91
  },
  {
    "candidate_kind": "concept_candidate",
    "short_label": "Retention policy",
    "statement_ref": "artifact://understanding/kc_concept_pdf_001/statement",
    "evidence_refs": ["src_pdf_001#page_003_heading_002"],
    "confidence": 0.78
  }
]
```

Table example:

```json
{
  "candidate_kind": "claim_candidate",
  "short_label": "Retention applies to source versions with active evidence refs",
  "statement_ref": "artifact://understanding/kc_claim_pdf_table_001/statement",
  "evidence_refs": ["src_pdf_001#page_004_table_001_cell_r2_c3"],
  "confidence": 0.74,
  "requires_review": true
}
```

### Ambiguity

PDF ambiguity usually comes from:

- OCR quality;
- multi-column reading order;
- table header association;
- figure/caption association;
- footnote scope;
- scanned document artifacts.

## Cross-Media Rules

1. Prefer exact source-unit evidence over preview artifacts.
2. Use preview artifacts for navigation and triage, not final grounding.
3. Keep long generated descriptions outside OpenSearch.
4. Require review when meaning depends on visual-only or audio-only inference.
5. Preserve media locators in evidence refs.
6. Emit fewer high-confidence candidates rather than many vague candidates.
7. Keep every output as candidate-level until connect, verify, and curation.

## V1 Priority

V1 implementation order:

1. Markdown/text structural understanding.
2. PDF text-block understanding when text extraction is available.
3. Audio/video transcript-span understanding.
4. Image OCR-backed understanding.
5. Visual-only image/video candidate extraction after review workflows exist.

## Design Rule

Understand should not force every medium into text too early.

It should convert each medium into evidence-grounded candidate knowledge while preserving the locator needed to inspect the original source.
