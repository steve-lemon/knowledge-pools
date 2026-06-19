# Curation To Evaluate Handoff

This document defines the handoff from `curation` to `evaluate`.

The handoff carries curation outcomes and lifecycle refs for evaluation.

It does not carry permission to change durable memory.

## Boundary

`curation` owns:

- curation decisions;
- durable records;
- lifecycle updates;
- curation quality report.

`evaluate` owns:

- reading traces and curation outcomes;
- recording quality signals;
- producing evaluation reports;
- recommending future improvements.

## Handoff Artifact

Canonical handoff type:

```text
CurationToEvaluateHandoff
```

Required payload:

```json
{
  "curation_decision_refs": ["cur_md_claim_001"],
  "accepted_record_refs": ["claim_md_001"],
  "rejected_candidate_refs": [],
  "deferred_candidate_refs": [],
  "lifecycle_event_refs": [],
  "quality_report_ref": "artifact://runs/run_001/curation/quality-report.json"
}
```

## Required Semantics

The handoff must distinguish:

- `curation_decision_refs`: decisions made during curation;
- `accepted_record_refs`: durable records created or accepted;
- `rejected_candidate_refs`: candidates rejected by curation;
- `deferred_candidate_refs`: candidates not ready for durable memory;
- `lifecycle_event_refs`: supersession, retraction, quarantine, tombstone, or rollback-related refs;
- `quality_report_ref`: curation-stage quality report.

## Validation Rules

The evaluation stage must validate:

- the handoff schema;
- every curation decision ref resolves;
- accepted, rejected, deferred, and lifecycle refs resolve or are marked missing;
- quality report ref resolves;
- trace refs are available for the evaluated run;
- evaluation signals do not mutate durable records.

## Minimal V1 Policy

For Markdown-first v1:

- evaluate curation outcomes from Markdown/text candidates;
- record accepted, rejected, deferred, and needs-more-evidence counts;
- flag missing provenance or missing trace refs;
- propose regression fixtures for notable failures;
- do not emit update candidates or write durable memory directly.

## Output Expectation

A successful evaluation run should produce:

- one `EvaluationReport`;
- zero or more `EvaluationSignal` records;
- zero or more regression fixture recommendations;
- trace events for evaluation work.

## Anti-Pattern

Do not use evaluation to silently correct durable memory.

Evaluation reports problems.

Corrections must go through feedback, update, and curation.
