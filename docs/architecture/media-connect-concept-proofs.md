# Media Connect Concept Proofs

This document proves how the `connect` stage can work across different media types.

Ingest makes media addressable.

Understand makes media meaningful as source-grounded candidates.

Connect makes those candidates relational as source-grounded relationship proposals.

## Core Rule

Media-specific evidence locators must survive connection.

```text
KnowledgeCandidate + graph/search context
  -> Connection Agent
  -> RelationshipProposal
  -> endpoint refs + evidence refs + review refs
```

The output remains proposal-level.

Connect does not create durable graph records.

## Shared Relation Types

All media types should map to the same v1 relation proposal types when possible:

| Relation type | Meaning |
| --- | --- |
| `duplicates` | Candidate appears equivalent or near-equivalent to another candidate or record |
| `supports` | Candidate appears to support another candidate or record |
| `contradicts` | Candidate appears to conflict with another candidate or record |
| `depends_on` | Candidate appears to require another candidate, record, or concept |
| `supersedes` | Candidate appears to replace an older candidate or record |
| `mentions` | Candidate refers to a concept, entity, source, or record |
| `applies_to` | Candidate appears scoped to a concept, entity, project, or context |

Media-specific details should live in endpoint refs, evidence locators, ambiguity notes, and review requests.

## Media Connection Matrix

| Media | Strong connect targets | Risky connect targets |
| --- | --- | --- |
| Markdown/text | wiki links, matching headings, explicit mentions, duplicate claims, decision supersession hints | implied contradiction, unstated dependency |
| Image | OCR-backed mentions, duplicate diagram labels, UI state mentions, diagram-to-concept links | visual-only contradiction, inferred intent, object identity |
| WAV/audio | transcript-backed decisions, spoken mentions, duplicate meeting claims, temporal follow-up decisions | speaker identity, sarcasm, music meaning |
| MP4/video | subtitle-backed procedures, screen text mentions, scene-to-concept links, demo step dependencies | gesture-only intent, frame-only contradiction, edited context |
| PDF | citation links, table facts, section references, policy constraints, versioned document supersession | table header ambiguity, footnote scope, figure-only inference |

## Proof 1: Markdown/Text

### Input Candidates

From understand:

```json
[
  {
    "candidate_id": "kc_claim_md_001",
    "candidate_kind": "claim_candidate",
    "short_label": "OpenSearch stores retrieval projections",
    "evidence_refs": ["src_md_001#section_001"],
    "source_version_id": "srcv_md_sha256_ab12cd34ef90",
    "confidence": 0.9
  },
  {
    "candidate_id": "kc_constraint_md_001",
    "candidate_kind": "constraint_candidate",
    "short_label": "Index must not store full source text",
    "evidence_refs": ["src_md_001#section_001"],
    "source_version_id": "srcv_md_sha256_ab12cd34ef90",
    "confidence": 0.88
  }
]
```

Existing records:

```json
[
  {
    "record_ref": "record://claims/claim_index_projection_001",
    "record_kind": "claim",
    "short_label": "OpenSearch is a retrieval projection, not source truth"
  },
  {
    "record_ref": "record://concepts/opensearch",
    "record_kind": "concept",
    "name": "OpenSearch"
  }
]
```

### Expected Connection Proposals

```json
[
  {
    "proposal_id": "rp_md_duplicates_001",
    "relation_type": "duplicates",
    "status": "candidate",
    "from_ref": "kc_claim_md_001",
    "to_ref": "record://claims/claim_index_projection_001",
    "evidence_refs": ["src_md_001#section_001"],
    "confidence": 0.82,
    "requires_review": false
  },
  {
    "proposal_id": "rp_md_mentions_001",
    "relation_type": "mentions",
    "status": "candidate",
    "from_ref": "kc_constraint_md_001",
    "to_ref": "record://concepts/opensearch",
    "evidence_refs": ["src_md_001#section_001"],
    "confidence": 0.78,
    "requires_review": false
  }
]
```

### Validation

Markdown/text connect is valid when:

- explicit text or wiki signals support the endpoint;
- duplicate matching is based on normalized labels or known aliases;
- relation proposals remain candidates;
- exact section refs are preserved.

