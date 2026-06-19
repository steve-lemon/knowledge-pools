# Media Reason Concept Proofs

This document validates the `reason` stage across supported media types.

It focuses only on reasoning.

It does not redefine ingest, understand, connect, plan, retrieve, verify, update, or curation.

## Reason Stage Rule

`reason` consumes `RetrieveToReasonHandoff` and an `EvidenceBundle`.

It produces a `DraftAnswer`, `ProposedAction`, or explicit `insufficient_evidence` result.

```text
RetrieveToReasonHandoff
  -> Reasoning Agent
  -> DraftAnswer or ProposedAction
  -> ReasonToVerifyHandoff
```

For every media type, reason must preserve:

- evidence bundle ref;
- cited evidence refs;
- claim refs;
- assumption refs;
- unresolved question refs;
- missing evidence notes;
- conflict notes;
- freshness and lifecycle warnings.

## Common Draft Claim Shape

Recommended claim shape inside a `DraftAnswer`:

```json
{
  "claim_ref": "claim://runs/run_001/reason/claim_001",
  "text": "The source distinguishes taxonomy from versioning.",
  "supporting_evidence_refs": [
    "src_md_001#section_001"
  ],
  "support_status": "supported",
  "media_basis": "markdown_section"
}
```

Reason may summarize, compare, or recommend.

It must not turn uncited interpretation into a factual claim.

## Proof 1: Markdown

Evidence bundle contains:

```json
{
  "evidence_refs": ["src_md_001#section_001"],
  "items": [
    {
      "evidence_ref": "src_md_001#section_001",
      "evidence_type": "markdown_section",
      "content_ref": "artifact://runs/run_001/retrieve/evidence/src_md_001_section_001.txt"
    }
  ]
}
```

Expected reason output:

```json
{
  "draft_answer_id": "da_md_001",
  "artifact_type": "draft_answer",
  "evidence_bundle_ref": "artifact://runs/run_001/retrieve/evidence-bundle.json",
  "claims": [
    {
      "claim_ref": "claim://runs/run_001/reason/claim_001",
      "text": "Taxonomy describes meaning and classification, while versioning describes change over time.",
      "supporting_evidence_refs": ["src_md_001#section_001"],
      "support_status": "supported",
      "media_basis": "markdown_section"
    }
  ],
  "assumptions": [],
  "unresolved_questions": [],
  "conflict_notes": []
}
```

Validation:

- cited claim uses only refs present in the evidence bundle;
- wiki links may inform context but are not treated as support unless cited;
- unsupported interpretation is labeled as assumption.

## Proof 2: Image, JPG or PNG

Evidence bundle contains an image region:

```json
{
  "evidence_refs": ["src_img_001#region_003"],
  "items": [
    {
      "evidence_ref": "src_img_001#region_003",
      "evidence_type": "image_region",
      "content_ref": "artifact://runs/run_001/retrieve/evidence/src_img_001_region_003.json",
      "preview_refs": ["standard_1600_v001"]
    }
  ]
}
```

Expected reason output:

```json
{
  "draft_answer_id": "da_img_001",
  "artifact_type": "draft_answer",
  "claims": [
    {
      "claim_ref": "claim://runs/run_001/reason/claim_001",
      "text": "The selected image region appears to contain an OpenSearch-labeled box.",
      "supporting_evidence_refs": ["src_img_001#region_003"],
      "support_status": "supported",
      "media_basis": "image_region"
    }
  ],
  "assumptions": [
    {
      "assumption_ref": "assumption://runs/run_001/reason/assumption_001",
      "text": "The label is interpreted from OCR or visual detection and should be verified against the image region.",
      "related_evidence_refs": ["src_img_001#region_003"]
    }
  ],
  "unresolved_questions": [],
  "conflict_notes": []
}
```

Validation:

- visual interpretation should use cautious language when OCR or detection confidence is uncertain;
- thumbnail refs are not enough for final claim support;
- coordinate basis and rendition basis stay with the cited evidence item.

## Proof 3: WAV Audio or Music

Evidence bundle contains a transcript span:

```json
{
  "evidence_refs": ["src_wav_001#transcript_span_014"],
  "items": [
    {
      "evidence_ref": "src_wav_001#transcript_span_014",
      "evidence_type": "audio_transcript_span",
      "locator": {
        "start_ms": 42100,
        "end_ms": 48750
      }
    }
  ]
}
```

Expected reason output:

