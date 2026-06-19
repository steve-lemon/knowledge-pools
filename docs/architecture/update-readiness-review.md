# Update Readiness Review

This document performs the final readiness review for the `update` stage before moving into `curation`.

Use it with:

- [Update Baseline](update-baseline.md)
- [Verify to Update Handoff](verify-update-handoff.md)
- [Media Update Concept Proofs](media-update-concept-proofs.md)
- [Feedback Update Relationships](feedback-update-relationships.md)
- [Knowledge Update Agent Spec](../agents/knowledge-update-agent.md)
- [Agent Tool Pool](agent-tool-pool.md)
- [Stage Data Flow Contract](stage-data-flow-contract.md)
- [Markdown-First Implementation Strategy](../operations/markdown-first-implementation.md)

## Readiness Summary

The `update` stage is ready to move forward when it can consume a schema-valid `VerifyToUpdateHandoff`, inspect verification results, select reusable learning signals, and emit `UpdateCandidate[]` plus `UpdateToCurationHandoff`.

Current status:

```text
ready_for_curation_baseline: yes
implementation_ready: partial
```

The architecture is ready.

Runtime schemas, local fixtures, duplicate detection, and tool implementations are still future implementation work.

## Purpose Check

Update owns:

- loading and validating `VerifyToUpdateHandoff`;
- reading verification reports and update signals;
- deciding which verified or feedback-derived signals are worth proposing;
- emitting `UpdateCandidate` artifacts;
- converting unsupported or uncertain outcomes into review or open-question candidates;
- preserving verification, evidence, source, run, feedback, and taxonomy refs;
- emitting update quality reports;
- handing candidates to `curation`.

Update does not own:

- re-verifying claims;
- retrieving new broad evidence;
- reading raw source content by default;
- accepting candidates;
- writing durable memory;
- changing source lifecycle;
- mutating OpenSearch projections;
- deciding rollback, quarantine, or deletion.

## Required Outputs

Update must emit:

- update artifact for the run;
- zero or more `UpdateCandidate` artifacts;
- selected update signal refs;
- skipped or rejected signal reasons;
- review refs when needed;
- update quality report;
- `UpdateToCurationHandoff`;
- trace events.

An empty candidate list is a valid result.

The stage should prefer no candidate over a noisy or weak candidate.

## Tool Readiness

### Required Ports

| Port | Why it is needed | Boundary |
| --- | --- | --- |
| `artifact.read` | Read `VerifyToUpdateHandoff`, verification report, verification results, feedback artifacts, and prior run artifacts by ref | Must read only refs declared by handoff or bounded context |
| `schema.validate` | Validate handoff, candidate, quality report, and handoff-to-curation artifacts | Read-only validation |
| `candidate.emit` | Emit `UpdateCandidate` artifacts | Proposal-only side effect |
| `artifact.write` | Write update artifact, quality report, and `UpdateToCurationHandoff` | Run-local derived artifacts |
| `audit.trace` | Record signal selection, candidate emission, skipped signals, and tool calls | Trace only |

### Optional Ports

| Port | Why it may be useful | Boundary |
| --- | --- | --- |
| `review.request` | Create review requests for corrections, uncertainty, stale warnings, contradictions, or policy-sensitive candidates | Review/proposal only |
| `curation.propose` | Pre-fill a suggested curation action without applying it | Must not decide or mutate durable memory |
| `record.search` | Check for duplicate or related existing records before emitting a candidate | Read-only, bounded to candidate deduplication |
| `taxonomy.read` | Load candidate type, record kind, or controlled vocabulary rules | Read-only |
| `taxonomy.validate` | Validate taxonomy-scoped candidate fields | Read-only |
| `model.complete` | Assist candidate summarization or classification | Output must be schema-validated and cannot invent evidence |

### Forbidden Ports

| Port | Why forbidden |
| --- | --- |
| `memory.write` | Durable memory writes belong behind curation |
| `memory.update_status` | Supersession, retraction, archive, and quarantine are curation or lifecycle actions |
| `curation.decide` | Curation is a later stage |
| `source.write` | Source creation belongs to ingest |
| `source.version` | Source version creation belongs to ingest |
| `source.locate` | Update should not fetch source locations to reinterpret evidence |
| `source.read` | Update should not read raw source content or re-verify evidence |
| `source.tombstone` | Lifecycle mutation is out of scope |
| `source.restore` | Lifecycle mutation is out of scope |
| `index.write_projection` | Accepted projection writes happen after curation |
| `index.deactivate_projection` | Projection lifecycle mutation is out of scope |
| `index.search` | Update should not become exploratory retrieval |
| `retrieval.fetch_evidence` | Evidence fetching and support checks belong to retrieve and verify |
| `verification.check` | Update consumes verification results; it does not re-run verification |
| `rollback.create_event` | Rollback is a governance workflow after bad durable state is identified |
| `delete.create_tombstone` | Deletion lifecycle is out of scope |

