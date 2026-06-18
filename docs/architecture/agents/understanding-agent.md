# Understanding Agent Spec

This document defines the detailed v1 contract for the Understanding Agent.

The Understanding Agent implements the source/document `understand` stage.

It reads ingest outputs and source access units, then emits evidence-grounded knowledge candidates.

It does not answer user questions.

It does not write durable memory.

## Purpose

The Understanding Agent converts source-grounded material into structured candidate knowledge.

```text
IngestArtifact + AccessUnit[]
  -> UnderstandingAgent
  -> UnderstandingArtifact
  -> KnowledgeCandidate[]
  -> AmbiguityNote[]
  -> ReviewRequest[]
```

The agent should make source meaning explicit enough for `connect`, `retrieve`, `reason`, `verify`, and `curation` to use later.

Media-specific examples are defined in [Media Understand Concept Proofs](../media-understand-concept-proofs.md).

## Responsibilities

The agent owns:

- loading and validating the ingest-to-understand handoff;
- resolving access-unit refs;
- reading exact source units;
- applying deterministic structural extraction rules;
- optionally applying model-assisted extraction;
- normalizing candidate fields;
- attaching evidence refs;
- emitting ambiguity notes;
- emitting review requests;
- validating all output schemas;
- writing understanding artifacts;
- emitting trace events.

The agent does not own:

- durable knowledge creation;
- relationship acceptance;
- contradiction decisions against existing graph records;
- supersession decisions;
- retrieval planning for user questions;
- source deletion, rollback, or curation.

## Trigger

The agent may run when:

- a source is newly ingested;
- a source version changes;
- taxonomy changes require re-understanding;
- parser policy changes create new access units;
- a planner detects that a needed source has been ingested but not understood;
- a human requests reprocessing.

The first implementation should run manually or from a simple orchestrator command.

The required handoff from ingest is defined in [Ingest to Understand Handoff](../ingest-understand-handoff.md).

## Task Contract

Recommended task shape:

