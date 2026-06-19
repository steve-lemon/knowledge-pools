# Verify Readiness Review

This document performs the final readiness review for the `verify` stage before moving into `update`.

Use it with:

- [Verify Baseline](verify-baseline.md)
- [Connect to Verify Handoff](connect-verify-handoff.md)
- [Reason to Verify Handoff](reason-verify-handoff.md)
- [Media Verify Concept Proofs](media-verify-concept-proofs.md)
- [Verifier Agent Spec](../agents/verifier-agent.md)
- [Agent Tool Pool](agent-tool-pool.md)
- [Stage Data Flow Contract](stage-data-flow-contract.md)
- [Markdown-First Implementation Strategy](../operations/markdown-first-implementation.md)

## Readiness Summary

The `verify` stage is ready to move forward when it can consume a schema-valid `ConnectToVerifyHandoff` or `ReasonToVerifyHandoff`, resolve targets and cited evidence, and produce `VerificationResult[]` plus `VerificationReport`.

Current status:

```text
ready_for_update_baseline: yes
implementation_ready: partial
```

The architecture is ready.

Runtime schemas, local fixtures, and tool implementations are still future implementation work.

## Purpose Check

Verify owns:

- loading and validating incoming handoffs;
- resolving verification targets;
- resolving cited evidence refs;
- checking evidence support;
- checking stale, missing, contradictory, uncertain, and review-needed conditions;
- preserving assumptions as assumptions;
- emitting `VerificationResult` artifacts;
- emitting `VerificationReport`;
- handing audit outcomes to `update` or later curation workflows.

Verify does not own:

- creating relationship proposals;
- rewriting draft answers;
- retrieving new broad evidence;
- accepting graph edges;
- writing durable memory;
- deciding curation;
- source lifecycle mutation.

## Required Outputs

Verify must emit:

- `VerificationReport`;
- `VerificationResult[]`;
- verified refs;
- rejected refs;
- unsupported refs;
- uncertain refs;
- stale evidence refs;
- missing evidence refs;
- contradiction refs;
- review refs when needed;
- quality report;
- trace events.

The primary output is not durable knowledge.

It is an audit package for update, curation, debugging, and user-facing trust decisions.

## Tool Readiness

### Required Ports

| Port | Why it is needed | Boundary |
| --- | --- | --- |
| `artifact.read` | Read handoff, target artifacts, evidence bundle, and candidate/proposal artifacts | Must read only refs allowed by handoff and context |
| `schema.validate` | Validate handoff, target, result, report, and quality artifacts | Read-only validation |
| `taxonomy.read` | Load relation rules and controlled verification vocabularies | Required for relationship verification |
| `taxonomy.validate` | Validate relation types and taxonomy-scoped refs | Required for relationship verification |
| `verification.check` | Run deterministic support, freshness, conflict, and policy checks | Audit-only checks |
| `artifact.write` | Write verification result, report, review, and quality artifacts | Run-local artifact write |
| `audit.trace` | Record verification decisions and tool calls | Trace only |

### Optional Ports

| Port | Why it may be useful | Boundary |
| --- | --- | --- |
| `record.search` | Resolve durable record metadata already referenced by target or evidence | Must not become exploratory retrieval |
| `graph.query` | Inspect graph context for relationship verification or known contradictions | Read-only |
| `source.locate` | Resolve source/access-unit refs when evidence metadata is insufficient | Bounded to cited refs |
| `source.read` | Read exact source units when cited evidence artifacts are unavailable | Bounded to cited evidence refs only |
| `retrieval.fetch_evidence` | Fetch cited evidence units when missing from bundle artifacts | Bounded to cited refs only |
| `review.request` | Create human review requests for risky or uncertain results | Propose/review only |
| `model.complete` | Assist judgment on ambiguous support | Output must be schema-validated and cannot override missing evidence |

### Forbidden Ports

| Port | Why forbidden |
| --- | --- |
| `memory.write` | Durable memory writes belong behind curation |
| `memory.update_status` | Durable lifecycle mutation is out of scope |
| `curation.decide` | Curation is a later stage |
| `source.write` | Source creation belongs to ingest |
| `source.version` | Source version creation belongs to ingest |
| `source.tombstone` | Lifecycle mutation is out of scope |
| `source.restore` | Lifecycle mutation is out of scope |
| `index.deactivate_projection` | Projection mutation is out of scope |
| `rollback.create_event` | Rollback is a later governance workflow |
| `delete.create_tombstone` | Deletion lifecycle is out of scope |

