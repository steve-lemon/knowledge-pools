# Connection Agent Spec

This document defines the detailed v1 contract for the Connection Agent.

The Connection Agent implements the `connect` stage.

It relates knowledge candidates to existing records, concepts, sources, and other candidates.

It does not accept relationships as durable truth.

It does not write durable memory.

## Purpose

The Connection Agent turns isolated candidates into relationship proposals.

```text
UnderstandToConnectHandoff
  -> ConnectionAgent
  -> ConnectionArtifact
  -> RelationshipProposal[]
  -> ReviewRequest[]
```

The agent should make candidate relationships explicit enough for `verify`, `curation`, retrieval, and graph storage to use later.

The stage baseline is defined in [Connect Baseline](../architecture/connect-baseline.md).

The boundary from understand is defined in [Understand and Connect Boundary](../architecture/understand-connect-boundary.md).

The required handoff from understand is defined in [Understand to Connect Handoff](../architecture/understand-connect-handoff.md).

## Responsibilities

The agent owns:

- loading and validating the understand-to-connect handoff;
- resolving understanding artifact refs;
- resolving knowledge candidate refs;
- loading taxonomy relation rules;
- searching existing records and graph neighborhoods;
- detecting likely local duplicates;
- proposing relationship candidates;
- attaching evidence refs and rationale refs;
- emitting ambiguity notes or review requests;
- validating output schemas;
- writing connection artifacts;
- emitting trace events.

The agent does not own:

- source interpretation;
- creating new knowledge candidates from raw source units;
- verifying relationship truth;
- accepting graph edges;
- superseding durable records;
- durable memory writes;
- source deletion, rollback, or curation.

## Trigger

The agent may run when:

- an understanding artifact passes its quality gate;
- a source version is re-understood;
- taxonomy relation rules change;
- existing graph records change enough to require reconnection;
- a human requests re-connection.

The first implementation should run manually or from a simple orchestrator command.

## Task Contract

Recommended task shape:

