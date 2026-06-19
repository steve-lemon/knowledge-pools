# Retrieve to Reason Handoff

This document defines the concrete handoff contract between the Retrieval Agent and the Reasoning Agent.

## Core Rule

The Reasoning Agent should not guess which evidence retrieval found.

Retrieve must hand off evidence bundle refs, evidence refs, missing evidence notes, and conflict refs explicitly.

```text
Retrieval Agent
  -> RetrieveToReasonHandoff
  -> Reasoning Agent
```

## Handoff Artifact

Recommended artifact name:

```text
RetrieveToReasonHandoff
```

Recommended shape:

```json
{
  "handoff_id": "h_retrieve_reason_001",
  "handoff_type": "retrieve_to_reason",
  "schema_version": "0.1.0",
  "run_id": "run_001",
  "from_stage": "retrieve",
  "from_agent": "retrieval_agent",
  "to_stage": "reason",
  "to_agent": "reasoning_agent",
  "purpose": "stage_transition",
  "artifact_refs": [
    "artifact://runs/run_001/retrieve/evidence-bundle.json"
  ],
  "context_refs": [
    "context://runs/run_001/tasks/task_retrieve_001"
  ],
  "evidence_refs": [
    "src_md_001#section_001"
  ],
  "evidence_bundle_ref": "artifact://runs/run_001/retrieve/evidence-bundle.json",
  "missing_evidence": [],
  "conflict_refs": [],
  "quality_report_refs": [
    "artifact://runs/run_001/retrieve/quality-report.json"
  ],
  "validation_status": "passed",
  "trace_refs": [
    "trace_retrieve_001"
  ],
  "created_at": "2026-06-19T00:00:00Z"
}
```

The handoff artifact should contain refs and retrieval status, not a final answer.

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
- `evidence_refs`;
- `evidence_bundle_ref`;
- `missing_evidence`;
- `conflict_refs`;
- `quality_report_refs`;
- `validation_status`;
- `trace_refs`.

Optional but recommended:

- `freshness_scope`;
- `retrieval_plan_ref`;
- `answer_shape`;
- `required_evidence_types`;
- `excluded_evidence_refs`;
- `retrieval_budget_status`.

## Producer Responsibility

The Retrieval Agent must:

- validate retrieval output schemas;
- include the evidence bundle ref;
- include all selected evidence refs;
- include missing evidence notes;
- include conflict refs when requested by the plan;
- include quality report refs;
- mark validation status;
- emit trace refs.

The Retrieval Agent must not synthesize final answers.

## Consumer Responsibility

The Reasoning Agent must:

- validate handoff schema;
- reject handoff if the evidence bundle ref is missing;
- load the evidence bundle by ref;
- preserve cited evidence refs in draft answers or proposed actions;
- surface missing evidence and conflicts;
- avoid treating missing evidence as known fact.

The Reasoning Agent should fail explicitly with `invalid_handoff`, `missing_evidence_bundle`, `unresolved_evidence_ref`, or `insufficient_evidence` rather than inventing evidence.

## Validation Gate

Reason can start only when:

- `validation_status` is `passed` or `passed_with_warnings`;
- evidence bundle ref resolves;
- evidence bundle schema validates;
- required evidence refs resolve or are listed as missing;
- conflict refs are included when conflict search was required;
- retrieval quality report resolves.

If `validation_status` is `failed`, Reason must not run except in an explicit debug mode.

## Minimal V1 Rule

For v1:

- handoff is a JSON artifact in the run workspace;
- evidence bundle must include at least one evidence ref or explicit missing evidence notes;
- reason must not reinterpret retrieval plan intent from raw user text;
- reason must cite evidence refs from the bundle.

## Design Rule

Retrieve owns evidence gathering.

Reason owns synthesis.

The handoff keeps evidence usable without turning retrieval into answer generation.
