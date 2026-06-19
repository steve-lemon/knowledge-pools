# Media Verify Concept Proofs

This document validates the `verify` stage across supported media types.

It focuses only on verification.

It does not redefine ingest, understand, connect, plan, retrieve, reason, update, or curation.

## Verify Stage Rule

`verify` consumes `ConnectToVerifyHandoff` or `ReasonToVerifyHandoff`.

It produces `VerificationReport` and per-target `VerificationResult` artifacts.

```text
ReasonToVerifyHandoff
  -> Verifier Agent
  -> VerificationResult[]
  -> VerificationReport
```

For every media type, verify must preserve:

- verification target ref;
- cited evidence refs;
- evidence bundle ref when verifying answers;
- source version and lifecycle status;
- support status;
- missing evidence refs;
- stale evidence refs;
- contradiction refs;
- review refs when confidence is insufficient.

## Common Verification Result Shape

Recommended shape:

```json
{
  "verification_result_id": "vrr_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "target_type": "draft_claim",
  "status": "verified",
  "checks": [
    {
      "check_id": "cited_evidence_resolves",
      "status": "passed"
    },
    {
      "check_id": "claim_supported_by_cited_evidence",
      "status": "passed"
    }
  ],
  "evidence_refs": [
    "src_md_001#section_001"
  ],
  "confidence": 0.78,
  "requires_review": false
}
```

The result verifies a target.

It does not rewrite the draft answer.

It does not accept durable memory.

## Proof 1: Markdown

Input claim:

```json
{
  "claim_ref": "claim://runs/run_001/reason/claim_001",
  "text": "Taxonomy describes meaning and classification, while versioning describes change over time.",
  "supporting_evidence_refs": ["src_md_001#section_001"]
}
```

Expected verification:

```json
{
  "verification_result_id": "vrr_md_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "target_type": "draft_claim",
  "status": "verified",
  "checks": [
    {
      "check_id": "cited_evidence_resolves",
      "status": "passed"
    },
    {
      "check_id": "markdown_section_supports_claim",
      "status": "passed"
    }
  ],
  "evidence_refs": ["src_md_001#section_001"],
  "requires_review": false
}
```

Validation:

- cited Markdown section exists in the evidence bundle;
- source version is current or explicitly historical;
- claim is not broader than the cited section;
- assumptions are not marked verified.

## Proof 2: Image, JPG or PNG

Input claim:

```json
{
  "claim_ref": "claim://runs/run_001/reason/claim_001",
  "text": "The selected image region appears to contain an OpenSearch-labeled box.",
  "supporting_evidence_refs": ["src_img_001#region_003"]
}
```

Expected verification:

```json
{
  "verification_result_id": "vrr_img_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "target_type": "draft_claim",
  "status": "uncertain",
  "checks": [
    {
      "check_id": "image_region_resolves",
      "status": "passed"
    },
    {
      "check_id": "ocr_or_label_confidence_sufficient",
      "status": "warning"
    }
  ],
  "evidence_refs": ["src_img_001#region_003"],
  "requires_review": true
}
```

Validation:

- image region locator resolves;
- coordinate and rendition basis are preserved;
- OCR or detected label confidence affects status;
- visual claims may be `uncertain` rather than `verified` when detection confidence is low;
- thumbnails alone cannot verify factual image claims.

## Proof 3: WAV Audio or Music

Input claim:

```json
{
  "claim_ref": "claim://runs/run_001/reason/claim_001",
  "text": "The speaker mentions rollback in the cited audio transcript span.",
  "supporting_evidence_refs": ["src_wav_001#transcript_span_014"]
}
```

Expected verification:

```json
{
  "verification_result_id": "vrr_wav_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "target_type": "draft_claim",
  "status": "verified",
  "checks": [
    {
      "check_id": "transcript_span_resolves",
      "status": "passed"
    },
    {
      "check_id": "transcript_span_supports_claim",
      "status": "passed"
    }
  ],
  "evidence_refs": ["src_wav_001#transcript_span_014"],
  "requires_review": false
}
```

Validation:

- transcript span resolves to the cited source version;
- timestamp range is preserved;
- transcript confidence can downgrade status to `uncertain`;
- missing transcript must produce `unsupported` or `missing_evidence`, not invented support;
- music-only claims require explicit annotations or acoustic evidence.

## Proof 4: MP4 Video

Input claim:

```json
{
  "claim_ref": "claim://runs/run_001/reason/claim_001",
  "text": "The cited video scene shows the retrieval result list during the demo.",
  "supporting_evidence_refs": ["src_mp4_001#scene_006"]
}
```

Expected verification:

```json
{
  "verification_result_id": "vrr_mp4_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "target_type": "draft_claim",
  "status": "verified",
  "checks": [
    {
      "check_id": "video_scene_resolves",
      "status": "passed"
    },
    {
      "check_id": "scene_or_ocr_supports_claim",
      "status": "passed"
    }
  ],
  "evidence_refs": ["src_mp4_001#scene_006"],
  "requires_review": false
}
```

Validation:

- scene segment, frame range, subtitle span, or OCR span resolves;
- storyboard or keyframe refs are inspection aids unless selected as derived evidence;
- audio and visual contradictions become contradiction refs;
- broad claims about the full video are unsupported unless the evidence covers the full scope.

## Proof 5: Long PDF

Input claim:

```json
{
  "claim_ref": "claim://runs/run_001/reason/claim_001",
  "text": "The cited PDF block supports the policy that indexed documents should not store full raw content.",
  "supporting_evidence_refs": ["src_pdf_001#page_012_block_004"]
}
```

Expected verification:

```json
{
  "verification_result_id": "vrr_pdf_claim_001",
  "target_ref": "claim://runs/run_001/reason/claim_001",
  "target_type": "draft_claim",
  "status": "verified",
  "checks": [
    {
      "check_id": "pdf_block_resolves",
      "status": "passed"
    },
    {
      "check_id": "pdf_block_supports_claim",
      "status": "passed"
    }
  ],
  "evidence_refs": ["src_pdf_001#page_012_block_004"],
  "requires_review": false
}
```

Validation:

- PDF page, block, table, figure, or OCR span resolves;
- OCR confidence is preserved;
- summary-only support is insufficient unless the summary is selected as derived evidence;
- claims about the whole PDF require evidence coverage beyond one block.

## Cross-Media Checks

Every verify concept proof passes only if:

- every target ref resolves or is reported missing;
- every cited evidence ref resolves or is reported missing;
- every factual claim receives a `VerificationResult`;
- assumptions remain assumptions;
- support status is explicit;
- stale and lifecycle-restricted evidence is marked;
- contradictions are surfaced;
- low-confidence media-derived evidence can produce `uncertain` or `needs_review`;
- previews are not treated as original source evidence;
- verification output remains audit output, not durable memory or curation.

## Terminology Check

Use:

- `VerificationTarget` for the artifact or claim being checked;
- `VerificationResult` for the per-target audit result;
- `VerificationReport` for the grouped verify output;
- `SupportCheck` for a specific check that evaluates evidence support;
- `EvidenceResolutionCheck` for a check that ensures cited evidence refs resolve;
- `VerificationStatus` for `verified`, `rejected`, `unsupported`, `uncertain`, `stale`, or `needs_review`.

Avoid:

- calling verified output durable memory;
- treating assumptions as verified claims;
- treating preview refs as source truth;
- allowing verification to rewrite draft answers;
- allowing verification to accept graph edges or curation decisions.
