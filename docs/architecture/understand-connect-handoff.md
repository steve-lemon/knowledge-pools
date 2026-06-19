# Understand to Connect Handoff

This document defines the concrete handoff contract between the Understanding Agent and the Connection Agent.

## Core Rule

The Connection Agent should not guess which candidates are ready to relate.

Understand must hand off candidate refs, quality status, ambiguity refs, and taxonomy refs explicitly.

```text
Understanding Agent
  -> UnderstandToConnectHandoff
  -> Connection Agent
```

## Handoff Artifact

Recommended artifact name:

```text
UnderstandToConnectHandoff
```

Recommended shape:

```json
{
  "handoff_id": "h_understand_connect_001",
  "handoff_type": "understand_to_connect",
  "schema_version": "0.1.0",
  "run_id": "run_001",
  "from_stage": "understand",
  "from_agent": "understanding_agent",
  "to_stage": "connect",
  "to_agent": "connection_agent",
  "purpose": "stage_transition",
  "artifact_refs": [
    "artifact://runs/run_001/understand/understanding-artifact.json"
  ],
  "context_refs": [],
  "evidence_refs": [
    "src_path_a91c72#section_001"
  ],
  "source_id": "src_path_a91c72",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "understanding_artifact_ref": "artifact://runs/run_001/understand/understanding-artifact.json",
  "knowledge_candidate_refs": [
    "artifact://runs/run_001/understand/candidates/kc_claim_001.json"
  ],
  "ambiguity_refs": [],
  "review_refs": [],
  "quality_report_ref": "artifact://runs/run_001/understand/quality-report.json",
  "quality_report_refs": [
    "artifact://runs/run_001/understand/quality-report.json"
  ],
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0",
  "validation_status": "passed",
  "trace_refs": [
    "trace_understand_001"
  ],
  "created_at": "2026-06-19T00:00:00Z"
}
```

The handoff artifact should contain refs and quality metadata, not long candidate text.

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
- `source_id`;
- `source_version_id`;
- `understanding_artifact_ref`;
- `knowledge_candidate_refs`;
- `ambiguity_refs`;
- `review_refs`;
- `quality_report_ref`;
- `quality_report_refs`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `validation_status`;
- `trace_refs`.

Optional but recommended:

- `candidate_index_projection_refs`;
- `relation_hint_refs`;
- `blocked_candidate_refs`;
- `review_required_candidate_refs`.

## Producer Responsibility

The Understanding Agent must:

- validate output schemas before handoff;
- include only candidate refs that resolve;
- include ambiguity and review refs;
- include quality report ref;
- preserve source id and source version id;
- preserve taxonomy bundle id and version;
- mark validation status;
- emit trace refs.

The Understanding Agent should not hand off if the quality report fails the minimum bar.

## Consumer Responsibility

The Connection Agent must:

- validate handoff schema;
- reject handoff if required refs are missing;
- load understanding artifact and candidate refs;
- preserve evidence refs in relation proposals;
- treat ambiguity and review refs as relationship risk signals;
- avoid accepting relation proposals as durable graph records.

The Connection Agent should fail explicitly with `invalid_handoff`, `unresolved_candidate_ref`, or `candidate_not_ready_for_connection` rather than silently skipping required candidates.

## Validation Gate

Connect can start only when:

- `validation_status` is `passed` or `passed_with_warnings`;
- understanding artifact ref resolves;
- quality report ref resolves;
- all required candidate refs resolve;
- candidate evidence refs resolve;
- taxonomy bundle ref resolves;
- the handoff schema validates.

If `validation_status` is `failed`, Connect must not run except in an explicit debug mode.

## Minimal V1 Rule

For v1:

- handoff is a JSON artifact in the run workspace;
- candidates come from Markdown/text structural understanding first;
- unresolved candidate refs block normal connection;
- relation hints are optional;
- every downstream relation proposal keeps source, version, candidate, taxonomy, and evidence refs.

## Design Rule

Understand owns candidate extraction.

Connect owns relationship proposal.

The handoff keeps candidate meaning connected to graph context without promoting it to durable truth.
