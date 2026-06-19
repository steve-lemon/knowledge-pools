# Media Update Concept Proofs

This document validates the `update` stage across supported media types.

It focuses only on update.

It does not redefine ingest, understand, connect, plan, retrieve, reason, verify, curation, or evaluate.

## Update Stage Rule

`update` consumes `VerifyToUpdateHandoff`.

It produces `UpdateCandidate` artifacts and an `UpdateToCurationHandoff`.

```text
VerifyToUpdateHandoff
  -> Knowledge Update Agent
  -> UpdateCandidate[]
  -> UpdateToCurationHandoff
```

For every media type, update must preserve:

- verification report ref;
- verification result refs;
- source refs;
- source version refs when available;
- evidence refs;
- media locator refs;
- review refs;
- candidate status;
- candidate type;
- reason for candidate selection or rejection.

The update stage must not write durable memory.

## Common Update Candidate Shape

Recommended shape:

```json
{
  "candidate_id": "upd_run_001_001",
  "candidate_type": "verified_claim",
  "status": "proposed",
  "proposed_record_kind": "claim",
  "statement": "The source distinguishes taxonomy from versioning.",
  "verification_report_ref": "artifact://runs/run_001/verify/report.json",
  "verification_result_refs": ["vrr_md_claim_001"],
  "source_refs": ["src_md_001"],
  "evidence_refs": ["src_md_001#section_001"],
  "media_basis": "markdown_section",
  "requires_review": false,
  "selection_reason": "Verified claim is reusable beyond the current answer."
}
```

The candidate proposes a memory change.

It is not durable memory.

## Proof 1: Markdown

Verified input:

```json
{
  "verification_result_id": "vrr_md_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "status": "verified",
  "evidence_refs": ["src_md_001#section_001"],
  "media_basis": "markdown_section"
}
```

Expected update output:

```json
{
  "candidate_id": "upd_md_claim_001",
  "candidate_type": "verified_claim",
  "status": "proposed",
  "proposed_record_kind": "claim",
  "statement": "Taxonomy describes meaning and classification, while versioning describes change over time.",
  "verification_report_ref": "artifact://runs/run_001/verify/report.json",
  "verification_result_refs": ["vrr_md_claim_001"],
  "source_refs": ["src_md_001"],
  "evidence_refs": ["src_md_001#section_001"],
  "media_basis": "markdown_section",
  "requires_review": false,
  "selection_reason": "Verified Markdown claim is concise, reusable, and source-grounded."
}
```

Validation:

- Markdown section ref resolves;
- candidate statement is concise and not a copied full section;
- source version and verification result refs are preserved;
- unsupported Markdown claims become `open_question` or `needs_more_evidence`, not `verified_claim`;
- this is the first implementation path.

## Proof 2: Image, JPG or PNG

Verified or uncertain input:

```json
{
  "verification_result_id": "vrr_img_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "status": "uncertain",
  "evidence_refs": ["src_img_001#region_003"],
  "media_basis": "image_region",
  "requires_review": true
}
```

Expected update output:

```json
{
  "candidate_id": "upd_img_review_001",
  "candidate_type": "open_question",
  "status": "needs_review",
  "proposed_record_kind": "question",
  "statement": "Does image region src_img_001#region_003 show an OpenSearch-labeled box?",
  "verification_report_ref": "artifact://runs/run_001/verify/report.json",
  "verification_result_refs": ["vrr_img_claim_001"],
  "source_refs": ["src_img_001"],
  "evidence_refs": ["src_img_001#region_003"],
  "media_basis": "image_region",
  "requires_review": true,
  "selection_reason": "Visual interpretation was uncertain and should not become a fact without review."
}
```

Validation:

- image update candidates must preserve region locator refs;
- thumbnail or preview refs can help review but cannot become factual support by themselves;
- uncertain visual interpretation should create review or open-question candidates;
- high-confidence OCR or human-labeled regions may later create `verified_claim` candidates after verification;
- raw image pixels are not copied into the candidate.

## Proof 3: WAV Audio or Music

Verified input:

```json
{
  "verification_result_id": "vrr_wav_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "status": "verified",
  "evidence_refs": ["src_wav_001#transcript_span_014"],
  "media_basis": "audio_transcript_span"
}
```

Expected update output:

