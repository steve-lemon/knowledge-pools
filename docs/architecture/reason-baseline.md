# Reason Baseline

This document defines the v1 baseline for the `reason` stage.

`reason` consumes retrieved evidence and produces a draft answer or proposed action.

It does not retrieve evidence.

It does not verify claims.

It does not write durable memory.

It does not decide curation.

## Role

The role of `reason` is to synthesize from an `EvidenceBundle` without losing citation discipline.

It is the draft synthesis stage of the runtime loop.

It answers this question:

```text
Given this evidence bundle, what can the system responsibly say or propose?
```

It sits between retrieval and verification:

```text
RetrieveToReasonHandoff
  -> reason
  -> DraftAnswer or ProposedAction
  -> ReasonToVerifyHandoff
```

Reason should:

- load and validate `RetrieveToReasonHandoff`;
- load the referenced `EvidenceBundle`;
- distinguish supported claims, assumptions, unknowns, and conflicts;
- produce a draft answer or proposed action aligned to the requested answer shape;
- cite evidence refs from the evidence bundle;
- surface missing evidence instead of inventing facts;
- preserve conflict and freshness warnings;
- limit the response to what the evidence can support;
- hand the draft to `verify`.

## Primary Purpose

The primary purpose of `reason` is to turn evidence into a useful but still unverified response artifact.

The stage exists because evidence does not explain itself.

Retrieve can gather source-grounded evidence, but the user usually needs synthesis: an explanation, comparison, recommendation, next action, or honest statement that the evidence is insufficient.

Reason must do that synthesis while keeping the evidence path visible.

The key shift is:

```text
evidence bundle -> cited draft answer or proposed action
```

Reason is not final truth.

It is structured synthesis that remains open to verification.

In practical terms, `reason` should make these things explicit:

- which statements are supported by cited evidence;
- which statements are assumptions;
- which questions remain unresolved;
- which conflicts or missing evidence limit the answer;
- whether the answer uses current, historical, stale, or superseded evidence;
- why the output is a draft that still needs verification.

## Non-Goals

Reason must not:

- reinterpret the raw user request independently of the plan and handoff;
- rerun broad retrieval;
- silently ignore missing evidence;
- silently collapse conflicting evidence into one answer;
- verify its own claims as final;
- create knowledge candidates for durable memory;
- write durable memory;
- decide curation.

## Expected Results

Reason should produce one of:

- `DraftAnswer`;
- `ProposedAction`;
- explicit `insufficient_evidence` result.

It should also produce:

- cited claim refs;
- assumption refs;
- unresolved question refs;
- conflict notes;
- confidence notes;
- quality report;
- `ReasonToVerifyHandoff`;
- trace events.

The most important result is that `verify` can audit the draft without guessing which evidence supports which claim.

The expected result is not durable knowledge.

The expected result is a usable draft with enough structure for verification, revision, and later update-candidate generation.

## Expected Effects

| Effect | Why it matters |
| --- | --- |
| Better answer discipline | Claims must cite evidence or be labeled as assumptions |
| Better uncertainty handling | Missing evidence and unknowns are visible instead of hidden |
| Better conflict handling | Contradictory evidence is surfaced before verification |
| Better freshness handling | Current, historical, stale, or superseded evidence is not mixed silently |
| Better verification | Verifier receives claim refs, assumption refs, and cited evidence refs |
| Better update hygiene | Draft outputs can later become update signals without writing memory directly |

## Success Criteria

The `reason` stage is successful when:

- `RetrieveToReasonHandoff` validates;
- `EvidenceBundle` resolves and validates;
- every factual claim has cited evidence or is marked as assumption;
- every cited evidence ref exists in the evidence bundle;
- missing evidence is surfaced when it limits the answer;
- conflict refs are represented in the draft or explicitly marked irrelevant;
- freshness and lifecycle warnings are preserved;
- output follows the requested answer shape where possible;
- `DraftAnswer`, `ProposedAction`, or `insufficient_evidence` schema validates;
- `ReasonToVerifyHandoff` can be consumed by the Verifier Agent;
- no new broad retrieval, verification report, durable memory write, or curation decision is produced.

## Expected Quality Bar

A good reason result should be:

- evidence-bound: every factual claim cites evidence or is marked as assumption;
- conflict-aware: conflicting evidence is surfaced, not hidden;
- freshness-aware: stale, historical, superseded, or current evidence is labeled;
- scope-aware: it answers only within the task and evidence limits;
- uncertainty-aware: unknowns and insufficient evidence are explicit;
- verification-ready: claim refs and evidence refs are structured for `verify`.

