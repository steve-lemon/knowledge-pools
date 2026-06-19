# Curation Baseline

This document defines the `curation` stage for Knowledge Pools.

The canonical stage flow is:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

## Purpose

`curation` decides which update candidates become durable knowledge.

It is the durable memory gate.

Unlike `update`, this stage may create durable records or lifecycle changes when a candidate is accepted, edited, retracted, superseded, archived, or rejected.

The core question is:

```text
Should this proposed change become part of durable knowledge, and under what lifecycle state?
```

## Role In The Loop

`update` proposes reusable memory changes.

`curation` decides whether to accept, edit, defer, reject, retract, supersede, quarantine, or tombstone those proposed changes.

`evaluate` later records quality signals from the decision and its downstream effects.

```text
UpdateToCurationHandoff
  -> candidate review
  -> CurationDecision
  -> durable record or lifecycle update
  -> CurationToEvaluateHandoff
```

## Expected Effects

The curation stage should:

- keep durable memory intentionally governed;
- prevent automatic memory growth;
- preserve provenance for every accepted or rejected candidate;
- allow human review where needed;
- convert accepted candidates into durable records or durable relation/lifecycle changes;
- preserve old records instead of silently overwriting them;
- make rollback, quarantine, deletion, and evaluation possible later.

## Inputs

Primary input:

- `UpdateToCurationHandoff`

Required referenced artifacts:

- update candidate refs;
- source refs;
- evidence refs;
- review refs when present;
- update quality report ref;
- review requirement flag.

Optional context:

- prior durable record refs;
- relationship proposal refs;
- verification report refs;
- curation policy refs;
- rollback or deletion policy refs;
- taxonomy bundle id and version;
- human review artifacts.

## Outputs

Primary output:

- `CurationDecision`

Supporting outputs:

- durable knowledge records;
- durable relation records;
- durable lifecycle status updates;
- review request or review resolution refs;
- rollback, quarantine, or tombstone event refs when explicitly approved;
- `CurationToEvaluateHandoff`;
- trace events.

## Decision Types

Recommended curation decision types:

| Decision | Meaning | Durable mutation? |
| --- | --- | --- |
| `accept` | Candidate becomes durable knowledge as proposed | Yes |
| `edit_and_accept` | Candidate is edited, then accepted | Yes |
| `defer` | Candidate is useful but not ready | No durable knowledge write |
| `reject` | Candidate should not become durable knowledge | Candidate status update only |
| `needs_more_evidence` | Candidate requires additional support | Candidate status update only |
| `supersede` | New record replaces older current record while preserving history | Yes |
| `retract` | Existing accepted record is later judged wrong | Yes |
| `quarantine` | Candidate or record is excluded pending investigation | Yes, lifecycle update |
| `tombstone` | Content or record is removed from active use by policy | Yes, lifecycle update |

## Minimal Curation Decision Shape

```json
{
  "curation_decision_id": "cur_20260619_001",
  "decision_type": "accept",
  "target_candidate_ref": "upd_md_claim_001",
  "status": "completed",
  "rationale": "Candidate is verified, concise, reusable, and source-grounded.",
  "source_refs": ["src_md_001"],
  "evidence_refs": ["src_md_001#section_001"],
  "verification_refs": ["vrr_md_claim_001"],
  "created_record_refs": ["claim_20260619_001"],
  "updated_record_refs": [],
  "superseded_record_refs": [],
  "review_refs": [],
  "created_by": "curation_agent",
  "requires_human_approval": false,
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0"
}
```

## Durable Record Creation

Accepted candidates may create:

- `Claim`;
- `Decision`;
- `Concept`;
- `Procedure`;
- `Question`;
- `ProjectContext`;
- durable relation record;
- lifecycle event record.

Every durable record must preserve:

- curation decision ref;
- candidate ref;
- source refs or run refs;
- evidence refs;
- verification refs when available;
- taxonomy bundle id and version;
- creation reason;
- lifecycle status;
- supersession, retraction, quarantine, or tombstone refs when applicable.

## Boundary With Update

`update` proposes.

`curation` decides.

Curation may read candidates and quality reports, but it should not invent new update candidates to justify a decision.

If a candidate is insufficient, curation should `defer`, `reject`, or mark `needs_more_evidence`.

## Boundary With Evaluate

`curation` records the decision and durable mutation.

`evaluate` later records quality signals about whether that decision helped or harmed the system.

Curation should not calculate long-term quality metrics.

It should emit enough trace and decision data for evaluation.

## Boundary With Rollback And Deletion

Curation can create lifecycle decisions such as `retract`, `quarantine`, or `tombstone` only when explicitly requested by the curation task or policy.

Rollback and deletion are not normal acceptance paths.

They are governance paths that require reason, affected refs, and traceable events.

See [Rollback and Quarantine Policy](rollback-and-quarantine.md) and [Content Deletion Lifecycle](content-deletion-lifecycle.md).

## Markdown-First V1 Scope

V1 should support curation for Markdown/text-derived candidates only.

Allowed v1 candidates:

- verified Markdown claim candidates;
- explicit user correction candidates;
- open question candidates;
- stale warning candidates;
- simple procedure or decision candidates backed by Markdown/text evidence.

Deferred:

- image-derived durable records;
- audio-derived durable records;
- video-derived durable records;
- PDF-derived durable records unless they have verified text access units;
- automatic rollback or deletion workflows without human approval.

## Tool Contract

Required ports:

- `artifact.read`;
- `schema.validate`;
- `curation.decide`;
- `memory.write`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `memory.update_status`;
- `record.search`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `review.request`;
- `rollback.create_event`;
- `delete.create_tombstone`.

Forbidden ports:

- `candidate.emit`;
- `verification.check`;
- `retrieval.fetch_evidence`;
- `index.search`;
- `source.read`;
- `source.write`;
- `source.version`;
- `source.restore`;
- direct provider-specific memory writes.

## Validation Rules

Every curation decision must:

- reference an update candidate or existing durable target;
- declare a decision type;
- include a rationale;
- preserve candidate, source, evidence, and verification refs when available;
- validate durable record kind and taxonomy-scoped fields;
- specify whether human approval was required;
- preserve superseded, retracted, quarantined, or tombstoned refs when applicable;
- emit a handoff to evaluation.

## Quality Report

The curation stage should emit a quality report with:

- candidate count reviewed;
- accepted count;
- edited-and-accepted count;
- deferred count;
- rejected count;
- needs-more-evidence count;
- lifecycle mutation count;
- human review count;
- schema validation status;
- durable write count.

## Failure Classes

- invalid `UpdateToCurationHandoff`;
- missing update candidate;
- unresolved evidence or source refs;
- candidate schema failure;
- taxonomy validation failure;
- attempted silent overwrite;
- missing rationale;
- missing human approval for risky decision;
- durable write failure;
- lifecycle mutation policy violation.

## Acceptance Criteria

V1 is ready when:

- `UpdateToCurationHandoff` validates;
- Markdown/text update candidates can be accepted, deferred, rejected, or marked needs-more-evidence;
- accepted candidates produce durable records with provenance;
- edits preserve the original candidate and decision rationale;
- supersession does not overwrite older records silently;
- rejected and deferred candidates remain auditable;
- `CurationToEvaluateHandoff` is emitted;
- all durable writes and status changes are traced.

## Design Rule

Curation is the memory gate.

Nothing becomes durable knowledge merely because an agent said it.
