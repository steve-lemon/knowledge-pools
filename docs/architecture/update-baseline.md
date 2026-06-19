# Update Baseline

This document defines the `update` stage for Knowledge Pools.

The canonical stage flow is:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

## Purpose

`update` converts useful verified runtime outcomes into structured update candidates.

It is the first place where the system asks:

> Should this run teach the knowledge base something reusable?

The answer is never written directly to durable memory in this stage.

Instead, `update` produces `UpdateCandidate` artifacts for `curation`.

More precisely, `update` is the learning proposal stage.

It turns verified work into reviewable candidate changes while preserving enough provenance for later curation, rollback, and evaluation.

## Primary Goal

The primary goal is to prevent useful learning from disappearing without allowing unreviewed memory growth.

The stage should answer four questions:

1. What did this run reveal that may be reusable?
2. Is the reusable item supported, corrected, uncertain, stale, or contradictory?
3. What evidence, verification result, source, or interaction supports that signal?
4. What candidate should curation inspect next?

## Operating Principle

`update` is selective.

It should create fewer, better candidates rather than preserve every conversation turn.

The stage favors:

- concise statements over transcripts;
- refs over copied source content;
- typed candidate records over freeform notes;
- explicit review requirements over silent promotion;
- reversible proposals over direct mutation.

## Role In The Loop

`verify` decides whether a claim, answer, relationship proposal, or proposed action is supported, unsupported, uncertain, stale, or contradictory.

`update` decides whether that verified outcome should become a candidate memory change.

`curation` later decides whether the candidate becomes durable knowledge.

This makes `update` the bridge between runtime quality control and durable knowledge governance.

```text
VerificationReport
  -> update signal selection
  -> UpdateCandidate
  -> UpdateToCurationHandoff
  -> CurationDecision
```

## Expected Effects

The update stage should:

- preserve useful learning from verified interactions;
- convert user corrections into reviewable candidate changes;
- capture reusable decisions, procedures, constraints, and failed approaches;
- turn unsupported results into open questions or review requests;
- surface stale or contradictory knowledge before it becomes hidden debt;
- keep unsupported or uncertain outcomes out of durable memory;
- retain source, evidence, run, and verification refs;
- prevent noisy automatic memory writes;
- make future curation faster by proposing typed changes;
- keep the system LLM-independent by relying on typed artifacts rather than hidden chat state.

## Expected Results

After a successful update run, the system should have:

- a validated update artifact for the run;
- zero or more `UpdateCandidate` artifacts;
- a clear reason for every emitted candidate;
- preserved refs to verification, evidence, source, run, and feedback artifacts;
- review requests for candidates that are uncertain, corrective, stale, contradictory, or policy-sensitive;
- an `UpdateToCurationHandoff` even when no candidate is emitted;
- a quality report explaining selected, skipped, and rejected update signals;
- trace events for candidate selection and candidate rejection decisions.

The expected result can be empty.

If a run produced no durable learning signal, `update` should emit a quality report and handoff that say so.

An empty update is better than noisy memory.

## Inputs

Primary input:

- `VerifyToUpdateHandoff`

Required referenced artifacts:

- `VerificationReport`;
- verified claim refs;
- rejected claim refs;
- unsupported refs;
- uncertain refs;
- review refs;
- update signal refs.

Optional context:

- draft answer or proposed action refs;
- evidence bundle refs;
- source refs;
- prior record refs;
- relationship proposal refs;
- user correction refs;
- run trace refs;
- taxonomy bundle id and version.

## Outputs

Primary output:

- `UpdateCandidate`

Supporting outputs:

- update quality report;
- review request refs;
- relationship proposal refs for candidate-to-record links;
- `UpdateToCurationHandoff`;
- trace events.

## What Becomes An Update Candidate

An update candidate may represent:

- a verified reusable claim;
- a user correction that has evidence or needs review;
- a project decision made during a run;
- a reusable procedure discovered during work;
- a failed approach that should be remembered;
- an open question created by unsupported evidence;
- a stale-knowledge warning;
- a contradiction that needs curation;
- a relationship proposal derived from verified runtime evidence.

## What Must Not Become An Update Candidate

Do not create candidates from:

- unsupported generated claims;
- assumptions that have no evidence;
- transient conversation style or phrasing;
- raw full transcripts by default;
- raw source content;
- private hidden model state;
- retrieval hits that were never used or verified;
- media-derived interpretations before that media type has a verified path.

## Boundary With Verify

`verify` audits truth, grounding, freshness, and conflict handling.

`update` does not re-verify claims.

It consumes verification results and selects which results should become candidate memory changes.

