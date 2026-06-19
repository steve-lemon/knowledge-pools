# Plan to Retrieve Handoff

This document defines the concrete handoff contract between the Retrieval Planner and the Retrieval Agent.

## Core Rule

The Retrieval Agent should not guess the user's intent or evidence requirements.

Plan must hand off retrieval plan refs, required evidence types, freshness scope, and conflict-search requirements explicitly.

```text
Retrieval Planner
  -> PlanToRetrieveHandoff
  -> Retrieval Agent
```

## Handoff Artifact

Recommended artifact name:

```text
PlanToRetrieveHandoff
```

Recommended shape:

```json
{
  "handoff_id": "h_plan_retrieve_001",
  "handoff_type": "plan_to_retrieve",
  "schema_version": "0.1.0",
  "run_id": "run_001",
  "from_stage": "plan",
  "from_agent": "retrieval_planner",
  "to_stage": "retrieve",
  "to_agent": "retrieval_agent",
  "purpose": "stage_transition",
  "artifact_refs": [
    "artifact://runs/run_001/plan/retrieval-plan.json"
  ],
  "context_refs": [
    "context://runs/run_001/tasks/task_plan_001"
  ],
  "evidence_refs": [],
  "retrieval_plan_ref": "artifact://runs/run_001/plan/retrieval-plan.json",
  "required_evidence_types": [
    "architecture_doc",
    "decision_record"
  ],
  "freshness_scope": "stable",
  "conflict_search_required": true,
  "quality_report_refs": [
    "artifact://runs/run_001/plan/quality-report.json"
  ],
  "validation_status": "passed",
  "trace_refs": [
    "trace_plan_001"
  ],
  "created_at": "2026-06-19T00:00:00Z"
}
```

The handoff artifact should contain refs, constraints, and planning metadata, not retrieved evidence content.

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
- `retrieval_plan_ref`;
- `required_evidence_types`;
- `freshness_scope`;
- `conflict_search_required`;
- `quality_report_refs`;
- `validation_status`;
- `trace_refs`.

Optional but recommended:

- `retrieval_budget`;
- `preferred_indexes`;
- `blocked_indexes`;
- `required_source_refs`;
- `candidate_record_refs`;
- `taxonomy_bundle_id`;
- `taxonomy_version`.

## Producer Responsibility

The Retrieval Planner must:

- validate task understanding output;
- write a retrieval plan artifact;
- include required evidence types;
- include explicit freshness scope;
- include conflict-search requirement;
- include retrieval mode constraints;
- mark validation status;
- emit trace refs.

The Retrieval Planner must not fetch full evidence content as part of the handoff.

## Consumer Responsibility

The Retrieval Agent must:

- validate handoff schema;
- reject handoff if the retrieval plan ref is missing;
- load the retrieval plan by ref;
- execute only allowed retrieval steps;
- preserve freshness and conflict-search constraints;
- return evidence refs and missing evidence notes;
- avoid synthesizing answers.

The Retrieval Agent should fail explicitly with `invalid_handoff`, `missing_retrieval_plan`, `unsupported_retrieval_mode`, or `retrieval_permission_denied` rather than silently changing the plan.

## Validation Gate

Retrieve can start only when:

- `validation_status` is `passed` or `passed_with_warnings`;
- retrieval plan ref resolves;
- retrieval plan schema validates;
- required evidence types are present;
- freshness scope is present;
- conflict-search requirement is explicit;
- requested retrieval modes are allowed by tool grants.

If `validation_status` is `failed`, Retrieve must not run except in an explicit debug mode.

## Minimal V1 Rule

For v1:

- handoff is a JSON artifact in the run workspace;
- plan must include at least one retrieval step;
- retrieve must not infer missing intent from raw user text;
- retrieve should return missing evidence notes instead of inventing evidence.

## Design Rule

Plan owns task understanding.

Retrieve owns evidence gathering.

The handoff keeps those responsibilities connected without merging them.