```json
{
  "candidate_id": "upd_wav_procedure_001",
  "candidate_type": "procedure",
  "status": "proposed",
  "proposed_record_kind": "procedure",
  "statement": "Rollback should preserve older records and add supersession or quarantine metadata instead of silently overwriting knowledge.",
  "verification_report_ref": "artifact://runs/run_001/verify/report.json",
  "verification_result_refs": ["vrr_wav_claim_001"],
  "source_refs": ["src_wav_001"],
  "evidence_refs": ["src_wav_001#transcript_span_014"],
  "media_basis": "audio_transcript_span",
  "requires_review": true,
  "selection_reason": "Transcript span contains a potentially reusable procedure, but transcript-derived updates require review."
}
```

Validation:

- transcript span and timestamp refs are preserved;
- low transcription confidence creates `needs_more_evidence` or review candidates;
- music-only claims require explicit annotation before update candidates are emitted;
- speaker identity, intent, and emotion are not promoted without verified evidence;
- audio-derived update candidates remain deferred for the Markdown-first MVP.

## Proof 4: MP4 Video

Verified input:

```json
{
  "verification_result_id": "vrr_mp4_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "status": "verified",
  "evidence_refs": ["src_mp4_001#scene_006"],
  "media_basis": "video_scene"
}
```

Expected update output:

```json
{
  "candidate_id": "upd_mp4_failed_approach_001",
  "candidate_type": "failed_approach",
  "status": "needs_review",
  "proposed_record_kind": "procedure",
  "statement": "A retrieval demo that shows search results without cited evidence should not be treated as a verified answer workflow.",
  "verification_report_ref": "artifact://runs/run_001/verify/report.json",
  "verification_result_refs": ["vrr_mp4_claim_001"],
  "source_refs": ["src_mp4_001"],
  "evidence_refs": ["src_mp4_001#scene_006"],
  "media_basis": "video_scene",
  "requires_review": true,
  "selection_reason": "Video scene may indicate a reusable workflow warning, but scene interpretation needs review."
}
```

Validation:

- scene, frame, subtitle, or transcript refs are preserved;
- video previews or storyboards are review aids, not factual support by themselves;
- a video-derived candidate should specify whether it came from visual scene, subtitle, transcript, or human annotation;
- screen-recording claims should prefer OCR/subtitle/text access units when available;
- video-derived update candidates remain deferred for the Markdown-first MVP.

## Proof 5: Long PDF

Verified input:

```json
{
  "verification_result_id": "vrr_pdf_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "status": "verified",
  "evidence_refs": ["src_pdf_001#page_014#block_003"],
  "media_basis": "pdf_text_block"
}
```

Expected update output:

```json
{
  "candidate_id": "upd_pdf_decision_001",
  "candidate_type": "decision",
  "status": "proposed",
  "proposed_record_kind": "decision",
  "statement": "Index projections should store content-minimal retrieval metadata and retain refs back to original source units.",
  "verification_report_ref": "artifact://runs/run_001/verify/report.json",
  "verification_result_refs": ["vrr_pdf_claim_001"],
  "source_refs": ["src_pdf_001"],
  "evidence_refs": ["src_pdf_001#page_014#block_003"],
  "media_basis": "pdf_text_block",
  "requires_review": false,
  "selection_reason": "Verified PDF text block supports a reusable architecture decision."
}
```

Validation:

- PDF page and block refs resolve;
- candidate does not copy long PDF text;
- scanned PDFs require OCR confidence and may require review;
- table-derived claims preserve table cell or row refs;
- PDF updates can follow Markdown rules only when verified text access units exist.

## Media Readiness Summary

| Media type | Candidate support in Markdown-first MVP | Default update behavior |
| --- | --- | --- |
| Markdown | Supported | Emit verified candidates when reusable |
| Image | Deferred | Emit review or open-question candidates only |
| WAV/audio | Deferred | Emit review candidates from verified transcript spans only after transcript path is ready |
| MP4/video | Deferred | Emit review candidates from verified scene/subtitle/transcript refs only after media path is ready |
| PDF | Limited | Treat as text only when verified text access units exist |

## Terminology Check

Use:

- `UpdateCandidate` for proposed reusable memory changes;
- `update signal` for a verified or feedback-derived reason to inspect an item;
- `selection_reason` for why update emitted or skipped a candidate;
- `media_basis` for the evidence basis, such as `markdown_section`, `image_region`, `audio_transcript_span`, `video_scene`, or `pdf_text_block`;
- `requires_review` for candidates that need human or policy review.

Avoid:

- calling update candidates durable memory;
- calling media previews evidence unless verification approved the exact preview basis;
- calling uncertain visual, audio, or video interpretation a verified fact;
- using `relation candidate` for update outputs;
- copying raw media or full source content into update candidates.

## Design Rule

Media update is conservative.

If the system cannot point back to verified media evidence, it should create a review or open-question candidate, not memory.
