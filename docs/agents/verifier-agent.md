# Verifier Agent Spec

This document defines the detailed v1 contract for the Verifier Agent.

The Verifier Agent implements the `verify` stage.

It checks whether relationship proposals, draft answers, or proposed actions are grounded, fresh, and conflict-aware.

It does not write durable memory.

It does not accept graph edges.

## Purpose

The Verifier Agent turns proposals or draft answers into verification reports.

```text
ConnectToVerifyHandoff
  -> VerifierAgent
  -> VerificationReport
  -> VerificationResult[]
  -> ReviewRequest[]
```

The agent should make unsupported, stale, uncertain, or contradictory outputs visible before curation or user-facing trust.

It should preserve assumptions as assumptions and avoid treating fluent draft text as verified fact.

The stage baseline is defined in [Verify Baseline](../architecture/verify-baseline.md).

The boundary from connect is defined in [Connect and Verify Boundary](../architecture/connect-verify-boundary.md).

The required handoff from connect is defined in [Connect to Verify Handoff](../architecture/connect-verify-handoff.md).

## Verification Modes

V1 modes:

- `verify_relationships`: audit `RelationshipProposal` artifacts from `connect`;
- `verify_answer`: audit `DraftAnswer` or `ProposedAction` artifacts from `reason`.

The first implementation should support Markdown/text `verify_answer` after the reason baseline, while keeping `verify_relationships` available for connection outputs.

Media-specific answer verification should be expanded only after Markdown/text verification is stable.

## Responsibilities

The agent owns:

- loading and validating the connect-to-verify or reason-to-verify handoff;
- resolving connection artifact refs;
- resolving relationship proposal refs;
- resolving draft answer or proposed action refs;
- resolving claim refs and assumption refs;
- resolving endpoint refs;
- resolving evidence refs;
- validating relation types against taxonomy;
- running deterministic verification checks;
- detecting missing, stale, weak, or contradictory evidence;
- preserving assumptions as unverified assumptions;
- emitting verification result artifacts;
- emitting review requests when needed;
- validating output schemas;
- writing verification reports;
- emitting trace events.

The agent does not own:

- creating new relationship proposals as its primary output;
- accepting graph edges;
- writing durable memory;
- curating accepted records;
- rewriting source evidence;
- source deletion, rollback, or lifecycle mutation.

## Trigger

The agent may run when:

- a connection artifact passes its quality gate;
- a reasoning agent produces a draft answer;
- evidence refs or endpoint refs change;
- taxonomy relation rules change;
- a human requests re-verification.

The first implementation should run manually or from a simple orchestrator command.

## Task Contract

Recommended task shape for relationship verification:

```json
{
  "task_id": "task_verify_001",
  "run_id": "run_001",
  "agent_id": "verifier_agent",
  "stage": "verify",
  "intent": "verify_relationships",
  "input": {
    "handoff_ref": "artifact://runs/run_001/handoffs/connect-to-verify.json",
    "connection_artifact_ref": "artifact://runs/run_001/connect/connection-artifact.json",
    "mode": "verify_relationships"
  },
  "constraints": {
    "require_evidence_refs": true,
    "allow_model": false,
    "preferred_precision": "high"
  },
  "allowed_tool_ports": [
    "artifact.read",
    "schema.validate",
    "taxonomy.read",
    "taxonomy.validate",
    "verification.check",
    "artifact.write",
    "audit.trace"
  ]
}
```

Recommended task shape for answer verification:

```json
{
  "task_id": "task_verify_answer_001",
  "run_id": "run_001",
  "agent_id": "verifier_agent",
  "stage": "verify",
  "intent": "verify_answer",
  "input": {
    "handoff_ref": "artifact://runs/run_001/handoffs/reason-to-verify.json",
    "draft_answer_ref": "artifact://runs/run_001/reason/draft-answer.json",
    "evidence_bundle_ref": "artifact://runs/run_001/retrieve/evidence-bundle.json",
    "mode": "verify_answer"
  },
  "constraints": {
    "require_cited_evidence_refs": true,
    "allow_model": false,
    "preferred_precision": "high"
  },
  "allowed_tool_ports": [
    "artifact.read",
    "schema.validate",
    "verification.check",
    "artifact.write",
    "audit.trace"
  ]
}
```

## Context Envelope

The context envelope should contain refs, constraints, and schemas, not full source dumps.

Recommended fields:

- `context_id`;
- `task_id`;
- `run_id`;
- `handoff_ref`;
- `connection_artifact_ref`;
- `draft_answer_ref`;
- `proposed_action_ref`;
- `evidence_bundle_ref`;
- `relationship_proposal_refs`;
- `claim_refs`;
- `assumption_refs`;
- `cited_evidence_refs`;
- `taxonomy_bundle_ref`;
- `taxonomy_version`;
- `schema_refs`;
- `verification_policy_ref`;
- `allowed_tool_ports`;
- `excluded_context`.

