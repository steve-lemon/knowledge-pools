# Stage 7: Verify Architecture Baseline

This is the eighth public-facing narrative for Knowledge Pools.

Use this document after the `verify` architecture has been clarified but before claiming that update, curation, or durable memory are complete.

## Core Thesis

Verify is not curation.

For an agent-oriented knowledge repository, verify is the stage where relationship proposals and draft answers become explicit audit results.

The system should not trust a proposal or a fluent answer just because it exists.

It should first check:

- whether the target resolves;
- whether cited evidence resolves;
- whether the evidence actually supports the claim;
- whether assumptions are still assumptions;
- whether evidence is stale, missing, contradictory, or uncertain;
- whether human review is needed.

## What Changed

The project now has a clearer verify baseline:

- `verify` supports `verify_relationships` and `verify_answer`;
- `VerificationReport` and `VerificationResult` are the primary artifacts;
- Markdown-first answer verification is the first implementation target;
- media-specific verify concept proofs are documented for Markdown, image, WAV/audio, MP4/video, and PDF;
- `VerificationTarget`, `VerificationStatus`, `SupportCheck`, and `EvidenceResolutionCheck` are canonical terms;
- verify tool access is reviewed through the verify readiness checklist;
- memory writes, curation decisions, source lifecycle mutation, rollback, and deletion tools are forbidden.

The important boundary is:

```text
connect = propose relationships
reason = synthesize cited drafts
verify = audit support, freshness, conflict, and uncertainty
update = propose reusable changes
curation = decide what becomes durable
```

## Why This Matters

Basic RAG often treats a generated answer as the final product.

But for long-running knowledge work, the important question is:

```text
Which exact claims are supported by which exact evidence?
```

Verification makes the trust boundary explicit.

It can say:

- this claim is supported;
- this claim is unsupported;
- this evidence is stale;
- this assumption is not a fact;
- this source is missing;
- this conflict needs review.

The result is not memory.

It is an audit package that update and curation can use later.

## Design Moves

### 1. Verification Produces Audit Artifacts

Verify emits:

- `VerificationResult`;
- `VerificationReport`;
- missing evidence refs;
- stale evidence refs;
- contradiction refs;
- review refs.

It does not rewrite the answer.

It does not accept graph edges.

It does not write durable memory.

### 2. Assumptions Stay Assumptions

If `reason` labels something as an assumption, `verify` should not silently promote it to a supported fact.

This matters because fluent answers often blur that line.

### 3. Markdown-First Verification Comes First

The first implementation target is Markdown/text:

```text
DraftClaim
-> cited Markdown section/block
-> VerificationResult
```

Only after this works should image, PDF, audio, and video verification expand.

### 4. Media Verification Needs Different Checks

Examples:

- Markdown: section/block support check;
- image: region/OCR/label confidence check;
- WAV/audio: transcript span and timestamp check;
- MP4/video: scene/frame/subtitle/OCR check;
- PDF: page/block/table/figure/OCR check.

### 5. Tool Permissions Matter

Required verifier ports:

- `artifact.read`;
- `schema.validate`;
- `taxonomy.read`;
- `taxonomy.validate`;
- `verification.check`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `record.search`;
- `graph.query`;
- `source.locate`;
- `source.read`;
- `retrieval.fetch_evidence`;
- `review.request`;
- `model.complete`.

Optional evidence tools must be bounded to cited refs.

Forbidden ports:

- `memory.write`;
- `memory.update_status`;
- `curation.decide`;
- source write/version/tombstone/restore;
- index deactivation;
- rollback and deletion lifecycle tools.

## First Public Message

The eighth share should not claim that memory update or curation is complete.

It should say:

> I finished the verify architecture baseline. The important lesson is that verification should produce audit results, not durable memory.

## Suggested Korean Summary

```text
Knowledge Pools의 verify 단계 설계를 정리했습니다.

이번 단계의 핵심 결론은 이것입니다.

verify는 curation이 아닙니다.
그리고 memory write도 아닙니다.

connect가 relationship proposal을 만들고,
reason이 cited draft를 만들었다면,
verify는 그것이 실제 evidence로 지지되는지 감사합니다.

즉 흐름은 이렇게 됩니다.

ReasonToVerifyHandoff
-> Verifier Agent
-> VerificationResult[]
-> VerificationReport

중요한 점은 verify가 답변을 고치는 단계가 아니라는 것입니다.

verify는 각 claim/proposal/action에 대해 다음을 남깁니다.

- verified
- rejected
- unsupported
- uncertain
- stale
- needs_review

Markdown-first MVP에서는 먼저
DraftClaim이 cited Markdown section/block으로 지지되는지 검증합니다.

이후 image, PDF, audio, video는 각 미디어의 locator와 confidence에 맞춰 확장합니다.

좋은 agent memory는 유창한 답변을 바로 믿지 않고,
먼저 claim별 audit result를 남겨야 한다고 봅니다.
```

## Suggested Short Korean Post

```text
Knowledge Pools의 verify 단계 설계를 정리했습니다.

이번 결론:

verify는 curation이 아닙니다.
memory write도 아닙니다.

verify는 DraftAnswer나 RelationshipProposal을 받아서,
각 claim/proposal이 evidence로 지지되는지 감사합니다.

출력은 durable memory가 아니라:

- VerificationResult
- VerificationReport
- unsupported refs
- stale refs
- contradiction refs
- review refs

Markdown-first MVP에서는 먼저
claim -> Markdown section/block citation이 맞는지 검증합니다.

좋은 RAG/agent memory는 답변을 바로 저장하지 않고,
먼저 "이 claim은 어떤 evidence로 검증됐는가?"를 남겨야 한다고 봅니다.
```

## Suggested English Post

```text
I finished the verify architecture baseline for Knowledge Pools.

The main lesson:

verify is not curation.
It is not memory write either.

Verify consumes relationship proposals or draft answers and produces audit artifacts:

- VerificationResult
- VerificationReport
- unsupported refs
- stale evidence refs
- contradiction refs
- review refs

The first implementation target is Markdown-first answer verification:

DraftClaim
-> cited Markdown section/block
-> VerificationResult

Verification should not rewrite the answer.
It should not accept graph edges.
It should not create durable memory.

It should answer one thing clearly:

Which parts are supported, unsupported, stale, contradictory, uncertain, or review-needed?
```

## Suggested Thread Outline

```text
1. I finished the verify architecture baseline for Knowledge Pools.

2. The key distinction:
   verify is not curation.
   It produces audit results, not durable memory.

3. Verify supports two modes:
   verify_relationships
   verify_answer

4. For Markdown-first MVP:
   DraftClaim -> cited section/block -> VerificationResult

5. Assumptions stay assumptions.
   Unsupported claims become unsupported.
   Stale evidence becomes stale.

6. Media verification expands later:
   image region/OCR
   audio transcript span
   video scene/frame
   PDF page/block/table

7. Next step:
   update should turn verified outcomes into update candidates without writing durable memory directly.
```

## Repository References

- `docs/architecture/verify-baseline.md`
- `docs/architecture/connect-verify-handoff.md`
- `docs/architecture/reason-verify-handoff.md`
- `docs/architecture/media-verify-concept-proofs.md`
- `docs/architecture/verify-readiness-review.md`
- `docs/agents/verifier-agent.md`
- `docs/architecture/terminology.md`
