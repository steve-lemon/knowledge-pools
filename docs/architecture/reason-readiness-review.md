# Reason Readiness Review

This document performs the final readiness review for the `reason` stage before moving into answer verification.

Use it with:

- [Reason Baseline](reason-baseline.md)
- [Retrieve to Reason Handoff](retrieve-reason-handoff.md)
- [Reason to Verify Handoff](reason-verify-handoff.md)
- [Media Reason Concept Proofs](media-reason-concept-proofs.md)
- [Reasoning Agent Spec](../agents/reasoning-agent.md)
- [Agent Tool Pool](agent-tool-pool.md)
- [Stage Data Flow Contract](stage-data-flow-contract.md)

## Readiness Summary

The `reason` stage is ready to move forward when it can consume a schema-valid `RetrieveToReasonHandoff`, load the referenced `EvidenceBundle`, and produce a cited draft artifact plus `ReasonToVerifyHandoff`.

Current status:

```text
ready_for_answer_verification_baseline: yes
implementation_ready: partial
```

The architecture is ready.

Runtime schemas, local fixtures, and tool implementations are still future implementation work.

## Purpose Check

Reason owns:

- loading and validating `RetrieveToReasonHandoff`;
- loading the referenced `EvidenceBundle`;
- reading bounded evidence artifacts by ref;
- synthesizing a `DraftAnswer` or `ProposedAction`;
- separating supported claims, assumptions, unknowns, missing evidence, and conflicts;
- preserving freshness and lifecycle warnings;
- citing evidence refs from the evidence bundle;
- handing draft output to `verify`.

Reason does not own:

- task understanding;
- retrieval planning;
- new broad retrieval;
- claim verification;
- durable memory update;
- lifecycle mutation;
- curation.

## Required Outputs

Reason must emit one of:

- `DraftAnswer`;
- `ProposedAction`;
- explicit `insufficient_evidence` result.

Reason must also emit:

- `DraftClaim[]`;
- `ClaimRef[]`;
- `AssumptionRef[]`;
- cited evidence refs;
- unresolved question refs when relevant;
- missing evidence notes;
- conflict notes;
- confidence notes;
- quality report;
- `ReasonToVerifyHandoff`;
- trace events.

The primary output is not verified truth.

It is a verification-ready draft.

## Tool Readiness

### Required Ports

| Port | Why it is needed | Boundary |
| --- | --- | --- |
| `artifact.read` | Read handoff, evidence bundle, bounded evidence artifacts, and context artifacts | Must read only refs allowed by the handoff and context |
| `schema.validate` | Validate handoff, evidence bundle, draft output, and handoff to verify | Read-only validation |
| `artifact.write` | Write draft answer, proposed action, quality report, and handoff artifacts | Run-local artifact write |
| `audit.trace` | Record reasoning decisions and tool calls | Trace only |

### Optional Ports

| Port | Why it may be useful | Boundary |
| --- | --- | --- |
| `source.read` | Read exact source units referenced by evidence items when bounded artifacts are unavailable | Must be bounded to evidence refs already in the bundle |
| `model.complete` | Assist synthesis into the requested answer shape | Output must be schema-validated |
| `reason.synthesize` | Encapsulate deterministic or model-assisted synthesis | Must produce draft artifacts only |
| `record.search` | Resolve cited durable record metadata already referenced by evidence | Must not become new retrieval |

### Forbidden Ports

| Port | Why forbidden |
| --- | --- |
| `retrieval.plan` | Planning belongs to `plan` |
| `index.search` | Search belongs to `plan` or `retrieve` |
| `retrieval.fetch_evidence` | Evidence gathering belongs to `retrieve` |
| `verification.check` | Claim audit belongs to `verify` |
| `candidate.emit` | Candidate creation belongs to understand, connect, or update |
| `memory.write` | Durable memory writes belong behind curation |
| `curation.decide` | Curation is a later stage |
| `source.write` | Source creation belongs to ingest |
| `source.tombstone` | Lifecycle mutation is out of scope |
| `delete.create_tombstone` | Deletion lifecycle is out of scope |

## Tool Sequence

Recommended v1 sequence:

```text
artifact.read RetrieveToReasonHandoff
  -> schema.validate handoff
  -> artifact.read EvidenceBundle
  -> schema.validate evidence bundle
  -> artifact.read bounded evidence artifacts
  -> optional source.read for bounded evidence refs only
  -> optional reason.synthesize or model.complete
  -> schema.validate DraftAnswer or ProposedAction
  -> artifact.write DraftAnswer or ProposedAction
  -> artifact.write quality report
  -> artifact.write ReasonToVerifyHandoff
  -> audit.trace
```

Reason should not call `index.search` or `retrieval.fetch_evidence` to improve an answer.

If evidence is insufficient, reason should emit `insufficient_evidence` or unresolved questions.

## Handoff Readiness

`ReasonToVerifyHandoff` is ready when it includes:

- `draft_answer_ref` or `proposed_action_ref`;
- `evidence_bundle_ref`;
- `claim_refs`;
- `assumption_refs`;
- `cited_evidence_refs`;
- `missing_evidence`;
- `conflict_refs`;
- `quality_report_refs`;
- `validation_status`;
- `trace_refs`.

Verify must be able to start from the handoff without guessing which evidence supports which claim.

## Media Readiness

Media reasoning is acceptable when:

- Markdown claims cite section, block, wiki-link, or record refs;
- image claims cite image regions, OCR spans, detected labels, or image-level units with provenance;
- audio claims cite transcript spans, time ranges, acoustic tags, or human annotations;
- video claims cite subtitle spans, scene segments, frame ranges, OCR spans, or keyframes;
- PDF claims cite pages, blocks, spans, tables, figures, or OCR-derived text with provenance;
- preview refs are used only as inspection aids unless selected as derived evidence.

## Validation Checklist

Before handoff to `verify`:

- `RetrieveToReasonHandoff` validates;
- `EvidenceBundle` resolves and validates;
- draft output schema validates;
- every factual claim has a `ClaimRef`;
- every factual claim cites evidence or is marked as assumption;
- every cited evidence ref exists in the evidence bundle;
- assumptions are separated from supported claims;
- missing evidence is surfaced when it limits the answer;
- conflict refs are represented or explicitly marked irrelevant;
- freshness and lifecycle warnings are preserved;
- model-assisted output is schema-validated;
- `ReasonToVerifyHandoff` validates;
- reason emits no verification report;
- reason performs no new broad retrieval;
- reason writes no durable memory or lifecycle mutation.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Reason invents evidence | Require cited evidence refs from the evidence bundle |
| Reason hides assumptions | Require `AssumptionRef[]` and assumption labeling |
| Reason certifies itself | Forbid `verification.check`; output remains draft |
| Reason silently ignores missing evidence | Require missing evidence notes or `insufficient_evidence` |
| Reason hides contradictions | Require conflict notes or explicit irrelevance rationale |
| Reason expands retrieval scope | Forbid `index.search` and `retrieval.fetch_evidence` |
| Model output becomes hidden state | Require schema validation and trace refs |
| Draft answer becomes durable memory | Forbid `memory.write` and `curation.decide` |

## Decision

The `reason` architecture is ready to hand off to answer verification design.

Next work should define:

- answer verification purpose and boundary;
- `VerificationReport` shape for `DraftAnswer` and `ProposedAction`;
- claim support checking rules;
- stale, missing, and contradictory evidence handling;
- verifier tool access and validation rules.
