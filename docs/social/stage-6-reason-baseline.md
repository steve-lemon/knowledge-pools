# Stage 6: Reason Architecture Baseline

This is the seventh public-facing narrative for Knowledge Pools.

Use this document after the `reason` architecture has been clarified but before claiming that answer verification, update, or curation are complete.

## Core Thesis

Reason is not verification.

For an agent-oriented knowledge repository, reason is the stage where an evidence bundle becomes a useful, cited, verification-ready draft.

The system should not treat a fluent answer as final truth.

It should first separate:

- supported claims;
- assumptions;
- unknowns;
- missing evidence;
- conflicts;
- freshness and lifecycle warnings;
- cited evidence refs.

## What Changed

The project now has a clearer reason baseline:

- `reason` consumes `RetrieveToReasonHandoff`;
- `DraftAnswer` and `ProposedAction` are the primary artifacts;
- `ReasonToVerifyHandoff` defines the contract for `verify`;
- `DraftClaim`, `ClaimRef`, `AssumptionRef`, and `CitedEvidenceRef` are canonical terms;
- media-specific reason concept proofs are documented for Markdown, image, WAV/audio, MP4/video, and PDF;
- reason tool access is reviewed through the reason readiness checklist;
- `retrieval.plan`, `index.search`, `retrieval.fetch_evidence`, `verification.check`, `candidate.emit`, `memory.write`, and curation tools are forbidden for the reasoner.

The important boundary is:

```text
retrieve = gather and package evidence
reason = synthesize from evidence
verify = audit the synthesized output
```

## Why This Matters

Basic RAG often jumps from retrieved chunks to a polished answer.

That is risky because fluency can hide:

- unsupported claims;
- missing evidence;
- stale evidence;
- conflicting sources;
- assumptions presented as facts;
- media interpretation uncertainty.

`reason` gives the system a place to synthesize while keeping the draft auditable.

The output is useful, but not certified.

## Design Moves

### 1. Drafts Are Not Verified Truth

Reason can produce a helpful answer or proposed action.

But that output remains a draft until `verify` checks it.

### 2. Claims Need Evidence Or Labels

Every factual claim should either:

- cite evidence from the `EvidenceBundle`; or
- be marked as an assumption.

Unknowns and missing evidence should stay visible.

### 3. Media Reasoning Needs Caution

Different media require different reasoning posture.

Examples:

- Markdown: cite section or block refs;
- image: cite region or OCR refs and preserve detection uncertainty;
- WAV/audio: cite transcript spans, time ranges, or annotations;
- MP4/video: cite scene, subtitle, frame range, or OCR refs;
- PDF: cite page, block, table, figure, or OCR-derived text refs.

### 4. Contradictions Should Survive Synthesis

Reason should not smooth conflicting evidence into one confident answer.

It should surface conflict notes so verification can audit them.

### 5. Tool Permissions Matter

Required reasoner ports:

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
- source write, tombstone, and deletion lifecycle tools.

## First Public Message

The seventh share should not claim that answer verification is complete.

It should say:

> I finished the reason architecture baseline. The important lesson is that reasoning should produce cited drafts, not self-certified truth.

## Suggested Korean Summary

```text
Knowledge Pools의 reason 단계 설계를 정리했습니다.

이번 단계의 핵심 결론은 이것입니다.

reason은 verification이 아닙니다.
그리고 durable memory update도 아닙니다.

retrieve가 EvidenceBundle을 만들었다면,
reason은 그 evidence를 바탕으로 DraftAnswer 또는 ProposedAction을 만듭니다.

하지만 이 결과는 아직 final truth가 아닙니다.
verify가 감사할 수 있는 cited draft입니다.

즉 흐름은 이렇게 됩니다.

RetrieveToReasonHandoff
-> Reasoning Agent
-> DraftAnswer / ProposedAction
-> ReasonToVerifyHandoff

중요한 점은 모든 factual claim이 evidence ref를 가져야 한다는 것입니다.
그렇지 않다면 assumption으로 표시해야 합니다.

reason 단계는 다음을 분리해야 합니다.

- supported claim
- assumption
- unknown
- missing evidence
- conflict
- freshness/lifecycle warning

미디어별로도 조심해야 합니다.

- Markdown은 section/block ref
- image는 region/OCR ref
- audio는 transcript span/time range
- video는 scene/frame/subtitle ref
- PDF는 page/block/table/figure ref

좋은 RAG/agent memory는 fluent answer를 곧바로 믿지 않고,
먼저 검증 가능한 cited draft로 만든 뒤 verify로 넘겨야 한다고 봅니다.
```

## Suggested Short Korean Post

```text
Knowledge Pools의 reason 단계 설계를 정리했습니다.

이번 결론:

reason은 verification이 아닙니다.
답변이 유창하다고 해서 truth가 되는 것도 아닙니다.

reason은 EvidenceBundle을 바탕으로
DraftAnswer 또는 ProposedAction을 만드는 단계입니다.

모든 factual claim은 evidence ref를 가져야 하고,
근거가 부족하면 assumption 또는 unknown으로 표시해야 합니다.

retrieve
-> evidence bundle
-> reason
-> cited draft
-> verify

즉 reason의 출력은 최종 답이 아니라
verify가 감사할 수 있는 draft입니다.

좋은 agent memory는 "그럴듯한 답변"보다
"검증 가능한 초안"을 먼저 만들어야 한다고 봅니다.
```

## Suggested English Post

```text
I finished the reason architecture baseline for Knowledge Pools.

The main lesson:

reason is not verification.
It is not durable memory update either.

Reason consumes an EvidenceBundle and produces a DraftAnswer or ProposedAction.

But the output is not final truth.
It is a cited, verification-ready draft.

The flow is:

RetrieveToReasonHandoff
-> Reasoning Agent
-> DraftAnswer / ProposedAction
-> ReasonToVerifyHandoff

Every factual claim should either cite evidence from the bundle or be labeled as an assumption.

Missing evidence should become an explicit unknown.
Conflicts should survive synthesis.
Freshness and lifecycle warnings should remain visible.

The goal is not a fluent answer.
The goal is a draft that verification can audit claim by claim.
```

## Suggested Thread Outline

```text
1. I finished the reason architecture baseline for Knowledge Pools.

2. The key distinction:
   reason is not verification.
   It produces cited drafts, not certified truth.

3. Reason consumes EvidenceBundle and emits DraftAnswer or ProposedAction.

4. Every factual claim must cite evidence or be labeled as an assumption.

5. Missing evidence should stay visible.
   Conflicts should not be smoothed away.

6. Media reasoning needs care:
   image regions, transcript spans, video frame ranges, PDF blocks, and Markdown sections all ground claims differently.

7. Next step:
   verify should audit each claim against cited evidence.
```

## Repository References

- `docs/architecture/reason-baseline.md`
- `docs/architecture/reason-verify-handoff.md`
- `docs/architecture/media-reason-concept-proofs.md`
- `docs/architecture/reason-readiness-review.md`
- `docs/agents/reasoning-agent.md`
- `docs/architecture/terminology.md`