## Proof 2: Image

### Input Candidates

From OCR-backed image understanding:

```json
[
  {
    "candidate_id": "kc_procedure_img_001",
    "candidate_kind": "procedure_candidate",
    "short_label": "Pipeline from ingest to connect",
    "evidence_refs": ["src_img_001#ocr_span_001", "src_img_001#region_001"],
    "source_version_id": "srcv_img_sha256_ab12cd34ef90",
    "confidence": 0.76,
    "requires_review": true
  }
]
```

Existing records:

```json
[
  {
    "record_ref": "record://procedures/core-loop",
    "record_kind": "procedure",
    "short_label": "Knowledge loop from ingest to connect"
  },
  {
    "record_ref": "record://concepts/ingest-stage",
    "record_kind": "concept",
    "name": "ingest"
  }
]
```

### Expected Connection Proposals

```json
[
  {
    "proposal_id": "rp_img_supports_001",
    "relation_type": "supports",
    "status": "candidate",
    "from_ref": "kc_procedure_img_001",
    "to_ref": "record://procedures/core-loop",
    "evidence_refs": ["src_img_001#ocr_span_001", "src_img_001#region_001"],
    "confidence": 0.68,
    "requires_review": true
  },
  {
    "proposal_id": "rp_img_mentions_001",
    "relation_type": "mentions",
    "status": "candidate",
    "from_ref": "kc_procedure_img_001",
    "to_ref": "record://concepts/ingest-stage",
    "evidence_refs": ["src_img_001#ocr_span_001"],
    "confidence": 0.74,
    "requires_review": false
  }
]
```

### Validation

Image connect is valid when:

- OCR-backed text is distinguished from visual-only inference;
- region refs remain attached;
- diagram-layout relations require review when arrows or sequence are inferred;
- the original image region can still be inspected.

## Proof 3: WAV/Audio

### Input Candidates

From transcript-backed audio understanding:

```json
[
  {
    "candidate_id": "kc_decision_audio_001",
    "candidate_kind": "decision_candidate",
    "short_label": "OpenSearch stores retrieval projections only",
    "evidence_refs": ["src_wav_001#transcript_span_001"],
    "source_version_id": "srcv_wav_sha256_ab12cd34ef90",
    "confidence": 0.84
  }
]
```

Existing records:

```json
[
  {
    "record_ref": "record://decisions/index-content-policy",
    "record_kind": "decision",
    "short_label": "OpenSearch should store content-minimal projections"
  },
  {
    "record_ref": "record://concepts/retrieval-projection",
    "record_kind": "concept",
    "name": "retrieval projection"
  }
]
```

### Expected Connection Proposals

```json
[
  {
    "proposal_id": "rp_audio_supports_001",
    "relation_type": "supports",
    "status": "candidate",
    "from_ref": "kc_decision_audio_001",
    "to_ref": "record://decisions/index-content-policy",
    "evidence_refs": ["src_wav_001#transcript_span_001"],
    "confidence": 0.8,
    "requires_review": false
  },
  {
    "proposal_id": "rp_audio_mentions_001",
    "relation_type": "mentions",
    "status": "candidate",
    "from_ref": "kc_decision_audio_001",
    "to_ref": "record://concepts/retrieval-projection",
    "evidence_refs": ["src_wav_001#transcript_span_001"],
    "confidence": 0.77,
    "requires_review": false
  }
]
```

### Validation

Audio connect is valid when:

- transcript span timestamps remain available;
- speaker identity is not required unless verified;
- low transcription confidence lowers proposal confidence;
- sarcasm, disagreement, or overlapping speech creates review requests.

## Proof 4: MP4/Video

### Input Candidates

From subtitle-backed video understanding:

```json
[
  {
    "candidate_id": "kc_procedure_video_001",
    "candidate_kind": "procedure_candidate",
    "short_label": "Ingest, understand, then connect",
    "evidence_refs": ["src_mp4_001#subtitle_span_001", "src_mp4_001#scene_001"],
    "source_version_id": "srcv_mp4_sha256_ab12cd34ef90",
    "confidence": 0.86
  }
]
```

