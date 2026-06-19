# Connect to Verify Handoff

This document defines the concrete handoff contract between the Connection Agent and the Verifier Agent.

## Core Rule

The Verifier Agent should not guess which relationship proposals need audit.

Connect must hand off proposal refs, quality status, taxonomy refs, ambiguity refs, and review refs explicitly.

```text
Connection Agent
  -> ConnectToVerifyHandoff
  -> Verifier Agent
```

## Handoff Artifact

Recommended artifact name:

```text
ConnectToVerifyHandoff
```

Recommended shape:

```json
{
  "handoff_id": "h_connect_verify_001",
  "handoff_type": "connect_to_verify",
  "schema_version": "0.1.0",
  "run_id": "run_001",
  "from_stage": "connect",
  "from_agent": "connection_agent",
  "to_stage": "verify",
  "to_agent": "verifier_agent",
  "purpose": "stage_transition",
  "artifact_refs": [
    "artifact://runs/run_001/connect/connection-artifact.json"
  ],
  "context_refs": [],
  "evidence_refs": [
    "src_path_a91c72#section_001"
  ],
  "connection_artifact_ref": "artifact://runs/run_001/connect/connection-artifact.json",
  "relationship_proposal_refs": [
    "artifact://runs/run_001/connect/relations/rp_supports_001.json"
  ],
  "conflict_candidate_refs": [],
  "unresolved_candidate_refs": [],
  "ambiguity_refs": [],
  "review_refs": [],
  "quality_report_ref": "artifact://runs/run_001/connect/quality-report.json",
  "quality_report_refs": [
    "artifact://runs/run_001/connect/quality-report.json"
  ],
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0",
  "validation_status": "passed",
  "trace_refs": [
    "trace_connect_001"
  ],
  "created_at": "2026-06-19T00:00:00Z"
}
```

The handoff artifact should contain refs and quality metadata, not long proposal rationale.

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
- `connection_artifact_ref`;
- `relationship_proposal_refs`;
- `conflict_candidate_refs`;
- `unresolved_candidate_refs`;
- `ambiguity_refs`;
- `review_refs`;
- `quality_report_ref`;
- `quality_report_refs`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `validation_status`;
- `trace_refs`.

Optional but recommended:

- `blocked_proposal_refs`;
- `review_required_proposal_refs`;
- `verification_policy_ref`;
- `evidence_bundle_refs`.

## Producer Responsibility

The Connection Agent must:

- validate output schemas before handoff;
- include only proposal refs that resolve;
- include conflict and unresolved refs;
- include ambiguity and review refs;
- include quality report ref;
- preserve taxonomy bundle id and version;
- mark validation status;
- emit trace refs.

The Connection Agent should not hand off if the quality report fails the minimum bar.

## Consumer Responsibility

The Verifier Agent must:

- validate handoff schema;
- reject handoff if required refs are missing;
- load connection artifact and proposal refs;
- resolve endpoint refs and evidence refs;
- check proposal claims against evidence;
- preserve source, candidate, proposal, taxonomy, ambiguity, and review refs in the verification report;
- avoid accepting proposals as durable graph records.

The Verifier Agent should fail explicitly with `invalid_handoff`, `unresolved_proposal_ref`, `unresolved_endpoint_ref`, or `missing_evidence_ref` rather than silently skipping required proposals.

## Validation Gate

Verify can start only when:

- `validation_status` is `passed` or `passed_with_warnings`;
- connection artifact ref resolves;
- quality report ref resolves;
- all required relationship proposal refs resolve;
- proposal endpoint refs resolve or are marked unresolved;
- evidence refs resolve;
- taxonomy bundle ref resolves;
- the handoff schema validates.

If `validation_status` is `failed`, Verify must not run except in an explicit debug mode.

## Minimal V1 Rule

For v1:

- handoff is a JSON artifact in the run workspace;
- relation proposals come from deterministic connect first;
- unresolved proposal refs block normal verification;
- every verification result keeps proposal, endpoint, evidence, taxonomy, and trace refs.

## Design Rule

Connect owns relationship proposal.

Verify owns evidence audit.

The handoff keeps proposed graph context inspectable without promoting it to durable truth.