## Tool Sequence

Recommended relationship verification sequence:

```text
artifact.read ConnectToVerifyHandoff
  -> schema.validate handoff
  -> artifact.read ConnectionArtifact
  -> artifact.read RelationshipProposal[]
  -> taxonomy.read
  -> taxonomy.validate relation types
  -> resolve endpoint refs
  -> resolve evidence refs
  -> verification.check support/freshness/conflict
  -> artifact.write VerificationResult[]
  -> artifact.write VerificationReport
  -> audit.trace
```

Recommended Markdown-first answer verification sequence:

```text
artifact.read ReasonToVerifyHandoff
  -> schema.validate handoff
  -> artifact.read DraftAnswer or ProposedAction
  -> artifact.read EvidenceBundle
  -> resolve claim refs
  -> resolve assumption refs
  -> resolve cited Markdown section/block refs
  -> verification.check claim-to-evidence support
  -> artifact.write VerificationResult[]
  -> artifact.write VerificationReport
  -> audit.trace
```

Verify should not search for better evidence to rescue a weak answer.

If cited evidence is missing or insufficient, verify should mark the result `unsupported`, `uncertain`, `stale`, or `needs_review`.

## Handoff Readiness

`ConnectToVerifyHandoff` is ready when it includes:

- connection artifact ref;
- relationship proposal refs;
- endpoint refs;
- evidence refs;
- taxonomy refs;
- quality report refs;
- validation status;
- trace refs.

`ReasonToVerifyHandoff` is ready when it includes:

- draft answer or proposed action ref;
- evidence bundle ref;
- claim refs;
- assumption refs;
- cited evidence refs;
- missing evidence notes;
- conflict refs;
- quality report refs;
- validation status;
- trace refs.

## Media Readiness

Markdown-first verification is acceptable when:

- every draft claim cites a Markdown section or block ref;
- every cited ref resolves in the evidence bundle;
- assumptions remain assumptions;
- unsupported or over-broad claims are flagged.

Future media verification is acceptable only after Markdown/text verification is stable:

- image claims must cite image regions, OCR spans, labels, or image-level units with confidence;
- audio claims must cite transcript spans, time ranges, acoustic tags, or annotations;
- video claims must cite scene segments, subtitle spans, frame ranges, OCR spans, or keyframes;
- PDF claims must cite pages, blocks, spans, tables, figures, or OCR-derived text;
- preview refs remain inspection aids unless selected as derived evidence.

## Validation Checklist

Before handoff to `update`:

- incoming handoff validates;
- target artifacts resolve;
- every target has a `VerificationResult`;
- every evidence ref resolves or is listed as missing;
- every relationship relation type validates against taxonomy;
- every draft claim is checked against cited evidence or marked assumption;
- assumptions are not promoted to verified facts;
- stale and lifecycle-restricted evidence is marked;
- unsupported, uncertain, contradictory, and review-needed results are explicit;
- verification report schema validates;
- no draft answer is rewritten by verify;
- no durable memory, graph edge, source lifecycle, rollback, or deletion mutation occurs.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Verify becomes curation | Forbid `curation.decide`, `memory.write`, and lifecycle mutation |
| Verify rewrites the answer | Output only audit artifacts, not revised drafts |
| Verify rescues weak claims by searching | Bound optional source/evidence reads to cited refs only |
| Assumptions become facts | Preserve `AssumptionRef[]` and never mark assumptions as supported claims |
| Missing evidence is hidden | Require missing evidence refs and explicit unsupported/uncertain status |
| Media confidence is ignored | Use `uncertain` or `needs_review` for low-confidence OCR/transcript/scene evidence |
| Model judgment overrides refs | Require evidence resolution and schema validation before model-assisted checks |

## Decision

The `verify` architecture is ready to hand off to `update` design.

Next work should define:

- update stage purpose and boundary;
- `UpdateCandidate` schema;
- verify-to-update handoff;
- rules for turning verified outcomes into update candidates without durable memory writes;
- update tool access and validation rules.