Existing records:

```json
[
  {
    "record_ref": "record://procedures/knowledge-loop-v1",
    "record_kind": "procedure",
    "short_label": "ingest -> understand -> connect"
  },
  {
    "record_ref": "record://concepts/understanding-agent",
    "record_kind": "concept",
    "name": "Understanding Agent"
  }
]
```

### Expected Connection Proposals

```json
[
  {
    "proposal_id": "rp_video_duplicates_001",
    "relation_type": "duplicates",
    "status": "candidate",
    "from_ref": "kc_procedure_video_001",
    "to_ref": "record://procedures/knowledge-loop-v1",
    "evidence_refs": ["src_mp4_001#subtitle_span_001", "src_mp4_001#scene_001"],
    "confidence": 0.79,
    "requires_review": false
  },
  {
    "proposal_id": "rp_video_depends_001",
    "relation_type": "depends_on",
    "status": "candidate",
    "from_ref": "kc_procedure_video_001",
    "to_ref": "record://concepts/understanding-agent",
    "evidence_refs": ["src_mp4_001#subtitle_span_001"],
    "confidence": 0.64,
    "requires_review": true
  }
]
```

### Validation

Video connect is valid when:

- subtitle or transcript refs carry the main relationship evidence;
- scene/frame refs are preserved for inspection;
- visual-only relationship inference requires review;
- edited or clipped context lowers confidence.

## Proof 5: PDF

### Input Candidates

From PDF text-block understanding:

```json
[
  {
    "candidate_id": "kc_constraint_pdf_001",
    "candidate_kind": "constraint_candidate",
    "short_label": "Source versions remain addressable while evidence refs depend on them",
    "evidence_refs": ["src_pdf_001#page_003_block_012"],
    "source_version_id": "srcv_pdf_sha256_ab12cd34ef90",
    "confidence": 0.91
  }
]
```

Existing records:

```json
[
  {
    "record_ref": "record://policies/source-retention",
    "record_kind": "procedure",
    "short_label": "Retain source versions referenced by active evidence"
  },
  {
    "record_ref": "record://concepts/evidence-reference",
    "record_kind": "concept",
    "name": "Evidence reference"
  }
]
```

### Expected Connection Proposals

```json
[
  {
    "proposal_id": "rp_pdf_supports_001",
    "relation_type": "supports",
    "status": "candidate",
    "from_ref": "kc_constraint_pdf_001",
    "to_ref": "record://policies/source-retention",
    "evidence_refs": ["src_pdf_001#page_003_block_012"],
    "confidence": 0.83,
    "requires_review": false
  },
  {
    "proposal_id": "rp_pdf_mentions_001",
    "relation_type": "mentions",
    "status": "candidate",
    "from_ref": "kc_constraint_pdf_001",
    "to_ref": "record://concepts/evidence-reference",
    "evidence_refs": ["src_pdf_001#page_003_block_012"],
    "confidence": 0.75,
    "requires_review": false
  }
]
```

### Validation

PDF connect is valid when:

- page/block refs remain available;
- table-derived proposals preserve row, column, and header refs;
- citation and footnote relations preserve scope;
- OCR or layout ambiguity creates review requests.

## Cross-Media Rules

1. Preserve original evidence locators from understand.
2. Treat all relationships as proposals.
3. Validate relation types against the active taxonomy version.
4. Require resolvable `from_ref` and `to_ref`.
5. Require evidence refs or explicit indirect-evidence rationale.
6. Use media-specific quality signals to adjust confidence and review status.
7. Do not use preview artifacts as the only grounding for a relationship.
8. Do not promote proposals into graph records inside connect.

## V1 Priority

V1 implementation order:

1. Markdown/text duplicate and mention proposals.
2. Markdown/text support proposals from explicit wording.
3. PDF text-block support and mention proposals.
4. Audio/video transcript-backed relation proposals.
5. Image OCR-backed relation proposals.
6. Visual-only image/video relation proposals after review workflows exist.

## Design Rule

Connect should not erase media differences.

It should produce one shared relationship proposal contract while preserving the locator needed to inspect each medium.
