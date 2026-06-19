# Media Curation Concept Proofs

This document validates the `curation` stage across supported media types.

It focuses only on curation.

It does not redefine ingest, understand, connect, plan, retrieve, reason, verify, update, or evaluate.

## Curation Stage Rule

`curation` consumes `UpdateToCurationHandoff`.

It produces `CurationDecision` artifacts, optional durable records or lifecycle updates, and a `CurationToEvaluateHandoff`.

```text
UpdateToCurationHandoff
  -> Curation Agent
  -> CurationDecision[]
  -> durable records or lifecycle updates
  -> CurationToEvaluateHandoff
```

For every media type, curation must preserve:

- update candidate refs;
- curation decision refs;
- source refs;
- source version refs when available;
- evidence refs;
- verification refs;
- review refs when present;
- media locator refs;
- lifecycle status;
- rationale.

Curation may write durable memory only through explicit `CurationDecision` artifacts.

## Common Curation Decision Shape

Recommended shape:

```json
{
  "curation_decision_id": "cur_run_001_001",
  "decision_type": "accept",
  "target_candidate_ref": "upd_md_claim_001",
  "status": "completed",
  "rationale": "Candidate is verified, concise, reusable, and source-grounded.",
  "source_refs": ["src_md_001"],
  "evidence_refs": ["src_md_001#section_001"],
  "verification_refs": ["vrr_md_claim_001"],
  "media_basis": "markdown_section",
  "created_record_refs": ["claim_001"],
  "updated_record_refs": [],
  "lifecycle_event_refs": [],
  "requires_human_approval": false
}
```

The decision is durable governance metadata.

It explains why a candidate did or did not become durable knowledge.

## Proof 1: Markdown

Input candidate:

```json
{
  "candidate_id": "upd_md_claim_001",
  "candidate_type": "verified_claim",
  "status": "proposed",
  "proposed_record_kind": "claim",
  "statement": "Taxonomy describes meaning and classification, while versioning describes change over time.",
  "verification_result_refs": ["vrr_md_claim_001"],
  "source_refs": ["src_md_001"],
  "evidence_refs": ["src_md_001#section_001"],
  "media_basis": "markdown_section",
  "requires_review": false
}
```

Expected curation decision:

```json
{
  "curation_decision_id": "cur_md_claim_001",
  "decision_type": "accept",
  "target_candidate_ref": "upd_md_claim_001",
  "status": "completed",
  "rationale": "Verified Markdown claim is concise, reusable, and evidence-linked.",
  "source_refs": ["src_md_001"],
  "evidence_refs": ["src_md_001#section_001"],
  "verification_refs": ["vrr_md_claim_001"],
  "media_basis": "markdown_section",
  "created_record_refs": ["claim_md_001"],
  "requires_human_approval": false
}
```

Validation:

- Markdown evidence ref resolves through candidate provenance;
- durable claim preserves curation decision ref and evidence refs;
- candidate statement is not full copied source content;
- if an older claim conflicts, curation uses `supersede` or `defer` rather than overwrite;
- Markdown is the first durable curation implementation path.

## Proof 2: Image, JPG or PNG

Input candidate:

```json
{
  "candidate_id": "upd_img_review_001",
  "candidate_type": "open_question",
  "status": "needs_review",
  "proposed_record_kind": "question",
  "statement": "Does image region src_img_001#region_003 show an OpenSearch-labeled box?",
  "verification_result_refs": ["vrr_img_claim_001"],
  "source_refs": ["src_img_001"],
  "evidence_refs": ["src_img_001#region_003"],
  "media_basis": "image_region",
  "requires_review": true
}
```

Expected curation decision:

```json
{
  "curation_decision_id": "cur_img_question_001",
  "decision_type": "defer",
  "target_candidate_ref": "upd_img_review_001",
  "status": "completed",
  "rationale": "Image interpretation is review-required and should not become a factual claim without human or high-confidence OCR confirmation.",
  "source_refs": ["src_img_001"],
  "evidence_refs": ["src_img_001#region_003"],
  "verification_refs": ["vrr_img_claim_001"],
  "media_basis": "image_region",
  "created_record_refs": [],
  "requires_human_approval": true
}
```

Validation:

- curation preserves image region locator refs;
- uncertain visual interpretation is not accepted as a durable fact;
- a durable `Question` may be created only when the open question is useful and review policy allows it;
- high-confidence OCR or human annotation may later support `accept`;
- previews and thumbnails are review aids unless explicitly verified as evidence.

## Proof 3: WAV Audio or Music

Input candidate:

```json
{
  "candidate_id": "upd_wav_procedure_001",
  "candidate_type": "procedure",
  "status": "proposed",
  "proposed_record_kind": "procedure",
  "statement": "Rollback should preserve older records and add supersession or quarantine metadata instead of silently overwriting knowledge.",
  "verification_result_refs": ["vrr_wav_claim_001"],
  "source_refs": ["src_wav_001"],
  "evidence_refs": ["src_wav_001#transcript_span_014"],
  "media_basis": "audio_transcript_span",
  "requires_review": true
}
```

Expected curation decision:

