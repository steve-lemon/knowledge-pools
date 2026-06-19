# Curation Readiness Review

This document performs the final readiness review for the `curation` stage before moving into `evaluate`.

Use it with:

- [Curation Baseline](curation-baseline.md)
- [Update to Curation Handoff](update-curation-handoff.md)
- [Media Curation Concept Proofs](media-curation-concept-proofs.md)
- [Feedback Update Relationships](feedback-update-relationships.md)
- [Rollback and Quarantine Policy](rollback-and-quarantine.md)
- [Content Deletion Lifecycle](content-deletion-lifecycle.md)
- [Curation Agent Spec](../agents/curation-agent.md)
- [Agent Tool Pool](agent-tool-pool.md)
- [Stage Data Flow Contract](stage-data-flow-contract.md)
- [Markdown-First Implementation Strategy](../operations/markdown-first-implementation.md)

## Readiness Summary

The `curation` stage is ready to move forward when it can consume a schema-valid `UpdateToCurationHandoff`, review update candidates, emit `CurationDecision[]`, create durable records or lifecycle updates when approved, and emit `CurationToEvaluateHandoff`.

Current status:

```text
ready_for_evaluate_baseline: yes
implementation_ready: partial
```

The architecture is ready.

Runtime schemas, local durable record fixtures, lifecycle status stores, and tool implementations are still future implementation work.

## Purpose Check

Curation owns:

- loading and validating `UpdateToCurationHandoff`;
- reading update candidates and quality reports;
- deciding accept, edit-and-accept, defer, reject, needs-more-evidence, supersede, retract, quarantine, or tombstone;
- creating durable records when accepted;
- updating lifecycle status when explicitly approved;
- preserving provenance and rationale;
- emitting curation quality reports;
- handing decisions to `evaluate`.

Curation does not own:

- creating new update candidates;
- re-verifying evidence;
- performing broad retrieval;
- reading raw source content by default;
- writing index projections directly;
- performing source ingest or source version creation;
- bypassing the decision log with provider-specific memory writes.

## Required Outputs

Curation must emit:

- one `CurationDecision` per reviewed candidate or lifecycle target;
- zero or more durable records;
- zero or more durable relation records;
- zero or more lifecycle event refs;
- accepted, edited, deferred, rejected, or needs-more-evidence candidate outcomes;
- curation quality report;
- `CurationToEvaluateHandoff`;
- trace events for every decision and durable mutation.

No durable record is a valid result.

The stage should prefer defer or reject over accepting weak durable memory.

## Tool Readiness

### Required Ports

| Port | Why it is needed | Boundary |
| --- | --- | --- |
| `artifact.read` | Read `UpdateToCurationHandoff`, update candidates, update quality report, review artifacts, and policy refs | Must read only refs declared by handoff or bounded context |
| `schema.validate` | Validate handoff, candidate, curation decision, durable record, quality report, and evaluation handoff artifacts | Read-only validation |
| `curation.decide` | Record accept, edit, defer, reject, needs-more-evidence, supersede, retract, quarantine, or tombstone decisions | Governance decision side effect |
| `memory.write` | Write accepted durable records | Allowed only after a decision artifact exists |
| `artifact.write` | Write curation decisions, quality report, and `CurationToEvaluateHandoff` | Run-local or governance artifact write |
| `audit.trace` | Record decision, durable write, skipped candidate, status update, and tool-call traces | Trace only |

### Optional Ports

| Port | Why it may be useful | Boundary |
| --- | --- | --- |
| `memory.update_status` | Mark existing durable records or candidates superseded, retracted, quarantined, archived, tombstoned, or evidence-unavailable | Requires explicit curation decision |
| `record.search` | Check duplicates, existing records, supersession targets, or current-vs-historical state | Read-only, bounded to curation decision support |
| `taxonomy.read` | Load allowed durable record kinds, relation types, and lifecycle vocabularies | Read-only |
| `taxonomy.validate` | Validate durable record kind, relation type, and taxonomy-scoped fields | Read-only |
| `review.request` | Request human review for risky or unresolved candidates | Review/proposal only |
| `rollback.create_event` | Create rollback event when curation explicitly retracts or quarantines bad accepted state | Requires policy/task approval |
| `delete.create_tombstone` | Create tombstone when curation explicitly approves content or record removal | Requires policy/task approval |

### Forbidden Ports