```json
{
  "draft_answer_id": "da_wav_001",
  "artifact_type": "draft_answer",
  "claims": [
    {
      "claim_ref": "claim://runs/run_001/reason/claim_001",
      "text": "The speaker mentions rollback in the cited audio transcript span.",
      "supporting_evidence_refs": ["src_wav_001#transcript_span_014"],
      "support_status": "supported",
      "media_basis": "audio_transcript_span"
    }
  ],
  "assumptions": [],
  "unresolved_questions": [],
  "confidence": {
    "level": "medium",
    "rationale_ref": "artifact://runs/run_001/reason/audio-confidence-note.md"
  }
}
```

Validation:

- transcript confidence must affect confidence notes;
- if the audio has no transcript, reason should emit `insufficient_evidence`;
- music-only claims should cite time ranges, acoustic tags, or human annotations, not invented lyrics or meaning.

## Proof 4: MP4 Video

Evidence bundle contains a video scene segment:

```json
{
  "evidence_refs": ["src_mp4_001#scene_006"],
  "items": [
    {
      "evidence_ref": "src_mp4_001#scene_006",
      "evidence_type": "video_scene_segment",
      "locator": {
        "start_ms": 82000,
        "end_ms": 96400,
        "frame_start": 1968,
        "frame_end": 2314
      },
      "preview_refs": ["storyboard_v001", "keyframe_006_v001"]
    }
  ]
}
```

Expected reason output:

```json
{
  "draft_answer_id": "da_mp4_001",
  "artifact_type": "draft_answer",
  "claims": [
    {
      "claim_ref": "claim://runs/run_001/reason/claim_001",
      "text": "The cited video scene shows the retrieval result list during the demo.",
      "supporting_evidence_refs": ["src_mp4_001#scene_006"],
      "support_status": "supported",
      "media_basis": "video_scene_segment"
    }
  ],
  "assumptions": [],
  "unresolved_questions": [],
  "conflict_notes": []
}
```

Validation:

- reason should cite the scene, subtitle span, frame range, or OCR span that supports the claim;
- storyboard refs are inspection aids unless selected as derived evidence with provenance;
- if audio transcript and visual OCR disagree, reason should create a conflict note instead of choosing silently.

## Proof 5: Long PDF

Evidence bundle contains a PDF text block:

```json
{
  "evidence_refs": ["src_pdf_001#page_012_block_004"],
  "items": [
    {
      "evidence_ref": "src_pdf_001#page_012_block_004",
      "evidence_type": "pdf_text_block",
      "locator": {
        "page": 12,
        "block": 4
      }
    }
  ]
}
```

Expected reason output:

```json
{
  "draft_answer_id": "da_pdf_001",
  "artifact_type": "draft_answer",
  "claims": [
    {
      "claim_ref": "claim://runs/run_001/reason/claim_001",
      "text": "The cited PDF block supports the policy that indexed documents should not store full raw content.",
      "supporting_evidence_refs": ["src_pdf_001#page_012_block_004"],
      "support_status": "supported",
      "media_basis": "pdf_text_block"
    }
  ],
  "assumptions": [],
  "unresolved_questions": []
}
```

Validation:

- reason should cite page, block, table, figure, or span refs;
- PDF summaries are not enough for factual support unless selected as derived evidence;
- OCR-derived text requires confidence and generator metadata to flow into confidence notes.

## Cross-Media Checks

Every reason concept proof passes only if:

- every factual claim cites evidence from the bundle;
- assumptions are separated from supported claims;
- unknowns and missing evidence are explicit;
- conflict refs are surfaced or explicitly marked irrelevant;
- freshness and lifecycle warnings are preserved;
- media-specific locators remain visible through cited evidence refs;
- preview artifacts are not treated as original source evidence;
- `ReasonToVerifyHandoff` carries draft refs, claim refs, assumption refs, and cited evidence refs;
- no new broad retrieval, verification report, durable memory write, or curation decision is produced.

## Terminology Check

Use:

- `DraftAnswer` for the reasoning-stage draft response;
- `ProposedAction` for a draft action or recommendation;
- `DraftClaim` for one claim inside a draft answer;
- `ClaimRef` for a reference to a draft claim;
- `AssumptionRef` for a reference to an assumption;
- `CitedEvidenceRef` for an evidence ref cited by a claim or proposed action;
- `ReasonToVerifyHandoff` for the transition to verification.

Avoid:

- calling reason output verified;
- calling assumptions supported facts;
- calling preview-only refs source truth;
- treating model rationale as evidence;
- creating durable memory records inside reason.