```json
{
  "curation_decision_id": "cur_wav_procedure_001",
  "decision_type": "needs_more_evidence",
  "target_candidate_ref": "upd_wav_procedure_001",
  "status": "completed",
  "rationale": "Transcript-derived procedure is potentially useful, but audio-derived durable records require transcript confidence or review resolution.",
  "source_refs": ["src_wav_001"],
  "evidence_refs": ["src_wav_001#transcript_span_014"],
  "verification_refs": ["vrr_wav_claim_001"],
  "media_basis": "audio_transcript_span",
  "created_record_refs": [],
  "requires_human_approval": true
}
```

Validation:

- transcript span and timestamp provenance are preserved;
- low-confidence transcription blocks durable acceptance;
- speaker identity or intent is not curated without explicit evidence;
- music-only candidates require human annotation or acoustic evidence;
- audio-derived durable records are deferred for the Markdown-first MVP.

## Proof 4: MP4 Video

Input candidate:

```json
{
  "candidate_id": "upd_mp4_failed_approach_001",
  "candidate_type": "failed_approach",
  "status": "needs_review",
  "proposed_record_kind": "procedure",
  "statement": "A retrieval demo that shows search results without cited evidence should not be treated as a verified answer workflow.",
  "verification_result_refs": ["vrr_mp4_claim_001"],
  "source_refs": ["src_mp4_001"],
  "evidence_refs": ["src_mp4_001#scene_006"],
  "media_basis": "video_scene",
  "requires_review": true
}
```

Expected curation decision:

```json
{
  "curation_decision_id": "cur_mp4_failed_approach_001",
  "decision_type": "defer",
  "target_candidate_ref": "upd_mp4_failed_approach_001",
  "status": "completed",
  "rationale": "Video scene may support a workflow warning, but scene interpretation needs review before becoming durable procedure memory.",
  "source_refs": ["src_mp4_001"],
  "evidence_refs": ["src_mp4_001#scene_006"],
  "verification_refs": ["vrr_mp4_claim_001"],
  "media_basis": "video_scene",
  "created_record_refs": [],
  "requires_human_approval": true
}
```

Validation:

- scene, frame, subtitle, transcript, OCR, or keyframe refs are preserved;
- video-derived claims should identify which basis supports the decision;
- screen-recording claims should prefer verified OCR, subtitles, or transcript access units;
- scene-only interpretation should usually defer or require review;
- video-derived durable records are deferred for the Markdown-first MVP.

## Proof 5: Long PDF

Input candidate:

```json
{
  "candidate_id": "upd_pdf_decision_001",
  "candidate_type": "decision",
  "status": "proposed",
  "proposed_record_kind": "decision",
  "statement": "Index projections should store content-minimal retrieval metadata and retain refs back to original source units.",
  "verification_result_refs": ["vrr_pdf_claim_001"],
  "source_refs": ["src_pdf_001"],
  "evidence_refs": ["src_pdf_001#page_014#block_003"],
  "media_basis": "pdf_text_block",
  "requires_review": false
}
```

Expected curation decision:

```json
{
  "curation_decision_id": "cur_pdf_decision_001",
  "decision_type": "accept",
  "target_candidate_ref": "upd_pdf_decision_001",
  "status": "completed",
  "rationale": "Verified PDF text block supports a concise architecture decision and retains page/block provenance.",
  "source_refs": ["src_pdf_001"],
  "evidence_refs": ["src_pdf_001#page_014#block_003"],
  "verification_refs": ["vrr_pdf_claim_001"],
  "media_basis": "pdf_text_block",
  "created_record_refs": ["decision_pdf_001"],
  "requires_human_approval": false
}
```

Validation:

- PDF page and block refs resolve through candidate provenance;
- curation does not copy long PDF content into durable memory;
- scanned PDFs require OCR confidence or review;
- table-derived decisions preserve table row, cell, or range refs;
- PDF curation can follow Markdown rules only when verified text access units exist.

## Media Readiness Summary

| Media type | Durable curation in Markdown-first MVP | Default curation behavior |
| --- | --- | --- |
| Markdown | Supported | Accept concise verified candidates when reusable |
| Image | Deferred | Defer or require review unless human/OCR evidence is resolved |
| WAV/audio | Deferred | Needs more evidence or review unless transcript confidence is stable |
| MP4/video | Deferred | Defer or require review unless scene/subtitle/transcript basis is stable |
| PDF | Limited | Accept only verified text access-unit candidates |

## Terminology Check

Use:

- `CurationDecision` for the durable governance decision;
- `durable record` for accepted knowledge created by curation;
- `lifecycle update` for durable state changes such as `superseded`, `retracted`, `quarantined`, or `tombstoned`;
- `media_basis` for the media evidence basis preserved from update;
- `requires_human_approval` for curation decisions that cannot safely proceed automatically.

Avoid:

- calling update candidates durable records;
- accepting uncertain media interpretation as durable fact;
- copying raw media, transcripts, or long PDF text into durable memory;
- overwriting older records silently;
- treating review aids such as thumbnails or storyboards as evidence without verification.

## Design Rule

Media curation is stricter than media update.

Update may propose review-worthy candidates.

Curation decides whether they deserve durable memory, durable lifecycle state, or no durable write.