If update finds missing evidence, it marks the candidate `needs_more_evidence` or requests review instead of silently accepting it.

## Boundary With Curation

`update` proposes.

`curation` decides.

The update stage must not:

- write durable memory;
- accept candidates;
- supersede records;
- retract records;
- tombstone sources;
- modify OpenSearch projections as accepted knowledge.

## Candidate Status

Initial statuses:

```text
proposed
needs_more_evidence
needs_review
deferred
rejected_by_policy
```

`verified`, `accepted`, and `indexed` are not update-stage outcomes.

They belong to verification, curation, and projection workflows respectively.

## Candidate Types

Recommended v1 candidate types:

| Candidate type | Meaning |
| --- | --- |
| `verified_claim` | A reusable claim supported by verified evidence |
| `corrected_claim` | A user or verifier correction that should be reviewed |
| `decision` | A decision made during work |
| `procedure` | A reusable method or workflow |
| `failed_approach` | A tested path that should not be repeated blindly |
| `open_question` | A useful unknown created by missing or uncertain evidence |
| `stale_warning` | A signal that existing knowledge may be outdated |
| `contradiction` | A candidate conflict to resolve in curation |
| `relationship_update` | A candidate relation change derived from verified evidence |

## Minimal Shape

```json
{
  "candidate_id": "upd_20260619_001",
  "candidate_type": "verified_claim",
  "status": "proposed",
  "proposed_record_kind": "claim",
  "statement": "OpenSearch projections are retrieval maps, not source truth.",
  "source_refs": ["src_md_001"],
  "evidence_refs": ["src_md_001#section_003"],
  "verification_report_ref": "artifact_verify_001",
  "verified_claim_refs": ["claim_run_001"],
  "related_record_refs": [],
  "relationship_proposals": [],
  "confidence": 0.9,
  "requires_review": false,
  "created_from_run_id": "run_2026_06_19_001",
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0"
}
```

## Markdown-First V1 Scope

V1 should support update candidates only from Markdown/text evidence paths.

Allowed v1 sources:

- verified Markdown answer claims;
- verified Markdown relationship proposals;
- explicit user corrections captured as run artifacts;
- verifier failures that create open questions or stale warnings.

Deferred:

- image-derived memory updates;
- audio transcript-derived memory updates;
- video scene-derived memory updates;
- PDF-derived memory updates unless the PDF has been converted into verified text access units.

Media-specific update behavior is validated in [Media Update Concept Proofs](media-update-concept-proofs.md).

Final readiness and tool permission review are defined in [Update Readiness Review](update-readiness-review.md).

## Tool Contract

Required ports:

- `artifact.read`;
- `schema.validate`;
- `candidate.emit`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `review.request`;
- `curation.propose`;
- `record.search`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `model.complete`.

Forbidden ports:

- `memory.write`;
- `memory.update_status`;
- `curation.decide`;
- `source.write`;
- `source.version`;
- `source.locate`;
- `source.read`;
- `source.restore`;
- `index.write_projection`;
- `index.deactivate_projection`;
- `index.search`;
- `retrieval.fetch_evidence`;
- `verification.check`;
- `source.tombstone`;
- `delete.create_tombstone`;
- `rollback.create_event`.

## Validation Rules

Every update candidate must:

- reference a verification report or explicit feedback source;
- include at least one source, evidence, run, or review ref;
- declare candidate type and proposed record kind;
- preserve provenance from verification to candidate;
- mark unsupported and uncertain outcomes as review or open-question candidates, not facts;
- avoid full raw content in candidate payloads;
- validate against the taxonomy version when taxonomy terms are used;
- declare whether human review is required.

## Quality Report

The update stage should emit a quality report with:

- number of verification results inspected;
- number of update signals selected;
- number of candidates emitted;
- number of candidates requiring review;
- number of candidates rejected by policy;
- number of unresolved evidence refs;
- number of duplicate or near-duplicate candidate warnings;
- schema validation status.

## Failure Classes

- invalid `VerifyToUpdateHandoff`;
- missing verification report;
- unresolved evidence ref;
- unsupported claim promoted as fact;
- candidate schema failure;
- taxonomy validation failure;
- forbidden durable mutation attempt;
- duplicate candidate requiring review.

## Acceptance Criteria

V1 is ready when:

- `VerifyToUpdateHandoff` validates;
- Markdown/text verified claims can produce `UpdateCandidate` artifacts;
- unsupported claims become open questions or review requests, not facts;
- candidates preserve evidence and verification refs;
- update emits `UpdateToCurationHandoff`;
- no durable memory write occurs;
- all tool calls are traced.

## Design Rule

Update is not memory.

Update is the proposal layer between verified learning and curated durable knowledge.