## Tool Sequence

Recommended Markdown-first update sequence:

```text
artifact.read VerifyToUpdateHandoff
  -> schema.validate handoff
  -> artifact.read VerificationReport
  -> artifact.read verification result refs
  -> inspect verified/rejected/unsupported/uncertain/review/update signal refs
  -> optional taxonomy.read
  -> optional taxonomy.validate candidate fields
  -> optional record.search for duplicate check
  -> select reusable learning signals
  -> candidate.emit UpdateCandidate[]
  -> optional review.request
  -> artifact.write update quality report
  -> artifact.write UpdateToCurationHandoff
  -> audit.trace
```

Update should not read raw Markdown, image pixels, audio, video, or PDF text to decide whether evidence supports a claim.

That judgment belongs to `verify`.

If the verification report is insufficient, update should emit `needs_more_evidence`, `needs_review`, or no candidate.

## Handoff Readiness

`VerifyToUpdateHandoff` is ready when it includes:

- verification report ref;
- verified claim refs;
- rejected claim refs;
- unsupported refs;
- uncertain refs;
- review refs;
- update signal refs;
- validation status;
- trace refs.

`UpdateToCurationHandoff` is ready when it includes:

- update candidate refs;
- source refs;
- evidence refs;
- review refs when present;
- review requirement flag;
- quality report ref;
- validation status;
- trace refs.

## Media Readiness

Markdown-first update is acceptable when:

- every fact-like candidate comes from verified Markdown/text evidence;
- unsupported Markdown claims become open questions or review requests;
- candidate statements are concise and do not copy full source sections;
- each candidate keeps verification, evidence, source, and run refs.

Future media update is acceptable only after the relevant media verification path is stable:

- image candidates must preserve image region, OCR, label, or human annotation refs;
- audio candidates must preserve transcript span, timestamp, annotation, or acoustic tag refs;
- video candidates must preserve scene, frame, subtitle, transcript, OCR, or keyframe refs;
- PDF candidates must preserve page, block, table, span, figure, or OCR refs;
- uncertain media interpretations should become review or open-question candidates.

## Validation Checklist

Before handoff to `curation`:

- incoming handoff validates;
- verification report resolves;
- every selected update signal has a selection reason;
- every skipped update signal has a rejection or skip reason;
- every emitted candidate validates;
- every emitted candidate has provenance refs;
- unsupported and uncertain outputs are not promoted to facts;
- assumptions are not promoted to facts;
- media-derived candidates follow the media readiness policy;
- duplicate candidates are marked or reviewed;
- review-needed candidates carry `requires_review: true`;
- update quality report validates;
- `UpdateToCurationHandoff` validates;
- no durable memory, source lifecycle, index projection, rollback, or deletion mutation occurs.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Update becomes automatic memory | Forbid `memory.write`, `memory.update_status`, and `curation.decide` |
| Update re-verifies evidence | Forbid `verification.check`, `source.read`, and broad evidence fetching |
| Noisy conversation becomes memory | Require selection reasons, concise statements, and reusable-signal checks |
| Unsupported claims become facts | Convert unsupported and uncertain refs into review/open-question candidates |
| Media interpretation is over-trusted | Defer media fact candidates until verified media evidence paths exist |
| Duplicate candidates pile up | Use optional bounded `record.search` and mark duplicates for review |
| Model output invents evidence | Require evidence refs from verification and schema validation after model assistance |
| Curation boundary blurs | Allow only `curation.propose`, never `curation.decide` |

## Decision

The `update` architecture is ready to hand off to `curation` design.

Next work should define:

- curation stage purpose and boundary;
- `CurationDecision` schema;
- update-to-curation handoff details;
- accept/edit/defer/reject/retract/supersede decisions;
- durable memory write rules;
- rollback, quarantine, deletion, and projection update boundaries after accepted decisions.