| Port | Why forbidden |
| --- | --- |
| `candidate.emit` | Candidate creation belongs to update |
| `verification.check` | Evidence support checks belong to verify |
| `retrieval.fetch_evidence` | Evidence fetching belongs to retrieve |
| `index.search` | Broad search belongs to plan/retrieve; curation may only use bounded record search |
| `index.write_projection` | Projection writes happen after durable state through projection/index workflows |
| `index.deactivate_projection` | Projection lifecycle mutation belongs to accepted lifecycle/projection workflows |
| `source.read` | Curation should not reinterpret raw source content |
| `source.write` | Source creation belongs to ingest |
| `source.version` | Source version creation belongs to ingest |
| `source.tombstone` | Source lifecycle mutation should go through deletion governance |
| `source.restore` | Source restore is a lifecycle workflow, not normal curation |
| direct provider-specific memory writes | All durable writes must pass through `memory.write` and curation decision artifacts |

## Tool Sequence

Recommended Markdown-first curation sequence:

```text
artifact.read UpdateToCurationHandoff
  -> schema.validate handoff
  -> artifact.read UpdateCandidate[]
  -> artifact.read update quality report
  -> optional taxonomy.read
  -> optional taxonomy.validate durable record fields
  -> optional record.search for duplicate or supersession check
  -> inspect review requirements
  -> curation.decide CurationDecision[]
  -> memory.write accepted durable records
  -> optional memory.update_status for supersession/retraction/quarantine/tombstone
  -> optional rollback.create_event or delete.create_tombstone when explicitly approved
  -> artifact.write curation quality report
  -> artifact.write CurationToEvaluateHandoff
  -> audit.trace
```

Curation should not call `verification.check` to rescue a weak candidate.

If support is insufficient, curation should decide `defer`, `reject`, or `needs_more_evidence`.

## Handoff Readiness

`UpdateToCurationHandoff` is ready when it includes:

- update candidate refs;
- source refs;
- evidence refs;
- review refs when present;
- quality report ref;
- review requirement flag;
- validation status;
- trace refs.

`CurationToEvaluateHandoff` is ready when it includes:

- curation decision refs;
- accepted record refs;
- rejected candidate refs;
- deferred candidate refs when present;
- lifecycle event refs when present;
- quality report ref;
- validation status;
- trace refs.

## Media Readiness

Markdown-first curation is acceptable when:

- accepted candidates are Markdown/text-derived;
- fact-like candidates are verified;
- durable records are concise and do not copy full source sections;
- evidence, verification, candidate, and curation refs are preserved.

Future media curation is acceptable only after the relevant media verification and review path is stable:

- image curation requires region, OCR, label, or human annotation refs;
- audio curation requires transcript span, timestamp, annotation, or acoustic evidence refs;
- video curation requires scene, frame, subtitle, transcript, OCR, or keyframe refs;
- PDF curation requires page, block, table, span, figure, or OCR refs;
- uncertain media interpretation should defer or require human approval.

## Validation Checklist

Before handoff to `evaluate`:

- incoming handoff validates;
- every candidate ref resolves;
- update quality report resolves;
- every reviewed candidate has exactly one curation decision for this run;
- every decision has a rationale;
- every accepted record preserves provenance refs;
- every edit preserves the original candidate ref and edit rationale;
- review-required candidates are not accepted without review resolution;
- duplicate or supersession targets are checked or explicitly marked unresolved;
- current-vs-historical state is explicit when records change;
- lifecycle updates have approved decision types and affected refs;
- rollback and tombstone events are created only when explicitly approved;
- curation quality report validates;
- `CurationToEvaluateHandoff` validates;
- no candidate emission, re-verification, broad retrieval, source read/write, or direct index projection mutation occurs.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Curation becomes automatic memory | Require `CurationDecision` before `memory.write` |
| Weak candidates become durable | Allow `defer`, `reject`, and `needs_more_evidence` as valid outcomes |
| Older knowledge is overwritten | Require supersession, retraction, or lifecycle metadata instead of in-place overwrite |
| Media interpretation is over-trusted | Defer media durable records until verified media evidence and review paths exist |
| Direct provider memory bypasses audit | Forbid provider-specific writes outside `memory.write` |
| Curation performs retrieval or verification | Forbid `retrieval.fetch_evidence`, `index.search`, and `verification.check` |
| Projection state diverges from durable memory | Forbid direct projection writes in curation and hand off projection needs through durable state |
| Rollback/delete are triggered casually | Allow rollback and tombstone tools only with explicit policy/task approval |

## Decision

The `curation` architecture is ready to hand off to `evaluate` design.

Next work should define:

- evaluation stage purpose and boundary;
- `EvaluationReport` schema;
- curation-to-evaluate handoff details;
- quality signals for accepted, rejected, deferred, and later-corrected decisions;
- regression checks for retrieval, reasoning, verification, update, and curation outcomes.
