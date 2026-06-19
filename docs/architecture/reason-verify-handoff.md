# Reason to Verify Handoff

This document defines the concrete handoff contract between the Reasoning Agent and the Verifier Agent.

## Core Rule

The Verifier Agent should not guess which claims, assumptions, or evidence refs belong to a draft answer.

Reason must hand off the draft answer or proposed action, claim refs, assumption refs, evidence bundle ref, and cited evidence refs explicitly.

```text
Reasoning Agent
  -> ReasonToVerifyHandoff
  -> Verifier Agent
```

## Handoff Artifact

Recommended artifact name:

```text
ReasonToVerifyHandoff
```

Recommended shape:

```json
{
  "handoff_id": "h_reason_verify_001",
  "handoff_type": "reason_to_verify",
  "schema_version": "0.1.0",
  "run_id": "run_001",
  "from_stage": "reason",
  "from_agent": "reasoning_agent",
  "to_stage": "verify",
  "to_agent": "verifier_agent",
  "purpose": "stage_transition",
  "artifact_refs": [
    "artifact://runs/run_001/reason/draft-answer.json"
  ],
  "context_refs": [
    "context://runs/run_001/tasks/task_reason_001"
  ],
  "draft_answer_ref": "artifact://runs/run_001/reason/draft-answer.json",
  "proposed_action_ref": null,
  "evidence_bundle_ref": "artifact://runs/run_001/retrieve/evidence-bundle.json",
  "claim_refs": [
    "claim://runs/run_001/reason/claim_001"
  ],
  "assumption_refs": [],
  "cited_evidence_refs": [
    "src_md_001#section_001"
  ],
  "missing_evidence": [],
  "conflict_refs": [],
  "quality_report_refs": [
    "artifact://runs/run_001/reason/quality-report.json"
  ],
  "validation_status": "passed",
  "trace_refs": [
    "trace_reason_001"
  ],
  "created_at": "2026-06-19T00:00:00Z"
}
```

The handoff artifact should contain refs and reasoning status, not a verification result.

## Required Fields

The handoff must include:

- `handoff_id`;
- `handoff_type`;
- `schema_version`;
- `run_id`;
- `from_stage`;
- `from_agent`;
- `to_stage`;
- `to_agent`;
- `purpose`;
- `artifact_refs`;
- `context_refs`;
- `evidence_bundle_ref`;
- `claim_refs`;
- `assumption_refs`;
- `cited_evidence_refs`;
- `missing_evidence`;
- `conflict_refs`;
- `quality_report_refs`;
- `validation_status`;
- `trace_refs`.

At least one of these must be present:

- `draft_answer_ref`;
- `proposed_action_ref`.

Optional but recommended:

- `answer_shape`;
- `freshness_scope`;
- `retrieval_plan_ref`;
- `unsupported_claim_refs`;
- `unresolved_question_refs`.

## Producer Responsibility

The Reasoning Agent must:

- validate the draft answer or proposed action schema;
- include the evidence bundle ref;
- include all claim refs;
- include assumption refs;
- include cited evidence refs;
- include missing evidence notes;
- include conflict refs;
- include quality report refs;
- mark validation status;
- emit trace refs.

The Reasoning Agent must not emit a verification report.

## Consumer Responsibility

The Verifier Agent must:

- validate handoff schema;
- load the draft answer or proposed action;
- load the evidence bundle by ref;
- check that cited evidence refs resolve;
- check whether claims are supported by cited evidence;
- preserve assumptions and unknowns;
- surface stale, missing, or contradictory evidence.

The Verifier Agent should fail explicitly with `invalid_handoff`, `missing_draft`, `missing_evidence_bundle`, `unresolved_claim_ref`, or `unresolved_evidence_ref`.

## Validation Gate

Verify can start only when:

- `validation_status` is `passed` or `passed_with_warnings`;
- draft answer or proposed action ref resolves;
- evidence bundle ref resolves;
- claim refs resolve;
- cited evidence refs resolve or are listed as missing;
- reasoning quality report resolves.

If `validation_status` is `failed`, Verify must not run except in an explicit debug mode.

## Minimal V1 Rule

For v1:

- handoff is a JSON artifact in the run workspace;
- draft answer must include claim refs and cited evidence refs;
- verify must not infer support from uncited evidence;
- verify must treat assumptions as assumptions, not supported facts.

## Design Rule

Reason owns synthesis.

Verify owns audit.

The handoff keeps draft output inspectable without letting reasoning certify itself.