```json
{
  "task_id": "task_connect_001",
  "run_id": "run_001",
  "agent_id": "connection_agent",
  "stage": "connect",
  "intent": "connect_candidates",
  "input": {
    "handoff_ref": "artifact://runs/run_001/handoffs/understand-to-connect.json",
    "understanding_artifact_ref": "artifact://runs/run_001/understand/understanding-artifact.json",
    "mode": "deterministic_v1"
  },
  "constraints": {
    "require_evidence_refs": true,
    "allow_model": false,
    "max_relation_proposals_per_candidate": 8,
    "preferred_precision": "high"
  },
  "allowed_tool_ports": [
    "artifact.read",
    "record.search",
    "graph.query",
    "taxonomy.read",
    "taxonomy.validate",
    "schema.validate",
    "candidate.emit",
    "ambiguity.emit",
    "review.request",
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
- `understanding_artifact_ref`;
- `knowledge_candidate_refs`;
- `taxonomy_bundle_ref`;
- `taxonomy_version`;
- `schema_refs`;
- `relation_policy_ref`;
- `existing_record_refs`;
- `graph_neighborhood_refs`;
- `allowed_tool_ports`;
- `excluded_context`.

Candidate details and existing records should be fetched through allowed ports.

## Tool Contract

Required ports:

- `artifact.read`;
- `record.search`;
- `graph.query`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `schema.validate`;
- `candidate.emit`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `model.complete`;
- `ambiguity.emit`;
- `review.request`;
- `index.search`;

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

- `propose`.

The agent may write run-local artifacts, but it must not mutate durable graph records or memory.

## Processing Pipeline

V1 pipeline:

```text
1. read task and context envelope
2. verify allowed tool ports
3. read understand-to-connect handoff
4. validate handoff schema
5. load understanding artifact
6. resolve knowledge candidate refs
7. load taxonomy relation rules
8. search existing records and graph neighborhoods
9. run deterministic matching rules
10. normalize relationship proposals
11. attach evidence and rationale refs
12. emit ambiguity and review artifacts
13. validate output schemas
14. write connection artifact
15. emit quality report
16. emit trace events
```

Optional model-assisted relation proposal may run after step 9.

Model output must be treated as untrusted until schema validation, endpoint validation, evidence validation, and proposal normalization pass.

## Matching Policy

V1 should start with conservative matching.

Recommended deterministic signals:

- exact normalized label match;
- known aliases from taxonomy or graph records;
- shared source or access-unit refs;
- explicit wiki links or mentions;
- compatible candidate kind;
- compatible taxonomy categories;
- temporal/version metadata;
- relation hints from understand.

Similarity may create a proposal, but it must not create an accepted graph edge.

## Output Artifacts

The agent writes:

- `connection-artifact.json`;
- `relations/*.json`;
- `unresolved/*.json`;
- `review/*.json`;
- `quality-report.json`;
- `traces/tool-calls.jsonl`.

### Connection Artifact

Required fields:

- `artifact_id`;
- `artifact_type`;
- `schema_version`;
- `task_id`;
- `run_id`;
- `understanding_artifact_ref`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `relationship_proposal_refs`;
- `duplicate_candidate_refs`;
- `unresolved_relation_refs`;
- `review_refs`;
- `quality_report_ref`;
- `status`;
- `created_at`.

### Relationship Proposal

Required fields:

- `proposal_id`;
- `proposal_kind`;
- `relation_type`;
- `status`;
- `from_ref`;
- `to_ref`;
- `evidence_refs`;
- `source_id`;
- `source_version_id`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `confidence`;
- `rationale_ref`;
- `ambiguity_refs`;
- `requires_review`.

## Validation

The agent must fail or emit review when:

- handoff schema is invalid;
- understanding artifact cannot be resolved;
- candidate ref cannot be resolved;
- endpoint ref cannot be resolved;
- relation type is not allowed by taxonomy;
- proposal has no evidence ref and no indirect-evidence rationale;
- output schema validation fails;
- a model response cannot be parsed into the expected schema.

Failure classes:

- `invalid_handoff`;
- `missing_understanding_artifact`;
- `unresolved_candidate_ref`;
- `unresolved_endpoint_ref`;
- `taxonomy_relation_not_allowed`;
- `relationship_schema_invalid`;
- `missing_evidence_ref`;
- `model_output_invalid`;
- `permission_required`.

## Trace Events

Every tool call should produce a trace event.

The agent should also emit stage-level events:

- `connect.started`;
- `connect.handoff_validated`;
- `connect.candidates_resolved`;
- `connect.graph_context_loaded`;
- `connect.relation_proposals_emitted`;
- `connect.validation_failed`;
- `connect.completed`.

## Model-Assisted Mode

Model use is optional.

When enabled, the model receives:

- candidate refs or bounded candidate excerpts;
- taxonomy relation definitions;
- existing record snippets or refs;
- output schema;
- relation policy;
- evidence requirements.

The model must return structured proposal candidates only.

The agent still owns:

- endpoint validation;
- evidence validation;
- relation type validation;
- ID assignment;
- artifact writing;
- trace emission.

Model output should never directly become a durable graph edge.

## Handoff To Verify

The agent hands off:

- connection artifact ref;
- relationship proposal refs;
- conflict candidate refs;
- unresolved candidate refs;
- ambiguity refs;
- review refs;
- quality report ref;
- taxonomy refs;
- trace refs.

Verify may use these artifacts to check whether relationship proposals are supported by evidence.

## V1 Acceptance Criteria

The Connection Agent v1 is acceptable when:

- it can run without a model adapter;
- it consumes `UnderstandToConnectHandoff`;
- it supports Markdown/text candidates;
- it emits at least `duplicates`, `mentions`, and `supports` proposals when deterministic evidence is available;
- every relation proposal has endpoint refs;
- every proposal has evidence refs or explicit indirect-evidence rationale;
- relation types validate against taxonomy;
- output artifacts validate against schemas;
- quality report is written;
- no durable memory, graph write, or lifecycle mutation tool is called.

## Design Rule

The Connection Agent is a relationship proposer.

It is not a graph writer, verifier, or curator.