```json
{
  "task_id": "task_understand_001",
  "run_id": "run_001",
  "agent_id": "understanding_agent",
  "stage": "understand",
  "intent": "understand_source",
  "input": {
    "handoff_ref": "artifact://runs/run_001/handoffs/ingest-to-understand.json",
    "ingest_artifact_ref": "artifact://runs/run_001/ingest/ingest-artifact.json",
    "source_id": "src_path_a91c72",
    "source_version_id": "srcv_md_sha256_ab12cd34ef90",
    "mode": "structural_v1"
  },
  "constraints": {
    "require_evidence_refs": true,
    "allow_model": false,
    "max_candidates_per_access_unit": 8,
    "preferred_precision": "high"
  },
  "allowed_tool_ports": [
    "artifact.read",
    "source.locate",
    "source.read",
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
- `source_id`;
- `source_version_id`;
- `handoff_ref`;
- `ingest_artifact_ref`;
- `source_manifest_ref`;
- `access_unit_refs`;
- `preview_refs`;
- `taxonomy_bundle_ref`;
- `taxonomy_version`;
- `schema_refs`;
- `extraction_policy_ref`;
- `allowed_tool_ports`;
- `excluded_context`.

Exact source text or media spans should be fetched through `source.read` after access-unit refs are resolved.

## Tool Contract

Required ports:

- `artifact.read`;
- `source.locate`;
- `source.read`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `schema.validate`;
- `candidate.emit`;
- `ambiguity.emit`;
- `review.request`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `taxonomy.classify`;
- `model.complete`;
- `parse.document`;
- `retrieval.fetch_evidence`.

Forbidden ports:

- `memory.write`;
- `memory.update_status`;
- `curation.decide`;
- `curation.propose`;
- `source.write`;
- `source.version`;
- `source.tombstone`;
- `source.restore`;
- `index.deactivate_projection`;
- `rollback.create_event`;
- `delete.create_tombstone`.

Maximum side effect level:

- `propose`.

The agent may write run-local artifacts, but it must not mutate durable records or lifecycle state.

## Processing Pipeline

V1 pipeline:

```text
1. read task and context envelope
2. verify allowed tool ports
3. read ingest artifact
4. validate handoff schema
5. load taxonomy bundle
6. resolve source manifest and access units
7. read exact access-unit content
8. run structural extractors
9. normalize candidate records
10. attach evidence refs
11. emit ambiguity and review artifacts
12. validate output schemas
13. write understanding artifact
14. emit quality report
15. emit trace events
```

Optional model-assisted extraction may run after step 8.

Model output must be treated as untrusted until schema validation, evidence validation, and candidate normalization pass.

## Extraction Policy

V1 should start with `structural_v1`.

Media-specific extraction policies should follow [Media Understand Concept Proofs](../media-understand-concept-proofs.md).

Recommended extractors:

| Extractor | Input | Output |
| --- | --- | --- |
| `heading_decision_detector` | headings and nearby paragraphs | `decision_candidate` |
| `heading_question_detector` | headings ending in question form | `question_candidate` |
| `definition_detector` | glossary-like headings or definition patterns | `concept_candidate` |
| `procedure_detector` | ordered lists under workflow/procedure headings | `procedure_candidate` |
| `constraint_detector` | sentences with `must`, `should`, `cannot`, `required` | `constraint_candidate` |
| `claim_detector` | short declarative paragraphs in design sections | `claim_candidate` |
| `summary_detector` | bounded source-unit overview | `summary_candidate` |

Each extractor should return:

- candidate kind;
- short label;
- statement artifact ref or inline bounded statement;
- evidence refs;
- confidence;
- extraction rule id;
- ambiguity refs when needed.

## Candidate Normalization

Every candidate should be normalized before emission.

Rules:

- candidate IDs are deterministic within the run when possible;
- candidate kind must be one of the allowed v1 kinds;
- status is always `candidate`;
- evidence refs are required;
- source id and source version id are required;
- taxonomy bundle id and version are required;
- confidence is numeric;
- long text goes behind refs;
- generated text records generator metadata.

Candidate ID shape:

```text
kc_{kind_short}_{source_version_hash_prefix}_{access_unit_scope}_{ordinal}
```

Example:

```text
kc_claim_ab12cd34_section_003_001
```

## Output Artifacts

The agent writes:

- `understanding-artifact.json`;
- `candidates/*.json`;
- `ambiguity/*.json`;
- `review/*.json`;
- `quality-report.json`;
- `traces/tool-calls.jsonl`.

### Understanding Artifact

Required fields:

- `artifact_id`;
- `artifact_type`;
- `schema_version`;
- `task_id`;
- `run_id`;
- `source_id`;
- `source_version_id`;
- `source_manifest_ref`;
- `ingest_artifact_ref`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `generator`;
- `candidate_refs`;
- `ambiguity_refs`;
- `review_refs`;
- `quality_report_ref`;
- `status`;
- `created_at`.

### Knowledge Candidate

Required fields:

- `candidate_id`;
- `candidate_kind`;
- `status`;
- `short_label`;
- `statement_ref`;
- `evidence_refs`;
- `source_id`;
- `source_version_id`;
- `access_unit_refs`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `confidence`;
- `extraction_policy_ref`;
- `generator`;
- `ambiguity_refs`;
- `requires_review`.

### Quality Report

Recommended shape:

```json
{
  "quality_report_id": "uqr_001",
  "source_id": "src_path_a91c72",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "candidate_count": 12,
  "candidate_count_by_kind": {
    "claim_candidate": 5,
    "decision_candidate": 2,
    "concept_candidate": 3,
    "question_candidate": 2
  },
  "evidence_coverage": 1.0,
  "review_rate": 0.25,
  "unresolved_ref_count": 0,
  "schema_failure_count": 0,
  "model_assisted": false
}
```

## Validation

The agent must fail or emit a review request when:

- handoff schema is invalid;
- ingest artifact cannot be resolved;
- source manifest cannot be resolved;
- access-unit ref cannot be resolved;
- taxonomy bundle is missing;
- candidate kind is unknown;
- candidate has no evidence ref;
- output schema validation fails;
- a model response cannot be parsed into the expected schema.

Failure classes:

- `missing_ingest_artifact`;
- `invalid_handoff`;
- `unresolved_source_ref`;
- `unresolved_access_unit_ref`;
- `taxonomy_validation_failed`;
- `candidate_schema_invalid`;
- `missing_evidence_ref`;
- `model_output_invalid`;
- `permission_required`.

## Trace Events

Every tool call should produce a trace event.

Recommended event fields:

- `trace_id`;
- `tool_call_id`;
- `port_id`;
- `agent_id`;
- `task_id`;
- `run_id`;
- `input_refs`;
- `output_refs`;
- `side_effect_level`;
- `status`;
- `error_class`;
- `created_at`.

The agent should also emit stage-level events:

- `understand.started`;
- `understand.handoff_validated`;
- `understand.access_units_resolved`;
- `understand.candidates_emitted`;
- `understand.validation_failed`;
- `understand.completed`.

## Model-Assisted Mode

Model use is optional.

When enabled, the model receives:

- task instruction;
- bounded source excerpts or access-unit refs;
- taxonomy definitions needed for classification;
- output schema;
- extraction policy;
- evidence requirements.

The model must return structured candidate proposals only.

The agent still owns:

- evidence validation;
- schema validation;
- ID assignment;
- artifact writing;
- trace emission.

Model output should never directly become durable knowledge.

## Handoff To Connect

The agent hands off:

- understanding artifact ref;
- candidate refs;
- ambiguity refs;
- review refs;
- quality report ref;
- source and taxonomy refs;
- trace refs.

Connect may use these artifacts to propose relationships, duplicates, contradictions, support, dependencies, and supersession.

## V1 Acceptance Criteria

The Understanding Agent v1 is acceptable when:

- it can run without a model adapter;
- it supports Markdown/text access units;
- it emits at least `claim_candidate`, `concept_candidate`, `question_candidate`, and `constraint_candidate`;
- every candidate has an evidence ref;
- invalid handoffs fail explicitly;
- output artifacts validate against schemas;
- quality report is written;
- no durable memory or lifecycle mutation tool is called.

## Design Rule

The Understanding Agent is a candidate producer.

It is not a memory writer, answer generator, or relationship authority.
