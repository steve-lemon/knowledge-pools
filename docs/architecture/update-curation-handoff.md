# Update To Curation Handoff

This document defines the handoff from `update` to `curation`.

The handoff carries update candidates that may become durable knowledge.

It does not itself accept, reject, or write memory.

## Boundary

`update` owns:

- selecting reusable learning signals;
- emitting `UpdateCandidate` artifacts;
- marking review requirements;
- producing an update quality report.

`curation` owns:

- reviewing update candidates;
- deciding accept, edit, defer, reject, retract, supersede, quarantine, or tombstone;
- creating durable records or lifecycle updates when approved;
- emitting curation decisions and handoff to evaluation.

## Handoff Artifact

Canonical handoff type:

```text
UpdateToCurationHandoff
```

Required payload:

```json
{
  "update_candidate_refs": ["upd_md_claim_001"],
  "source_refs": ["src_md_001"],
  "evidence_refs": ["src_md_001#section_001"],
  "review_refs": [],
  "quality_report_ref": "artifact://runs/run_001/update/quality-report.json",
  "requires_human_review": false
}
```

## Required Semantics

The handoff must distinguish:

- `update_candidate_refs`: candidates proposed by update;
- `source_refs`: source records attached to candidates;
- `evidence_refs`: evidence refs supporting or contextualizing candidates;
- `review_refs`: human or policy review refs when present;
- `quality_report_ref`: update-stage selection and validation report;
- `requires_human_review`: whether curation may proceed automatically or must wait for review.

## Validation Rules

The curation stage must validate:

- the handoff schema;
- every update candidate ref resolves;
- the quality report ref resolves;
- every accepted candidate has source, evidence, run, review, or verification provenance;
- review-required candidates are not auto-accepted without review resolution;
- candidate types map to allowed durable record kinds or lifecycle decisions;
- rejected, deferred, and needs-more-evidence decisions remain auditable.

## Minimal V1 Policy

For Markdown-first v1:

- curation may accept verified Markdown/text candidates;
- curation may reject or defer unsupported or weak candidates;
- curation may create open question records from missing evidence;
- curation may create simple claim, decision, procedure, or question records;
- curation should require human review for corrections, contradictions, stale warnings, and lifecycle changes.

## Output Expectation

A successful curation run should produce:

- one or more `CurationDecision` artifacts;
- zero or more durable records;
- zero or more durable status updates;
- optional review request or review resolution refs;
- a `CurationToEvaluateHandoff`;
- trace events for every decision and durable mutation.

## Anti-Pattern

Do not use this handoff to pass full raw source content or full conversations.

Pass refs.

Curation can resolve bounded candidate and provenance artifacts through approved tools.
