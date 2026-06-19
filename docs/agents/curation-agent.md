# Curation Agent Spec

The Curation Agent decides which candidates become durable records.

Its purpose is to govern durable memory acceptance.

It is allowed to write memory only through explicit curation decisions.

Stage baseline: [Curation Baseline](../architecture/curation-baseline.md).

Media behavior: [Media Curation Concept Proofs](../architecture/media-curation-concept-proofs.md).

Readiness review: [Curation Readiness Review](../architecture/curation-readiness-review.md).

Input handoff: [Update to Curation Handoff](../architecture/update-curation-handoff.md).

Output handoff: `CurationToEvaluateHandoff`.

## Responsibilities

- consume `UpdateToCurationHandoff`;
- validate update candidates and quality report refs;
- decide whether candidates are accepted, edited, deferred, rejected, or need more evidence;
- create durable records when candidates are accepted;
- update candidate or record lifecycle status when the decision requires it;
- decide current-vs-historical state when a record is superseded or retracted;
- preserve provenance, curation rationale, and lifecycle metadata;
- avoid silent overwrites by using supersession, retraction, or quarantine metadata;
- emit curation decisions, quality report, and traces.

## Non-Responsibilities

- do not create new update candidates;
- do not re-verify evidence;
- do not perform broad retrieval;
- do not read raw source content by default;
- do not bypass curation decisions with provider-specific memory writes.

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
- `delete.create_tombstone`;

Forbidden ports:

- `candidate.emit`;
- `verification.check`;
- `retrieval.fetch_evidence`;
- `index.search`;
- `index.write_projection`;
- `index.deactivate_projection`;
- `source.read`;
- `source.write`;
- `source.version`;
- `source.tombstone`;
- `source.restore`;
- direct provider-specific memory writes.

## Outputs

- curation decisions;
- durable records;
- durable relation records;
- curation quality report;
- status updates;
- lifecycle event refs;
- `CurationToEvaluateHandoff`;
- rollback or tombstone events when approved.

## Expected Result

A successful run should leave the knowledge base in a clearer state than before.

For each reviewed candidate, the agent should explain:

- what decision was made;
- why the decision was made;
- what durable records or lifecycle states changed;
- which evidence, verification, review, and candidate refs support the decision;
- whether the resulting knowledge is current, historical, rejected, deferred, or unavailable.

Creating no durable record is a valid result when candidates are weak, duplicate, risky, or not reusable.

## Validation Rules

- `UpdateToCurationHandoff` must validate before work starts.
- Every target candidate ref must resolve.
- Accepted records must preserve candidate, evidence, source, verification, and curation refs when available.
- Review-required candidates must not be accepted without review resolution.
- Supersession and retraction must not overwrite older records silently.
- Durable record kinds and taxonomy-scoped fields must validate.

## Design Rule

The Curation Agent is the durable memory gate.

It should preserve provenance and avoid silent overwrites.