## Stage Boundary

```text
retrieve = gather and package evidence
reason = synthesize from evidence
verify = audit the synthesized output
```

Reason may read evidence artifacts and source units referenced by the evidence bundle.

It must not fetch new evidence outside the handoff without an explicit bounded evidence ref.

## Inputs

Required inputs:

- `RetrieveToReasonHandoff`;
- evidence bundle ref;
- evidence refs;
- missing evidence notes;
- conflict refs;
- answer shape or task output expectation when available;
- schema refs.

Optional inputs:

- retrieval plan ref;
- freshness scope;
- required evidence types;
- quality report refs;
- context refs;
- prior draft refs for revision workflows.

## Outputs

The primary output is a `DraftAnswer` or `ProposedAction`.

Recommended `DraftAnswer` shape:

```json
{
  "draft_answer_id": "da_2026_06_19_001",
  "artifact_type": "draft_answer",
  "schema_version": "0.1.0",
  "run_id": "run_001",
  "evidence_bundle_ref": "artifact://runs/run_001/retrieve/evidence-bundle.json",
  "answer_shape": "short_explanation",
  "status": "draft",
  "claims": [
    {
      "claim_ref": "claim://runs/run_001/reason/claim_001",
      "text": "Retrieve packages selected search candidates into bounded evidence items.",
      "supporting_evidence_refs": [
        "src_md_001#section_001"
      ],
      "support_status": "supported"
    }
  ],
  "assumptions": [],
  "unresolved_questions": [],
  "conflict_notes": [],
  "confidence": {
    "level": "medium",
    "rationale_ref": "artifact://runs/run_001/reason/confidence-note.md"
  },
  "created_at": "2026-06-19T00:00:00Z"
}
```

Long prose, chain-of-thought-like rationale, and model scratchpad output should not be stored as the primary schema.

When needed, concise rationale notes should live behind artifact refs.

## Reasoning Modes

Recommended v1 modes:

| Mode | Use when |
| --- | --- |
| `answer_question` | Produce a cited answer from evidence |
| `summarize_evidence` | Summarize what the evidence says and does not say |
| `compare_evidence` | Compare conflicting or alternative evidence refs |
| `explain_decision` | Explain a decision using cited source or record refs |
| `propose_action` | Produce a bounded proposed action from evidence |
| `insufficient_evidence` | Return a non-answer when evidence is missing or too weak |

## V1 Workflow

Recommended workflow:

```text
load RetrieveToReasonHandoff
  -> validate handoff schema
  -> load EvidenceBundle
  -> validate evidence bundle schema
  -> load bounded evidence artifacts by ref
  -> map evidence items to answer shape
  -> draft supported claims
  -> mark assumptions and unknowns
  -> preserve missing evidence and conflicts
  -> write DraftAnswer or ProposedAction
  -> create ReasonToVerifyHandoff
  -> emit trace
```

## Tool Access

Required ports:

- `artifact.read`;
- `schema.validate`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `source.read`;
- `model.complete`;
- `reason.synthesize`;
- `record.search`.

Forbidden ports:

- `retrieval.plan`;
- `index.search`;
- `retrieval.fetch_evidence`;
- `verification.check`;
- `candidate.emit`;
- `memory.write`;
- `curation.decide`;
- `source.write`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Validation Rules

A reason output is valid only if:

- `RetrieveToReasonHandoff` validates;
- evidence bundle ref resolves;
- every cited evidence ref exists in the evidence bundle;
- every factual claim cites evidence or is marked as assumption;
- missing evidence is surfaced when relevant;
- conflict refs are not silently ignored;
- freshness and lifecycle warnings are preserved;
- output schema validates;
- no verification report is emitted by reason;
- no durable memory mutation occurs.

## Minimal V1 Rule

For v1:

- consume `RetrieveToReasonHandoff`;
- load `EvidenceBundle`;
- produce `DraftAnswer`;
- cite evidence refs from the bundle;
- mark assumptions and insufficient evidence explicitly;
- emit `ReasonToVerifyHandoff`;
- do not retrieve new evidence;
- do not verify or update memory.

## Design Rule

Retrieve gathers evidence.

Reason synthesizes from evidence.

Verify audits the synthesis.