Evidence should be fetched through allowed ports when needed.

## Tool Contract

Required ports:

- `artifact.read`;
- `schema.validate`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `verification.check`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `record.search`;
- `graph.query`;
- `source.locate`;
- `source.read`;
- `retrieval.fetch_evidence`;
- `review.request`;
- `model.complete`.

Forbidden ports:

- `memory.write`;
- `memory.update_status`;
- `curation.decide`;
- `source.write`;
- `source.version`;
- `source.tombstone`;
- `source.restore`;
- `index.deactivate_projection`;
- `rollback.create_event`;
- `delete.create_tombstone`.

Maximum side effect level:

- `derive`.

The agent may write run-local audit artifacts, but it must not mutate durable graph records or memory.

## Processing Pipeline

V1 relationship verification pipeline:

```text
1. read task and context envelope
2. verify allowed tool ports
3. read connect-to-verify handoff
4. validate handoff schema
5. load connection artifact
6. resolve relationship proposal refs
7. resolve endpoint refs
8. resolve evidence refs
9. load taxonomy relation rules
10. run deterministic verification checks
11. normalize verification results
12. emit review requests when needed
13. validate output schemas
14. write verification report
15. emit quality report
16. emit trace events
```

Optional model-assisted verification may run after step 10.

Model output must be treated as untrusted until schema validation and evidence validation pass.

## Verification Policy

V1 should start with deterministic checks.

Recommended checks:

- target proposal ref resolves;
- `from_ref` resolves;
- `to_ref` resolves or is marked unresolved;
- evidence refs resolve;
- relation type is allowed by taxonomy;
- proposal status is candidate/proposal-level;
- source version is current or explicitly historical;
- evidence supports the relation type at a basic structural level;
- ambiguity and review flags are preserved.

## Output Artifacts

The agent writes:

- `verification-report.json`;
- `results/*.json`;
- `review/*.json`;
- `quality-report.json`;
- `traces/tool-calls.jsonl`.

### Verification Report

Required fields:

- `report_id`;
- `report_type`;
- `schema_version`;
- `task_id`;
- `run_id`;
- `mode`;
- `target_artifact_ref`;
- `checked_ref_count`;
- `verified_refs`;
- `rejected_refs`;
- `unsupported_refs`;
- `uncertain_refs`;
- `stale_evidence_refs`;
- `review_refs`;
- `quality_report_ref`;
- `status`;
- `created_at`.

### Verification Result

Required fields:

- `verification_result_id`;
- `target_ref`;
- `target_type`;
- `status`;
- `checks`;
- `evidence_refs`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `confidence`;
- `requires_review`.

## Validation

The agent must fail or emit review when:

- handoff schema is invalid;
- connection artifact cannot be resolved;
- relationship proposal ref cannot be resolved;
- endpoint ref cannot be resolved and is not marked unresolved;
- evidence ref cannot be resolved;
- relation type is not allowed by taxonomy;
- output schema validation fails;
- a model response cannot be parsed into the expected schema.

Failure classes:

- `invalid_handoff`;
- `missing_connection_artifact`;
- `unresolved_proposal_ref`;
- `unresolved_endpoint_ref`;
- `missing_evidence_ref`;
- `taxonomy_validation_failed`;
- `verification_schema_invalid`;
- `model_output_invalid`;
- `permission_required`.

## Trace Events

Every tool call should produce a trace event.

The agent should also emit stage-level events:

- `verify.started`;
- `verify.handoff_validated`;
- `verify.targets_resolved`;
- `verify.evidence_resolved`;
- `verify.results_emitted`;
- `verify.validation_failed`;
- `verify.completed`.

## Model-Assisted Mode

Model use is optional.

When enabled, the model receives:

- target proposal refs or bounded excerpts;
- evidence refs or bounded evidence excerpts;
- taxonomy relation definitions;
- output schema;
- verification policy.

The model must return structured verification suggestions only.

The agent still owns:

- endpoint validation;
- evidence validation;
- taxonomy validation;
- ID assignment;
- artifact writing;
- trace emission.

Model output should never directly accept a graph edge.

## Handoff To Curation Or Update

The agent hands off:

- verification report ref;
- verified refs;
- rejected refs;
- unsupported refs;
- uncertain refs;
- review refs;
- quality report ref;
- taxonomy refs;
- trace refs.

Curation may use these artifacts to decide whether verified proposals become durable graph records or memory updates.

## V1 Acceptance Criteria

The Verifier Agent v1 is acceptable when:

- it can run without a model adapter;
- it consumes `ConnectToVerifyHandoff`;
- it supports relationship proposal verification;
- every verification result has a target ref;
- missing evidence is reported explicitly;
- stale or unresolved evidence is marked;
- relation types validate against taxonomy;
- output artifacts validate against schemas;
- quality report is written;
- no durable memory, graph write, or lifecycle mutation tool is called.

## Design Rule

The Verifier Agent is an auditor.

It is not a graph writer, answer author, or curator.
